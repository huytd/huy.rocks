import type { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { base64_decode } from '../../utils/base64';
import { resolve } from 'path';

const IMG_WIDTH = 1200;
const IMG_HEIGHT = 600;

function wrapText(context: SKRSContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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

GlobalFonts.registerFromPath(resolve('./public', 'fonts', 'Inter-Regular.ttf'));
GlobalFonts.registerFromPath(resolve('./public', 'fonts', 'Inter-Bold.ttf'));

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

  const canvas = createCanvas(IMG_WIDTH, IMG_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#F7F8FB';
  ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

  ctx.font = "bold 35px Inter";
  ctx.fillStyle = '#253A59';
  ctx.fillText("->", 70, 95);
  ctx.fillText("/huy/rocks", 216, 95);

  ctx.font = "35px Inter";
  ctx.fillStyle = '#AAB7CA';
  ctx.fillText("/home", 111, 95);

  ctx.font = "bold 48px Inter";
  ctx.fillStyle = '#AAB7CA';
  ctx.fillText(date, 70, 290);

  ctx.font = "bold 72px Inter";
  ctx.fillStyle = '#253A59';
  wrapText(ctx, title, 70, 370, IMG_WIDTH - 80, 82);

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
}
