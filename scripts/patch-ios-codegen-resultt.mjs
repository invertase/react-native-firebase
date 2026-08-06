#!/usr/bin/env node
/**
 * NewArch-AD-21 — After iOS codegen (0.78 pin), inject `using ResultT = <Struct>;`
 * into each `Constants::Builder` so consumer apps on RN 0.84+ compile.
 *
 * Idempotent. Safe no-op when ResultT already present (0.84+ codegen or prior inject).
 * See okf-bundle/new-architecture/architecture-decisions.md#newarch-ad-21
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PACKAGES_ROOT = path.join(REPO_ROOT, 'packages');

function patchFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes('struct Builder')) {
    return false;
  }

  // For each Builder that lacks ResultT, insert alias using the enclosing struct name.
  // Template matches RN 0.84+ serializeConstantsStruct.js emission.
  let changed = false;
  const lines = original.split('\n');
  const out = [];
  let pendingStructName = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const structMatch = line.match(/^\s*struct (\w+) \{/);
    if (structMatch && !line.includes('Builder') && !line.includes('Input')) {
      pendingStructName = structMatch[1];
    }

    out.push(line);

    if (pendingStructName && /^\s*struct Builder \{/.test(line)) {
      const lookahead = lines.slice(i + 1, i + 4).join('\n');
      if (!lookahead.includes('using ResultT')) {
        out.push('        // Backwards compat for RCTTypedModuleConstants');
        out.push(`        using ResultT = ${pendingStructName};`);
        out.push('');
        changed = true;
      }
    }
  }

  if (!changed) {
    return false;
  }

  fs.writeFileSync(filePath, out.join('\n'));
  return true;
}

function walkGeneratedHeaders(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkGeneratedHeaders(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.h')) {
      files.push(full);
    }
  }
  return files;
}

let patched = 0;
for (const pkg of fs.readdirSync(PACKAGES_ROOT)) {
  const gen = path.join(PACKAGES_ROOT, pkg, 'ios', 'generated');
  for (const file of walkGeneratedHeaders(gen)) {
    if (patchFile(file)) {
      patched += 1;
      console.log(`[patch-ios-codegen-resultt] ${path.relative(REPO_ROOT, file)}`);
    }
  }
}

console.log(`[patch-ios-codegen-resultt] patched ${patched} header(s)`);
