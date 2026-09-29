#!/usr/bin/env node
/**
 * Docs member check — blocking.
 *
 * For each package config under `.github/scripts/compare-types/configs/<pkg>.ts`:
 *   1. Every `extraInRN` name must appear (word-boundary) somewhere under
 *      `docs/<docsPkg>/**`.
 *   2. Every runtime export the package usage page teaches (value imports from
 *      `@react-native-firebase/<pkg>` inside ```js``` / ```jsx``` fences on
 *      `docs/<docsPkg>/usage/**`) must appear in that package's `test-expo`
 *      screen source. A screen control for a function the page does not teach
 *      does not fail.
 *
 * Migration guides are not packages and are not checked. `vertexai` has no
 * compare-types config and no screen requirement. Config basename overrides
 * (`perf-config` → docs/perf + perf.tsx) live in PACKAGE_OVERRIDES below.
 *
 * Usage: `yarn docs:member:check` (repo root).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_DIR = path.join(REPO_ROOT, '.github/scripts/compare-types/configs');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const TEST_EXPO_APP = path.join(REPO_ROOT, 'test-expo', 'app');

/**
 * Config file basename (without .ts) → docs tree / screen / import specifiers.
 * Default: docs/<name>, test-expo/app/<name>.tsx (or <name>/), imports from
 * `@react-native-firebase/<name>`.
 */
const PACKAGE_OVERRIDES = {
  'perf-config': {
    docsPkg: 'perf',
    screenBase: 'perf',
    importSpecifiers: ['@react-native-firebase/perf'],
  },
  'firestore-pipelines': {
    docsPkg: 'firestore',
    screenBase: 'firestore',
    // Only fences that import the pipelines subpath count as taught for this config.
    importSpecifiers: ['@react-native-firebase/firestore/pipelines'],
  },
};

const FENCE_OPEN_RE = /^```(js|jsx)\b.*$/;
const FENCE_CLOSE_RE = /^```\s*$/;
// Value import of named bindings from a package. Skips `import type`.
const VALUE_NAMED_IMPORT_RE =
  /^[ \t]*import\s+(?!type\b)(?:[\w*{]\s*,\s*)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?[ \t]*$/gm;
const VALUE_DEFAULT_IMPORT_RE =
  /^[ \t]*import\s+(?!type\b)([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"]\s*;?[ \t]*$/gm;

function listConfigPackages() {
  return fs
    .readdirSync(CONFIG_DIR)
    .filter(name => name.endsWith('.ts') && name !== 'empty-sdk.d.ts')
    .map(name => name.replace(/\.ts$/, ''))
    .sort();
}

function resolvePackage(configName) {
  const override = PACKAGE_OVERRIDES[configName] || {};
  const docsPkg = override.docsPkg || configName;
  const screenBase = override.screenBase || configName;
  const importSpecifiers = override.importSpecifiers || [`@react-native-firebase/${docsPkg}`];
  return { configName, docsPkg, screenBase, importSpecifiers };
}

function parseExtraInRN(configAbsPath) {
  const text = fs.readFileSync(configAbsPath, 'utf8');
  const blockMatch = /extraInRN\s*:\s*\[([\s\S]*?)\]\s*,/.exec(text);
  if (!blockMatch) {
    return [];
  }
  const names = [];
  const nameRe = /name\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = nameRe.exec(blockMatch[1])) !== null) {
    names.push(m[1]);
  }
  return names;
}

function walkFiles(dir, predicate) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, predicate));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function docsCorpus(docsPkg) {
  const root = path.join(DOCS_DIR, docsPkg);
  const files = walkFiles(root, p => p.endsWith('.mdx') || p.endsWith('.md'));
  return files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
}

function mentionedInDocs(corpus, name) {
  const re = new RegExp(`\\b${escapeRegExp(name)}\\b`);
  return re.test(corpus);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractFences(mdxAbsPath) {
  const lines = fs.readFileSync(mdxAbsPath, 'utf8').split('\n');
  const fences = [];
  let i = 0;
  while (i < lines.length) {
    if (!FENCE_OPEN_RE.test(lines[i])) {
      i += 1;
      continue;
    }
    const contentLines = [];
    let j = i + 1;
    while (j < lines.length && !FENCE_CLOSE_RE.test(lines[j])) {
      contentLines.push(lines[j]);
      j += 1;
    }
    fences.push(contentLines.join('\n'));
    i = j + 1;
  }
  return fences;
}

function parseNamedBindings(inner) {
  return inner
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      // `foo as bar` → export name `foo` (what the page teaches)
      const asMatch = /^([A-Za-z_$][\w$]*)\s+as\s+[A-Za-z_$][\w$]*$/.exec(part);
      if (asMatch) {
        return asMatch[1];
      }
      const idMatch = /^([A-Za-z_$][\w$]*)$/.exec(part);
      return idMatch ? idMatch[1] : null;
    })
    .filter(Boolean);
}

