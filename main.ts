// The World in One Day — 23 November 2026 (Node 22, standard library only).
//
// This entry ships one front-page image, entry.png, and this program's only
// job is to check it and place an exact copy at /output/entry.png. The copy
// is byte-identical on every run: the program reads no clock, no network and
// no random source, so two runs always produce the same file.
//
// To try it outside the grader, point MAKEFUN_OUTPUT_DIR at a folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const targetPath = join(outDir, "entry.png");

function fail(message: string): never {
  throw new Error(`entry.png rejected: ${message}`);
}

// Read the image we ship.
const image = readFileSync(sourcePath);

// A PNG starts with its fixed 8-byte signature, then a 13-byte IHDR chunk
// whose first four data bytes are the width and the next four the height.
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (image.length < 33 || !image.subarray(0, 8).equals(signature)) {
  fail("missing PNG signature");
}
const chunkLength = image.readUInt32BE(8);
const chunkType = image.toString("ascii", 12, 16);
if (chunkLength !== 13 || chunkType !== "IHDR") {
  fail("first chunk is not IHDR");
}
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);

// The bounty gate caps the file at 1 MiB and 1024 by 1024 pixels.
if (image.length > MAX_BYTES) {
  fail(`size ${image.length} bytes exceeds the ${MAX_BYTES}-byte cap`);
}
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`dimensions ${width}x${height} exceed the ${MAX_SIDE}x${MAX_SIDE} cap`);
}

// Ship exactly the bytes that were just checked.
mkdirSync(outDir, { recursive: true });
writeFileSync(targetPath, image);
