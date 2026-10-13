// Fails if any character in the site's source is missing from the shipped "Lab Sans" composite
// (DM Sans + the Onest subset for Hausa and Zarma letters). Coverage comes from scripts/coverage.json,
// generated with fontTools from public/fonts. Regenerate it whenever the fonts change.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const cov = JSON.parse(readFileSync(new URL("./coverage.json", import.meta.url)));
const sans = new Set(cov.sans);
const files = [];
const walk = d => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mdx?)$/.test(f) && files.push(p); } };
["src/content", "src/app", "src/components"].forEach(walk);
let missing = 0;
for (const f of files) {
  const text = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");   // comments are not shown
  for (const ch of new Set(text)) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80 || cp === 0xFE0F) continue;
    if (!sans.has(cp)) { console.error(`missing: ${ch} U+${cp.toString(16).toUpperCase().padStart(4, "0")}  (${f})`); missing++; }
  }
}
if (missing) { console.error(`\n${missing} glyph gap(s). Add the code points to a subset or the composite's unicode-range.`); process.exit(1); }
console.log(`glyphs ok: ${files.length} files checked against the Lab Sans composite`);