function extractTaughtRuntimeNames(docsPkg, importSpecifiers) {
  const usageRoot = path.join(DOCS_DIR, docsPkg, 'usage');
  const usageFiles = walkFiles(usageRoot, p => p.endsWith('.mdx'));
  const taught = new Set();
  const specifierSet = new Set(importSpecifiers);

  for (const file of usageFiles) {
    for (const fence of extractFences(file)) {
      VALUE_NAMED_IMPORT_RE.lastIndex = 0;
      let m;
      while ((m = VALUE_NAMED_IMPORT_RE.exec(fence)) !== null) {
        const spec = m[2];
        if (!specifierSet.has(spec)) {
          continue;
        }
        for (const name of parseNamedBindings(m[1])) {
          taught.add(name);
        }
      }
      VALUE_DEFAULT_IMPORT_RE.lastIndex = 0;
      while ((m = VALUE_DEFAULT_IMPORT_RE.exec(fence)) !== null) {
        const spec = m[2];
        if (!specifierSet.has(spec)) {
          continue;
        }
        // Default import local name is not a modular export name; skip.
      }
    }
  }
  return [...taught].sort();
}

function readScreenSource(screenBase) {
  const filePath = path.join(TEST_EXPO_APP, `${screenBase}.tsx`);
  const dirPath = path.join(TEST_EXPO_APP, screenBase);
  const chunks = [];
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    chunks.push(fs.readFileSync(filePath, 'utf8'));
  }
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    for (const f of walkFiles(dirPath, p => /\.(tsx|ts|jsx|js)$/.test(p))) {
      chunks.push(fs.readFileSync(f, 'utf8'));
    }
  }
  return chunks.length ? chunks.join('\n') : null;
}

function usedInScreen(screenSource, name) {
  const re = new RegExp(`\\b${escapeRegExp(name)}\\b`);
  return re.test(screenSource);
}

function main() {
  const failures = [];
  const packages = listConfigPackages();

  console.log(`[docs:member:check] configs: ${packages.length}`);

  for (const configName of packages) {
    const { docsPkg, screenBase, importSpecifiers } = resolvePackage(configName);
    const configAbs = path.join(CONFIG_DIR, `${configName}.ts`);
    const extraNames = parseExtraInRN(configAbs);
    const corpus = docsCorpus(docsPkg);

    if (!fs.existsSync(path.join(DOCS_DIR, docsPkg))) {
      failures.push({
        configName,
        kind: 'docs-tree-missing',
        detail: `docs/${docsPkg}/ does not exist`,
      });
      continue;
    }

    for (const name of extraNames) {
      if (!mentionedInDocs(corpus, name)) {
        failures.push({
          configName,
          kind: 'extraInRN-undocumented',
          detail: `\`${name}\` from configs/${configName}.ts extraInRN is not mentioned in docs/${docsPkg}/**`,
        });
      }
    }

    const taught = extractTaughtRuntimeNames(docsPkg, importSpecifiers);
    const screenSource = readScreenSource(screenBase);

    if (taught.length === 0) {
      continue;
    }

    if (screenSource === null) {
      failures.push({
        configName,
        kind: 'screen-missing',
        detail: `usage page teaches [${taught.join(', ')}] but no test-expo screen at app/${screenBase}.tsx or app/${screenBase}/`,
      });
      continue;
    }

    for (const name of taught) {
      if (!usedInScreen(screenSource, name)) {
        failures.push({
          configName,
          kind: 'taught-not-on-screen',
          detail: `\`${name}\` is taught on docs/${docsPkg}/usage but not called/used in test-expo/app/${screenBase}`,
        });
      }
    }
  }

  if (failures.length > 0) {
    console.error(`[docs:member:check] ${failures.length} failure(s):`);
    for (const f of failures) {
      console.error(`[docs:member:check]   [${f.configName}] ${f.kind}: ${f.detail}`);
    }
    process.exit(1);
  }

  console.log('[docs:member:check] ok');
  process.exit(0);
}

main();
