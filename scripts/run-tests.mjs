import { build } from "esbuild";
import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const testFiles = process.argv.slice(2);
const files = testFiles.length
  ? testFiles
  : (await readdir("tests"))
      .filter((file) => file.endsWith(".test.ts"))
      .sort()
      .map((file) => `tests/${file}`);

const outdir = resolve(".test-build");
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

let passed = 0;
for (const file of files) {
  const outfile = resolve(outdir, `${basename(file).replace(/\.ts$/, "")}.mjs`);
  await build({
    entryPoints: [resolve(file)],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    logLevel: "silent",
  });

  await import(pathToFileURL(outfile).href);
  passed += 1;
  console.log(`✓ ${file}`);
}

await rm(outdir, { recursive: true, force: true });
console.log(`\n${passed} test files passed.`);
