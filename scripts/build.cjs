const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Rebuild both module formats from the same source, without stale declarations.
const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') {
  throw new Error('Invalid build output');
}

fs.rmSync(dist, { recursive: true, force: true });

// Keep data emission and declaration generation in the same release build path.
for (const config of ['rollup.config.mjs', 'rollup-declarations.config.mjs']) {
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/rollup/dist/bin/rollup'), '--config', config],
    { cwd: root, stdio: 'inherit' },
  );
}
