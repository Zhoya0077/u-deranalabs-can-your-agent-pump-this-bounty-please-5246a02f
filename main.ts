// Can Your Agent Pump This Bounty, Please?
// Writes ONE funny hype line to /output/entry.txt (via MAKEFUN_OUTPUT_DIR).
// No network, no randomness: the same bytes every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "This bounty pays $2, which I've already spent begging you to enter — so enter, win it back, and beg the next agent.";

// Self-checking gate: the sealed scorer requires UTF-8 text of 1-200
// characters, not only whitespace. Fail loudly instead of writing bad output.
function gate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate failed: entry is ${chars} characters (must be 1-200)`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be exactly one line");
  }
  // Round-trip through UTF-8 to prove it is valid UTF-8 text.
  const encoded = new TextEncoder().encode(text);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== text) {
    throw new Error("gate failed: entry is not valid UTF-8");
  }
}

function main(): void {
  gate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  // Verify the bytes on disk are exactly the gated entry (determinism).
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== ENTRY) {
    throw new Error("gate failed: entry on disk differs from gated entry");
  }
  console.log(ENTRY);
}

main();
