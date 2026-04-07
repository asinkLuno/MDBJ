import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

/**
 * Replicates the Gaussian blur from src/py/blur.py using sharp.
 * OpenCV radius=50 with sigma=0 results in sigma = 0.3 * (50 - 1) + 0.8 = 15.5
 */
export async function ensureBlurredLogo(
  inputPath: string = "resources/虾片/mayday_logo.png",
  outputPath: string = "resources/虾片/guided_mayday_logo.png",
  sigma: number = 15.5,
) {
  if (!existsSync(inputPath)) {
    console.warn(`Input image not found: ${inputPath}`);
    return;
  }

  const outDir = dirname(outputPath);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  console.log(`Blurring ${inputPath} (sigma=${sigma}) -> ${outputPath}...`);

  await sharp(inputPath).blur(sigma).toFile(outputPath);

  console.log("✅ Blur processing complete.");
}
