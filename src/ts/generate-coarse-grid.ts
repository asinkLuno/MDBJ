const { createCanvas } = require("@napi-rs/canvas");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateGrid() {
  const width = 3591;
  const height = 2404;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Grid color from stats: min (145, 203, 174)
  const gridColor = "rgb(145, 203, 174)";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 15; // Thicker lines

  const step = 250; // Larger cells

  // Draw vertical lines
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const buffer = canvas.toBuffer("image/png");

  // Apply Gaussian Blur with sharp
  const blurredBuffer = await sharp(buffer)
    .blur(20) // Moderate blur for softness but still visible structure
    .toBuffer();

  const outputPath = "resources/field_notes/grid_coarse_blurred.png";
  fs.writeFileSync(outputPath, blurredBuffer);
  console.log(`Generated coarse blurred grid at ${outputPath}`);
}

generateGrid().catch(console.error);
