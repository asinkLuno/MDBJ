import { execSync } from "child_process";
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = "resources/field_notes/output";
const SOURCE_FILE = join(__dirname, "pages/page-00.ts");
const BACKUP_FILE = join(__dirname, "pages/page-00.ts.bak");

// Ranges
const STEPS = Array.from({ length: 21 }, (_, i) => 10 + i); // 10-30
const LINEWIDTHS = Array.from({ length: 10 }, (_, i) => 1 + i); // 1-10
const BLURS = Array.from({ length: 9 }, (_, i) => 2 + i); // 2-10

// Total combinations: 21 * 10 * 9 = 1890
// That's a lot. Let's start with a subset if needed, but let's do all.
const combinations: Array<{ step: number; linewidth: number; blur: number }> = [];

for (const step of STEPS) {
  for (const linewidth of LINEWIDTHS) {
    for (const blur of BLURS) {
      combinations.push({ step, linewidth, blur });
    }
  }
}

console.log(`Total combinations: ${combinations.length}`);

function updateConfig(step: number, linewidth: number, blur: number): void {
  let content = readFileSync(SOURCE_FILE, "utf-8");

  // Replace step value
  content = content.replace(/step:\s*\d+/, `step: ${step}`);
  // Replace lineWidth value
  content = content.replace(/lineWidth:\s*\d+/, `lineWidth: ${linewidth}`);
  // Replace blur value in backgroundGrid
  content = content.replace(/blur:\s*\d+(\s*,?\s*\n)/, `blur: ${blur}$1`);

  writeFileSync(SOURCE_FILE, content, "utf-8");
}

function buildPage(): void {
  execSync("npm run build -- page-00", {
    cwd: join(__dirname, "../.."),
    stdio: "inherit",
  });
}

function renameOutput(step: number, linewidth: number, blur: number): void {
  const suffix = `s${step}-lw${linewidth}-b${blur}`;
  const src = join(__dirname, "../..", OUTPUT_DIR, "page-00.png");
  const dest = join(__dirname, "../..", OUTPUT_DIR, `page-00-${suffix}.png`);

  copyFileSync(src, dest);
  console.log(`  -> page-00-${suffix}.png`);
}

async function main() {
  // Backup original
  copyFileSync(SOURCE_FILE, BACKUP_FILE);
  console.log("Backup created: page-00.ts.bak");

  let count = 0;
  for (const { step, linewidth, blur } of combinations) {
    count++;
    console.log(
      `\n[${count}/${combinations.length}] step=${step}, linewidth=${linewidth}, blur=${blur}`,
    );

    updateConfig(step, linewidth, blur);
    buildPage();
    renameOutput(step, linewidth, blur);
  }

  // Restore original
  copyFileSync(BACKUP_FILE, SOURCE_FILE);
  console.log("\nRestored original page-00.ts");
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
