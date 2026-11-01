const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

// Pin both the exporter and its checksum so two machines generate the same data.
const VERSION = '26.4.0';
const SHA256 = '56ce960aeafc7caf034e2052ba49f878a883f7c7ca690da6eeffca9587b5e4b9';

async function main() {
  const directory = path.resolve(__dirname, '../.tools');
  const archive = path.join(directory, 'ffdec.zip');
  const destination = path.join(directory, 'ffdec');

  await fs.mkdir(directory, { recursive: true });
  let bytes;

  try {
    bytes = await fs.readFile(archive);
    console.log(`Checking cached FFDec ${VERSION}...`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    console.log(`Downloading FFDec ${VERSION}...`);

    const response = await fetch(
      `https://github.com/jindrapetrik/jpexs-decompiler/releases/download/version${VERSION}/ffdec_${VERSION}.zip`,
    );

    if (!response.ok) {
      throw new Error(`FFDec download failed: HTTP ${response.status}`);
    }

    bytes = Buffer.from(await response.arrayBuffer());
  }

  const digest = createHash('sha256').update(bytes).digest('hex');

  if (digest !== SHA256) {
    throw new Error('FFDec archive checksum does not match the pinned release');
  }

  await fs.writeFile(archive, bytes);

  if (process.platform === 'win32') {
    const quote = (value) => `'${value.replaceAll("'", "''")}'`;
    const command = `Expand-Archive -LiteralPath ${quote(archive)} -DestinationPath ${quote(
      destination,
    )} -Force`;
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
      stdio: 'inherit',
    });
  } else {
    await fs.mkdir(destination, { recursive: true });
    execFileSync('unzip', ['-o', archive, '-d', destination], { stdio: 'inherit' });
  }

  console.log('FFDec is ready. Java 17 or later must also be installed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
