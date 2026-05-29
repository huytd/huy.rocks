import os
import modal
import subprocess

app = modal.App("llama-logits-kld")

LLAMA_CUDA_URL = "https://github.com/ai-dock/llama.cpp-cuda/releases/download/b9279/llama.cpp-b9279-cuda-12.8-amd64.tar.gz"

vol = modal.Volume.from_name("qwen3-6-kld-vol", create_if_missing=True)

image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.4.0-runtime-ubuntu22.04",
        add_python="3.11",
    )
    .apt_install("wget", "tar", "libgomp1", "unzip")
    .run_commands(
        f"wget -q {LLAMA_CUDA_URL} -O /tmp/llama-cuda.tar.gz",
        "mkdir -p /llama-bin && tar -xzf /tmp/llama-cuda.tar.gz -C /llama-bin --strip-components=1",
        "echo '/llama-bin' >> /etc/ld.so.conf.d/llama.conf && ldconfig || true",
        "echo '/llama-bin/lib' >> /etc/ld.so.conf.d/llama.conf && ldconfig || true",
    )
    .pip_install("huggingface_hub")
)

HF_REPO = "unsloth/Qwen3.6-27B-GGUF"
MODEL_DIR = "/vol/model"
MODEL_SHARDS = [
    "Qwen3.6-27B-BF16-00001-of-00002.gguf",
    "Qwen3.6-27B-BF16-00002-of-00002.gguf",
]
BF16_MODEL_FILE = MODEL_SHARDS[0]
LOGITS_FILE = "/vol/logits-bf16.dat"


def ensure_base_model():
    from huggingface_hub import hf_hub_download

    model_dir = os.path.join(MODEL_DIR, "BF16")
    os.makedirs(model_dir, exist_ok=True)
    download_occurred = False

    for shard in MODEL_SHARDS:
        shard_path = os.path.join(model_dir, shard)
        if not os.path.exists(shard_path):
            print(f"Downloading {shard} from {HF_REPO}...")
            hf_hub_download(
                repo_id=HF_REPO,
                filename="BF16/" + shard,
                local_dir=MODEL_DIR,
                local_dir_use_symlinks=False,
            )
            download_occurred = True
        else:
            print(f"{shard} already exists in volume. Skipping download.")

    if download_occurred:
        print("Committing downloaded model shards to volume...")
        vol.commit()


def resolve_model_path(source: str, value: str) -> str:
    if source == "volume":
        return value

    if source == "hf":
        from huggingface_hub import hf_hub_download

        if "::" not in value:
            raise ValueError("HF target must be formatted as 'repo_id::filename'")
        repo_id, filename = value.split("::", 1)
        local_dir = f"/tmp/hf_models/{repo_id.replace('/', '__')}"
        print(f"Downloading {filename} from {repo_id} ...")
        path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=local_dir,
            local_dir_use_symlinks=False,
        )
        print(f"Downloaded to {path}")
        return path

    raise ValueError(f"Unknown source: {source!r}. Use 'volume' or 'hf'.")


@app.function(
    image=image,
    gpu="A100-80GB",
    timeout=14400,
    volumes={"/vol": vol},
)
def run_kld_compare(source: str, value: str, label: str):
    import glob

    matches = glob.glob("/llama-bin/**/llama-perplexity", recursive=True)
    assert matches, "llama-perplexity binary not found!"
    binary = matches[0]

    # Download wikitext-2 test set
    subprocess.run(
        [
            "wget", "-q",
            "https://huggingface.co/datasets/ggml-org/ci/resolve/main/wikitext-2-raw-v1.zip",
            "-O", "/tmp/wikitext.zip",
        ],
        check=True,
    )
    subprocess.run(["unzip", "-q", "/tmp/wikitext.zip", "-d", "/tmp/wikitext"], check=True)
    dataset = "/tmp/wikitext/wikitext-2-raw/wiki.test.raw"

    # Step 1: ensure base model exists on volume, then dump reference logits
    ensure_base_model()

    if not os.path.exists(LOGITS_FILE):
        print("=== Step 1: Dumping BF16 reference logits ===")
        result = subprocess.run(
            [
                binary,
                "-m", f"{MODEL_DIR}/BF16/{BF16_MODEL_FILE}",
                "-f", dataset,
                "-c", "8192",
                "-ngl", "99",
                "-ctk", "q8_0",
                "-ctv", "q8_0",
                "--save-all-logits", LOGITS_FILE,
            ],
            capture_output=True,
            text=True,
        )
        print(result.stdout)
        print(result.stderr)
        vol.commit()
    else:
        print(f"=== Step 1: Skipping — logits already at {LOGITS_FILE} ===")

    # Step 2: resolve model and run KLD
    print(f"\n=== Step 2 [{label}]: Resolving model path ===")
    model_path = resolve_model_path(source, value)

    print(f"=== Step 2 [{label}]: Computing KL divergence ===")
    result = subprocess.run(
        [
            binary,
            "-m", model_path,
            "-f", dataset,
            "-c", "8192",
            "-ngl", "99",
            "-ctk", "q8_0",
            "-ctv", "q8_0",
            "--kl-divergence-base", LOGITS_FILE,
            "--kl-divergence",
        ],
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    print(result.stderr)

    # Persist results to volume
    kld_output = f"/vol/kld-{label}.txt"
    with open(kld_output, "w") as f:
        f.write(result.stdout)
        f.write(result.stderr)
    vol.commit()
    print(f"Results saved to {kld_output}")

    return result.stdout + result.stderr


@app.local_entrypoint()
def main(
    source: str,
    value: str,
    label: str = "",
):
    """
    Examples:

      # volume model
      modal run kld.py --source volume --value /vol/model/Qwen3.6-27B-attn_q5_q3.gguf --label attn_q5_q3

      # huggingface model  (repo_id::filename)
      modal run kld.py --source hf --value "unsloth/Qwen3.6-27B-GGUF::Qwen3.6-27B-Q4_K_M.gguf" --label Q4_K_M
    """
    if not label:
        label = value.split("::")[-1].replace(".gguf", "")

    output = run_kld_compare.remote(source=source, value=value, label=label)
    print(output)

