import sharp from 'sharp';
import * as path from 'path';

async function main() {
  const imagePath = 'resources/虾片/mayday_3d.jpg';
  const tapePath = 'resources/tapes/individual/tape_01.png';
  const outputPath = 'resources/虾片/mayday_3d_with_tape.png';

  const imageBuffer = await sharp(imagePath)
    .extend({
      top: 40, bottom: 40, left: 40, right: 40,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  const metadata = await sharp(imageBuffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error('Could not get image metadata');

  const tapeWidth = Math.round(metadata.width * 0.45);
  const tapeBuffer = await sharp(tapePath)
    .resize({ width: tapeWidth })
    .rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const tapeMetadata = await sharp(tapeBuffer).metadata();
  if (!tapeMetadata.width || !tapeMetadata.height) throw new Error('Could not get tape metadata');

  const finalHeight = metadata.height + Math.round(tapeMetadata.height * 0.6);
  const finalWidth = metadata.width;

  await sharp({
    create: {
      width: finalWidth,
      height: finalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: imageBuffer,
      top: Math.round(tapeMetadata.height * 0.6),
      left: 0
    },
    {
      input: tapeBuffer,
      top: 0,
      left: Math.round((finalWidth - tapeMetadata.width) / 2)
    }
  ])
  .png()
  .toFile(outputPath);

  console.log(`Saved stylized image with tape to ${outputPath}`);
}

main().catch(console.error);
