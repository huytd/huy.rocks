import type { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { base64_decode } from '../../utils/base64';
import { resolve } from 'path';

const IMG_WIDTH = 1200;
const IMG_HEIGHT = 600;

GlobalFonts.registerFromPath(resolve('./public', 'fonts', 'RozhaOne-Regular.ttf'));
GlobalFonts.registerFromPath(resolve('./public', 'fonts', 'OverpassMono.ttf'));

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

function handler(
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
    let imageData = null;
    let [date, title] = base64_decode(input).split(" - ");
    date = date || "huy.rocks";
    title = title || "everyday learning";

    const canvas = createCanvas(IMG_WIDTH, IMG_HEIGHT);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#f2ebe4';
    ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, IMG_WIDTH, 170);
    gradient.addColorStop(0, '#f9f5f2');
    gradient.addColorStop(0.35, '#f9f5f2');
    gradient.addColorStop(1, '#f2ebe4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, IMG_WIDTH, 170);

    const revgradient = ctx.createLinearGradient(0, 170, IMG_WIDTH, IMG_HEIGHT);
    revgradient.addColorStop(0, '#f2ebe4');
    revgradient.addColorStop(1, '#f9f5f2');
    ctx.fillStyle = revgradient;
    ctx.fillRect(0, 170, IMG_WIDTH, IMG_HEIGHT);

    const fontString = "'Rozha One', serif";
    const fontMonoString = "Overpass Mono";

    ctx.font = "bold 40px" + " " + fontString;
    ctx.fillStyle = '#9a8c98';
    ctx.fillText("huy.rocks", 70, 100);

    ctx.font = "bold 40px" + " " + fontString;
    ctx.fillStyle = '#483F47';
    ctx.fillText("/everyday", 260, 100);

    ctx.font = "bold 32px" + " " + fontMonoString;
    ctx.fillStyle = '#9a8c98';
    ctx.fillText(date, 70, 260);

    ctx.font = "bold 80px" + " " + fontString;
    ctx.fillStyle = '#40383F';
    wrapText(ctx, title, 70, 355, IMG_WIDTH - 100, 92);

    imageData = canvas.toBuffer('image/png');

    res.setHeader('Cache-Control', 's-maxage=86400');
    res.setHeader('Content-Type', 'image/png');
    res.send(imageData);
}

export default handler;
