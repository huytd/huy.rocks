// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas, registerFont, CanvasRenderingContext2D } from 'canvas';
import { base64_decode } from '../../utils/base64';

const IMG_WIDTH = 1200;
const IMG_HEIGHT = 600;

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  var words = text.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let input = "";
  const inputs = req.query["t"] ?? "";
  if (typeof inputs !== "string") {
    input = inputs[0];
  } else {
    input = inputs;
  }
  let [date, title] = base64_decode(input).split(" - ");
  date = date || "huy.rocks";
  title = title || "everyday learning";

  registerFont("public/fonts/Inter-Regular.ttf", {
    family: "Inter",
    weight: "normal"
  });
  registerFont("public/fonts/Inter-Bold.ttf", {
    family: "Inter",
    weight: "bold"
  });

  const canvas = createCanvas(IMG_WIDTH, IMG_HEIGHT);
  const ctx = canvas.getContext("2d");
  ctx.filter = 'best';
  ctx.fillStyle = '#F7F8FB';
  ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
  ctx.textBaseline = "top";

  ctx.font = "bold 35px Inter";
  ctx.fillStyle = '#253A59';
  ctx.fillText("->", 70, 70);
  ctx.fillText("/huy/rocks", 216, 70);

  ctx.font = "35px Inter";
  ctx.fillStyle = '#AAB7CA';
  ctx.fillText("/home", 111, 70);

  ctx.font = "bold 48px Inter";
  ctx.fillStyle = '#AAB7CA';
  ctx.fillText(date, 70, 240);

  ctx.font = "bold 72px Inter";
  ctx.fillStyle = '#253A59';
  wrapText(ctx, title, 70, 300, IMG_WIDTH - 80, 82);

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
}
