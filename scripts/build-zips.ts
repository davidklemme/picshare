import { execFileSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "fs";
import path from "path";
import { decryptZipPassword } from "../lib/crypto";
import { getPhotoSubmissions } from "../lib/db";

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".cr2"];

function safeFolderName(value: string): string {
  return value.trim().replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "familie";
}

function extractNumbers(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number);
}

function findRanges(numbers: number[]): Array<{ min: number; max: number }> {
  if (numbers.length === 0) return [];
  const sorted = [...numbers].sort((a, b) => a - b);
  const ranges: Array<{ min: number; max: number }> = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - prev > 1) {
      ranges.push({ min: rangeStart, max: prev });
      rangeStart = sorted[i];
    }
    prev = sorted[i];
  }
  ranges.push({ min: rangeStart, max: prev });
  return ranges;
}

function extractFileNumber(filename: string): number | null {
  const match = filename.match(/(\d+)\.[^.]+$/);
  return match ? Number(match[1]) : null;
}

async function main() {
  const sourceDir = process.argv[2];
  const targetDir = process.argv[3];

  if (!sourceDir || !targetDir) {
    console.error("Usage: tsx scripts/build-zips.ts <source-dir> <target-dir>");
    process.exit(1);
  }
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const tempDir = path.join(process.cwd(), "temp_sort");
  mkdirSync(targetDir, { recursive: true });
  mkdirSync(tempDir, { recursive: true });

  const sourceFiles = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const submissions = await getPhotoSubmissions();
  console.log(`Found ${submissions.length} submission(s).\n`);

  for (const submission of submissions) {
    const familyFolder = safeFolderName(submission.family_name);
    const requestedNumbers = extractNumbers(submission.image_numbers);

    if (requestedNumbers.length === 0) {
      console.log(`[-] Skipping ${familyFolder}: no image numbers.`);
      continue;
    }

    const familyTempDir = path.join(tempDir, familyFolder);
    if (existsSync(familyTempDir)) rmSync(familyTempDir, { recursive: true, force: true });
    mkdirSync(familyTempDir, { recursive: true });

    console.log(`[+] Collecting photos for ${familyFolder} (${submission.child_name})...`);
    const copiedFiles = new Set<string>();
    const missingNumbers: number[] = [];

    // First pass: exact matches
    for (const number of requestedNumbers) {
      const numStr = String(number);
      const found = sourceFiles.find(
        (name) =>
          name.includes(numStr) && SUPPORTED_EXTENSIONS.includes(path.extname(name).toLowerCase()),
      );
      if (found && !copiedFiles.has(found)) {
        copyFileSync(path.join(sourceDir, found), path.join(familyTempDir, found));
        copiedFiles.add(found);
      } else if (!found) {
        missingNumbers.push(number);
      }
    }

    // Second pass: range-based fallback for missing numbers
    if (missingNumbers.length > 0) {
      const ranges = findRanges(missingNumbers);
      for (const range of ranges) {
        const rangeFiles = sourceFiles.filter((name) => {
          if (!SUPPORTED_EXTENSIONS.includes(path.extname(name).toLowerCase())) return false;
          const fileNum = extractFileNumber(name);
          return fileNum !== null && fileNum >= range.min && fileNum <= range.max;
        });
        for (const file of rangeFiles) {
          if (!copiedFiles.has(file)) {
            copyFileSync(path.join(sourceDir, file), path.join(familyTempDir, file));
            copiedFiles.add(file);
            console.log(`    [~] Range fallback: ${file} (for ${range.min}-${range.max})`);
          }
        }
        if (rangeFiles.length === 0) {
          console.log(`    [!] No files in range ${range.min}-${range.max}`);
        }
      }
    }

    const copiedCount = copiedFiles.size;

    if (copiedCount === 0) {
      console.log("    [-] No photos found. Skipping ZIP.");
      rmSync(familyTempDir, { recursive: true, force: true });
      continue;
    }

    // Decrypted only for the moment it's handed to `zip`, never written to disk.
    const zipPassword = decryptZipPassword(submission.encrypted_zip_password);
    const zipTargetPath = path.join(targetDir, `${familyFolder}.zip`);
    if (existsSync(zipTargetPath)) rmSync(zipTargetPath);

    console.log(`    [*] Creating password-protected ZIP for ${familyFolder}...`);
    try {
      // execFileSync (no shell) so the password never passes through shell
      // interpolation, matching how the original Python script called `zip`.
      execFileSync("zip", ["-P", zipPassword, "-r", zipTargetPath, familyFolder], {
        cwd: tempDir,
        stdio: "pipe",
      });
      console.log(`    [OK] Created: ${path.basename(zipTargetPath)}`);
    } catch (error) {
      console.error(`    [X] Zip failed: ${(error as Error).message}`);
    } finally {
      rmSync(familyTempDir, { recursive: true, force: true });
    }
  }

  rmSync(tempDir, { recursive: true, force: true });
  console.log("\nDone.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
