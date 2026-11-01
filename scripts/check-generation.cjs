const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

// Hash generated sources as well as provenance, so a no-op export must preserve both.
function hashes() {
  const entries = [];
  for (const dir of ['src/json', 'src/symbols', 'src/svg', 'src/swf']) {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, name);
      if (fs.statSync(file).isFile()) {
        entries.push([file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')]);
      }
    }
  }

  return JSON.stringify(entries);
}

const before = hashes();
execFileSync(process.execPath, ['scripts/export-swf.cjs'], { stdio: 'inherit' });
if (hashes() !== before) {
  throw new Error('Generation changed checked-in source');
}

console.log('Deterministic generation verified.');
