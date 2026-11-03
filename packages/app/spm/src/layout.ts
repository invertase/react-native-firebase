import fs from 'fs';
import path from 'path';

import type { RnfbPackage } from './packages';
import { exportedImportSource, type Target } from './targets';

/**
 * Lays out `packageDir` so every target path lies inside the package, as SwiftPM requires:
 *
 *   src/<Module>              -> the package's `ios/` folder
 *   headers/<Module>/*.h      -> the module's headers, plus the `<Module>-Swift.h` shim
 *   Targets/<Target>/root     -> ../../src/<Module>
 *   Targets/<Target>/headers  -> ../../headers (ObjC targets)
 *   Targets/<Target>/Public/  module headers, empty unless the target exports a module
 *
 * Files are rewritten only when their content changes, so Xcode does not resolve packages again.
 */
export function writeLayout(
  packageDir: string,
  packages: RnfbPackage[],
  targets: Target[],
  manifest: string,
): void {
  const modules = new Set(packages.map(pkg => pkg.module));
  pruneChildren(path.join(packageDir, 'src'), modules);
  pruneChildren(path.join(packageDir, 'headers'), modules);
  pruneChildren(path.join(packageDir, 'Targets'), new Set(targets.map(target => target.name)));

  for (const pkg of packages) {
    const sourceLink = path.join(packageDir, 'src', pkg.module);
    ensureSymlink(path.relative(path.dirname(sourceLink), path.join(pkg.root, 'ios')), sourceLink);

    const headersDir = path.join(packageDir, 'headers', pkg.module);
    const swiftShim = pkg.swiftSources.length > 0 ? `${pkg.module}-Swift.h` : undefined;
    pruneChildren(headersDir, new Set(swiftShim ? [...pkg.headers, swiftShim] : pkg.headers));
    for (const header of pkg.headers) {
      ensureSymlink(
        path.join('..', '..', 'src', pkg.module, pkg.sourceFolder, header),
        path.join(headersDir, header),
      );
    }
    if (swiftShim) {
      // ObjC sources include `<Module/Module-Swift.h>`, which SwiftPM never writes to a search path.
      writeIfChanged(path.join(headersDir, swiftShim), `@import ${pkg.module};\n`);
    }
  }

  for (const target of targets) {
    const targetDir = path.join(packageDir, 'Targets', target.name);
    ensureSymlink(path.join('..', '..', 'src', target.module), path.join(targetDir, 'root'));

    if (target.kind === 'swift') {
      if (target.exportedImport) {
        writeIfChanged(
          path.join(targetDir, exportedImportSource(target.exportedImport)),
          `@_exported import ${target.exportedImport}\n`,
        );
      }
      continue;
    }

    ensureSymlink(path.join('..', '..', 'headers'), path.join(targetDir, 'headers'));
    const publicDir = path.join(targetDir, 'Public');
    const names = target.moduleHeaders.map(header => path.basename(header));
    pruneChildren(publicDir, new Set(names.length > 0 ? [...names, 'module.modulemap'] : []));
    fs.mkdirSync(publicDir, { recursive: true });
    if (names.length > 0) {
      for (const header of target.moduleHeaders) {
        ensureSymlink(path.join('..', header), path.join(publicDir, path.basename(header)));
      }
      // Explicit `header` entries, not an umbrella directory: clang maps a header to an
      // umbrella-directory module by its directory, so an `#import "X.h"` found next to the
      // includer would be parsed again textually and redefine the module's classes.
      writeIfChanged(
        path.join(publicDir, 'module.modulemap'),
        `module ${target.name} {\n${names.map(name => `  header "${name}"\n`).join('')}  export *\n}\n`,
      );
    }
  }

  writeIfChanged(path.join(packageDir, 'Package.swift'), manifest);
}

// rmSync removes a symlink without following it, so pruning `src/<Module>` keeps the package's ios/.
function pruneChildren(dir: string, keep: Set<string>): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const name of fs.readdirSync(dir)) {
    if (!keep.has(name)) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  }
}

function ensureSymlink(target: string, link: string): void {
  if (readLink(link) === target) {
    return;
  }
  fs.rmSync(link, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(target, link);
}

function readLink(link: string): string | undefined {
  try {
    return fs.readlinkSync(link);
  } catch {
    return undefined;
  }
}

function writeIfChanged(file: string, content: string): void {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) {
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
