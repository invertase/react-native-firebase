const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.join(__dirname, '..', 'lib');
const destinationRoot = path.join(__dirname, '..', 'dist', 'typescript', 'lib');

function copySupportDeclarations(currentDir) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const sourcePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      copySupportDeclarations(sourcePath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.d.ts')) {
      continue;
    }

    const sourceStem = sourcePath.slice(0, -'.d.ts'.length);
    if (fs.existsSync(`${sourceStem}.ts`) || fs.existsSync(`${sourceStem}.tsx`)) {
      continue;
    }

    const relativePath = path.relative(sourceRoot, sourcePath);
    const destinationPath = path.join(destinationRoot, relativePath);

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

copySupportDeclarations(sourceRoot);
