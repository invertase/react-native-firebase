#!/usr/bin/env node
/**
 * Docs member check (blocking).
 *
 * For each package config under `.github/scripts/compare-types/configs/<pkg>.ts`:
 *   1. Every `extraInRN` name must appear (word-boundary) somewhere under
 *      `docs/<docsPkg>/**` (prose or code; a plain text mention counts),
 *      except names in `DEPRECATED_EXEMPT`, which are exempt once verified
 *      `@deprecated` in package source (see Guards below).
 *   2. Every runtime export the package's taught pages teach (value imports
 *      from `@react-native-firebase/<pkg>` inside js / jsx / javascript / ts /
 *      tsx fences, parsed with the TypeScript compiler API) must be
 *      *referenced in code* in that package's `test-expo` screen: the screen
 *      must value-import the name from the same specifier the docs import it
 *      from (so the pipelines `average` is not satisfied by the aggregate
 *      `average` of the plain firestore entry point) and the local binding
 *      must appear as an `Identifier` node outside `import` declarations.
 *      Comments and string literals do NOT count. This proves the screen
 *      references the name in code; it does not prove the control calls it
 *      (a property key or a type position also counts). A screen control for
 *      a function the pages do not teach does not fail.
 *
 * Limits of the name matching (documented, not detected):
 *   - Only named value imports teach a name. Namespace imports
 *     (`import * as x`) and default imports teach nothing, and the screen side
 *     only recognises named value imports too.
 *   - Fences marked `// codeblock-ignore` still count as taught: the marker
 *     opts a snippet out of type-checking, not out of teaching its imports.
 *   - A local binding that shadows an imported name on the screen is not
 *     detected; the name is matched by identifier text.
 *
 * Fences are parsed by the shared grammar in `scripts/lib/mdx-fences.mjs`
 * (indented and CRLF fences are fine; an unclosed or tilde fence on a taught
 * page exits 1).
 *
 * Which pages are "taught" pages is per package (see `taughtPaths`): by
 * default `docs/<docsPkg>/usage/**`; `app` also teaches from its other pages
 * (`docs/app/**`) and `firestore-pipelines` from `docs/firestore/pipelines/**`.
 * The run prints the taught-name count per package and FAILS when a package
 * that needs a screen teaches zero names (a mapping that reads no pages must
 * not turn into a silent pass).
 *
 * Guards against silent holes:
 *   - Every `packages/*` directory must have a compare-types config or an
 *     entry in EXEMPT_PACKAGES (with a reason). A stale exemption (the package
 *     has a config) fails too.
 *   - NO_SCREEN packages (docs-only by design) FAIL if a screen exists on
 *     disk, so an exemption can never hide a screen.
 *
 *   - DEPRECATED_EXEMPT lists deprecated `extraInRN` names that are NOT required
 *     in docs (the docs stop teaching them). Every entry needs a reason, and the
 *     check verifies the name is `extraInRN` for that config and that every
 *     top-level exported declaration of it under `packages/<docsPkg>/lib/**`
 *     carries an `@deprecated` JSDoc tag, so an exemption can never hide a
 *     non-deprecated API. A stale entry (config gone, name not in `extraInRN`,
 *     name not found in source, or not deprecated) fails. Exempt names that
 *     docs still mention do not fail. Names not listed stay required in docs.
 *
 * Migration guides are not packages and are not checked. Config basename
 * overrides (`perf-config` → docs/perf + perf.tsx) live in PACKAGE_OVERRIDES.
 *
 * Environment: `DOCS_MEMBER_VERBOSE=1` also prints the taught names per package
 * and each verified deprecated exemption with the file:line of its `@deprecated` tag.
 *
 * Usage: `yarn docs:member:check` (repo root).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { COMPILED_LANGS, FenceError, extractFences } from './lib/mdx-fences.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_DIR = path.join(REPO_ROOT, '.github/scripts/compare-types/configs');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');
const TEST_EXPO_APP = path.join(REPO_ROOT, 'test-expo', 'app');
const VERBOSE = Boolean(process.env.DOCS_MEMBER_VERBOSE);

/** `packages/*` directories that intentionally have no compare-types config. */
const EXEMPT_PACKAGES = {
  vertexai:
    'deprecation pointer to @react-native-firebase/ai: no compare-types config, no example screen',
};

/**
 * Docs packages that keep the extraInRN docs mention but have no example screen
 * (none today; kept so a docs-only package can be added with a reason).
 */
const NO_SCREEN = {};

/**
 * Deprecated `extraInRN` names that docs are not required to mention, keyed by
 * config basename (`.github/scripts/compare-types/configs/<name>.ts`), then
 * export name → reason (say what replaces it). Each name must be in that
 * config's `extraInRN`, and every top-level exported declaration of it under
 * `packages/<docsPkg>/lib/**` must carry an `@deprecated` JSDoc tag (verified
 * at run time). Do not add a name to hide a non-deprecated API.
 */
const DEPRECATED_EXEMPT = {
  ai: {
    GroundingAttribution: 'deprecated in source; the @deprecated tag names no replacement',
  },
  auth: {
    AppleAuthProvider: 'use OAuthProvider with provider ID `apple.com`',
    OIDCAuthProvider: 'use OAuthProvider with provider ID `oidc.<your-provider-id>`',
    OIDCProvider: 'use OAuthProvider with provider ID `oidc.<suffix>`',
  },
  crashlytics: {
    FirebaseApp: "deprecated re-export; import FirebaseApp from '@react-native-firebase/app'",
  },
  functions: {
    FirebaseApp: "deprecated re-export; import FirebaseApp from '@react-native-firebase/app'",
  },
  messaging: {
    AuthorizationStatus:
      'notification permission APIs are deprecated; use react-native-permissions or expo-notifications',
    IOSPermissions:
      'notification permission APIs are deprecated; use react-native-permissions or expo-notifications',
    hasPermission:
      'notification permission APIs are deprecated; use react-native-permissions or expo-notifications',
    requestPermission:
      'notification permission APIs are deprecated; use react-native-permissions or expo-notifications',
    onTokenRefresh:
      'FCM token APIs are deprecated; use register / onRegistered (Installation ID messaging)',
  },
};

/**
 * Config file basename (without .ts) → docs tree / screen / import specifiers /
 * taught pages. Default: docs/<name>, test-expo/app/<name>.tsx (or <name>/),
 * imports from `@react-native-firebase/<name>`, taught pages
 * `docs/<name>/usage`. `taughtPaths` entries are repo-relative files or
 * directories (directories are walked for .mdx).
 */
const PACKAGE_OVERRIDES = {
  app: {
    taughtPaths: ['docs/app'],
  },
  'perf-config': {
    docsPkg: 'perf',
    screenBase: 'perf',
    importSpecifiers: ['@react-native-firebase/perf'],
  },
  'firestore-pipelines': {
    docsPkg: 'firestore',
    screenBase: 'firestore',
    // Only value imports from the pipelines subpath count as taught for this
    // config (the plain `@react-native-firebase/firestore` imports belong to
    // the `firestore` config).
    importSpecifiers: ['@react-native-firebase/firestore/pipelines'],
    taughtPaths: ['docs/firestore/pipelines'],
  },
};

function listConfigPackages() {
  return fs
    .readdirSync(CONFIG_DIR)
    .filter(name => name.endsWith('.ts') && name !== 'empty-sdk.d.ts')
    .map(name => name.replace(/\.ts$/, ''))
    .sort();
}

function listPackageDirs() {
  return fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(PACKAGES_DIR, e.name, 'package.json')))
    .map(e => e.name)
    .sort();
}

function resolvePackage(configName) {
  const override = PACKAGE_OVERRIDES[configName] || {};
  const docsPkg = override.docsPkg || configName;
  const screenBase = override.screenBase || configName;
  const importSpecifiers = override.importSpecifiers || [`@react-native-firebase/${docsPkg}`];
  const taughtPaths = override.taughtPaths || [`docs/${docsPkg}/usage`];
  return { configName, docsPkg, screenBase, importSpecifiers, taughtPaths };
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

/**
 * Bodies of every js / javascript / jsx / ts / typescript / tsx fence,
 * including fences marked `// codeblock-ignore` (the marker only opts a
 * snippet out of type-checking, not out of teaching its imports). Exits 1 on
 * an unclosed or tilde fence.
 */
function extractCodeFences(mdxAbsPath) {
  try {
    return extractFences(mdxAbsPath, REPO_ROOT)
      .filter(fence => COMPILED_LANGS[fence.lang])
      .map(fence => fence.content);
  } catch (e) {
    if (e instanceof FenceError) {
      console.error(`[docs:member:check] ${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}

function parseTsx(fileName, text) {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
}

/**
 * Value-imported export names per module specifier in one fence. Uses the
 * TypeScript parser, so comments inside the braces, trailing comments, several
 * imports on one line and `import a, { x }` all parse. `import type` (whole
 * clause or a `type` element) is skipped; `{ x as y }` yields `x`;
 * `{ default as x }` yields nothing (not a named export).
 */
function parseValueNamedImports(fenceText) {
  const sourceFile = parseTsx('fence.tsx', fenceText);
  const result = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) {
      continue;
    }
    if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      continue;
    }
    const names = [];
    for (const element of clause.namedBindings.elements) {
      if (element.isTypeOnly) {
        continue;
      }
      const exportName = (element.propertyName || element.name).text;
      if (exportName !== 'default') {
        names.push(exportName);
      }
    }
    result.push({ specifier: statement.moduleSpecifier.text, names });
  }
  return result;
}

function taughtFiles(taughtPaths) {
  const files = [];
  for (const rel of taughtPaths) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) {
      continue;
    }
    if (fs.statSync(abs).isDirectory()) {
      files.push(...walkFiles(abs, p => p.endsWith('.mdx')));
    } else {
      files.push(abs);
    }
  }
  return files.sort();
}

function extractTaughtRuntimeNames(taughtPaths, importSpecifiers) {
  const taught = new Set();
  const specifierSet = new Set(importSpecifiers);
  const files = taughtFiles(taughtPaths);
  for (const file of files) {
    for (const fence of extractCodeFences(file)) {
      for (const { specifier, names } of parseValueNamedImports(fence)) {
        if (specifierSet.has(specifier)) {
          names.forEach(name => taught.add(name));
        }
      }
    }
  }
  return { names: [...taught].sort(), fileCount: files.length };
}

/**
 * Top-level exported declarations named `name` in one source text, as
 * `{ line, deprecatedLine }` (`deprecatedLine` is the 1-based line of the
 * `@deprecated` tag, or `null` when the declaration has none). Covers
 * function, class, interface, type alias, enum and `const`/`let`/`var`
 * exports; a re-export specifier (`export { x } from`) is not a declaration
 * and is not counted. Only top-level declarations are seen: re-export
 * specifiers, `export { A as X }` aliases, namespace members, `export import`
 * and destructured exports are not, so such a name fails closed with "not found".
 */
function findExportedDeclarations(fileName, text, name) {
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const lineOf = pos => sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  const record = statement => {
    const tag = ts.getJSDocDeprecatedTag(statement);
    return {
      line: lineOf(statement.getStart(sourceFile)),
      deprecatedLine: tag ? lineOf(tag.getStart(sourceFile)) : null,
    };
  };
  const found = [];
  for (const statement of sourceFile.statements) {
    const exported = ts
      .getModifiers(statement)
      ?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) {
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
          found.push(record(statement));
        }
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name?.text === name
    ) {
      found.push(record(statement));
    }
  }
  return found;
}

/**
 * Verifies `name` is deprecated in `packages/<docsPkg>/lib/**` (`.ts`, `.tsx`,
 * `.d.ts`): it needs at least one top-level exported declaration and every
 * such declaration must carry `@deprecated`. Returns `{ ok, detail, sites }`;
 * `sites` are `file:line` of each `@deprecated` tag.
 */
function verifyDeprecatedInSource(docsPkg, name) {
  const libDir = path.join(PACKAGES_DIR, docsPkg, 'lib');
  const wordRe = new RegExp(`\\b${escapeRegExp(name)}\\b`);
  const files = walkFiles(libDir, p => /\.(ts|tsx)$/.test(p)).sort();
  const sites = [];
  const undeprecated = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (!wordRe.test(text)) {
      continue;
    }
    const rel = path.relative(REPO_ROOT, file);
    for (const decl of findExportedDeclarations(file, text, name)) {
      if (decl.deprecatedLine === null) {
        undeprecated.push(`${rel}:${decl.line}`);
      } else {
        sites.push(`${rel}:${decl.deprecatedLine}`);
      }
    }
  }
  const searched = `packages/${docsPkg}/lib/** (${files.length} .ts/.tsx file(s))`;
  if (undeprecated.length > 0) {
    return {
      ok: false,
      sites,
      detail: `exported without an @deprecated JSDoc tag at ${undeprecated.join(', ')}`,
    };
  }
  if (sites.length === 0) {
    return {
      ok: false,
      sites,
      detail: `no top-level exported declaration found in ${searched}`,
    };
  }
  return { ok: true, sites, detail: '' };
}

function screenFiles(screenBase) {
  const files = [];
  const filePath = path.join(TEST_EXPO_APP, `${screenBase}.tsx`);
  const dirPath = path.join(TEST_EXPO_APP, screenBase);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    files.push(filePath);
  }
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    files.push(...walkFiles(dirPath, p => /\.(tsx|ts|jsx|js)$/.test(p)));
  }
  return files;
}

/**
 * What the screen files reference in code:
 *   - `identifiers`: every Identifier node outside `import` declarations
 *     (comments and string/template text are not Identifier nodes, so they
 *     never count);
 *   - `imports`: module specifier → (exported name → local binding) for value
 *     imports, so a taught name must come from the specifier the docs teach
 *     (the pipelines `average` is not the aggregate `average` from the plain
 *     firestore entry point).
 */
function collectScreenReferences(files) {
  const identifiers = new Set();
  const imports = new Map();
  const visit = node => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      if (
        ts.isStringLiteral(node.moduleSpecifier) &&
        clause &&
        !clause.isTypeOnly &&
        clause.namedBindings &&
        ts.isNamedImports(clause.namedBindings)
      ) {
        const bySpecifier = imports.get(node.moduleSpecifier.text) || new Map();
        for (const element of clause.namedBindings.elements) {
          if (!element.isTypeOnly) {
            bySpecifier.set((element.propertyName || element.name).text, element.name.text);
          }
        }
        imports.set(node.moduleSpecifier.text, bySpecifier);
      }
      return;
    }
    if (ts.isIdentifier(node)) {
      identifiers.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  for (const file of files) {
    visit(parseTsx(file, fs.readFileSync(file, 'utf8')));
  }
  return { identifiers, imports };
}

function referencedInScreen(references, importSpecifiers, name) {
  return importSpecifiers.some(specifier => {
    const local = references.imports.get(specifier)?.get(name);
    return local !== undefined && references.identifiers.has(local);
  });
}

function main() {
  const failures = [];
  const packages = listConfigPackages();
  const packageDirs = listPackageDirs();

  console.log(`[docs:member:check] configs: ${packages.length}`);

  const resolved = packages.map(resolvePackage);
  const coveredPackages = new Set(resolved.map(p => p.docsPkg));

  for (const dir of packageDirs) {
    const exemptReason = EXEMPT_PACKAGES[dir];
    if (!coveredPackages.has(dir) && !exemptReason) {
      failures.push({
        configName: dir,
        kind: 'package-unchecked',
        detail:
          `packages/${dir} has no compare-types config and is not in EXEMPT_PACKAGES in ` +
          `scripts/docs-member-check.mjs; add .github/scripts/compare-types/configs/${dir}.ts ` +
          '(or a PACKAGE_OVERRIDES entry) or exempt it there with a reason',
      });
    }
  }
  for (const [dir, reason] of Object.entries(EXEMPT_PACKAGES)) {
    if (!packageDirs.includes(dir)) {
      failures.push({
        configName: dir,
        kind: 'stale-exemption',
        detail: `EXEMPT_PACKAGES lists \`${dir}\` (${reason}) but packages/${dir} does not exist`,
      });
    } else if (coveredPackages.has(dir)) {
      failures.push({
        configName: dir,
        kind: 'stale-exemption',
        detail: `EXEMPT_PACKAGES lists \`${dir}\` but it has a compare-types config; remove the exemption`,
      });
    }
  }

  for (const configName of Object.keys(DEPRECATED_EXEMPT)) {
    if (!packages.includes(configName)) {
      failures.push({
        configName,
        kind: 'stale-deprecated-exemption',
        detail: `DEPRECATED_EXEMPT lists config \`${configName}\` but .github/scripts/compare-types/configs/${configName}.ts does not exist`,
      });
    }
  }

  for (const { configName, docsPkg, screenBase, importSpecifiers, taughtPaths } of resolved) {
    const configAbs = path.join(CONFIG_DIR, `${configName}.ts`);
    const extraNames = parseExtraInRN(configAbs);

    if (!packageDirs.includes(docsPkg)) {
      failures.push({
        configName,
        kind: 'package-missing',
        detail: `configs/${configName}.ts maps to packages/${docsPkg}/ which does not exist`,
      });
    }

    if (!fs.existsSync(path.join(DOCS_DIR, docsPkg))) {
      failures.push({
        configName,
        kind: 'docs-tree-missing',
        detail: `docs/${docsPkg}/ does not exist`,
      });
      continue;
    }

    const exemptions = DEPRECATED_EXEMPT[configName] || {};
    const verifiedExempt = new Set();
    for (const [name, reason] of Object.entries(exemptions)) {
      const where = `DEPRECATED_EXEMPT.${configName}.${name}`;
      if (typeof reason !== 'string' || reason.trim() === '') {
        failures.push({
          configName,
          kind: 'deprecated-exemption-no-reason',
          detail: `${where} needs a non-empty reason string`,
        });
        continue;
      }
      if (!extraNames.includes(name)) {
        failures.push({
          configName,
          kind: 'stale-deprecated-exemption',
          detail: `${where} is not in configs/${configName}.ts extraInRN; remove the exemption`,
        });
        continue;
      }
      const result = verifyDeprecatedInSource(docsPkg, name);
      if (!result.ok) {
        failures.push({
          configName,
          kind: 'stale-deprecated-exemption',
          detail:
            `${where} (${reason}) is not verified deprecated: ${result.detail}; ` +
            'remove the exemption (and document the name) or fix the source tag',
        });
        continue;
      }
      verifiedExempt.add(name);
      if (VERBOSE) {
        console.log(
          `[docs:member:check]   deprecated-exempt ${name}: ${reason} (@deprecated at ${result.sites.join(', ')})`,
        );
      }
    }
    if (Object.keys(exemptions).length > 0) {
      console.log(
        `[docs:member:check] ${configName}: deprecated-exempt=${verifiedExempt.size}/${Object.keys(exemptions).length} verified @deprecated in packages/${docsPkg}/lib`,
      );
    }

    const corpus = docsCorpus(docsPkg);
    for (const name of extraNames) {
      if (verifiedExempt.has(name)) {
        continue;
      }
      if (!mentionedInDocs(corpus, name)) {
        failures.push({
          configName,
          kind: 'extraInRN-undocumented',
          detail: `\`${name}\` from configs/${configName}.ts extraInRN is not mentioned in docs/${docsPkg}/**`,
        });
      }
    }

    const screens = screenFiles(screenBase);

    if (Object.hasOwn(NO_SCREEN, docsPkg)) {
      console.log(`[docs:member:check] ${configName}: no screen (${NO_SCREEN[docsPkg]})`);
      if (screens.length > 0) {
        failures.push({
          configName,
          kind: 'no-screen-but-screen-exists',
          detail:
            `\`${docsPkg}\` is in NO_SCREEN (${NO_SCREEN[docsPkg]}) but ` +
            `${screens.map(f => path.relative(REPO_ROOT, f)).join(', ')} exists; ` +
            'remove it from NO_SCREEN so its taught functions are checked',
        });
      }
      continue;
    }

    const { names: taught, fileCount } = extractTaughtRuntimeNames(taughtPaths, importSpecifiers);
    console.log(
      `[docs:member:check] ${configName}: taught=${taught.length} (from ${fileCount} page(s) under ${taughtPaths.join(', ')}), ` +
        `screen=${screens.length ? screens.map(f => path.relative(REPO_ROOT, f)).join(', ') : '(none)'}`,
    );
    if (VERBOSE) {
      console.log(`[docs:member:check]   taught names: ${taught.join(', ')}`);
    }

    if (taught.length === 0) {
      failures.push({
        configName,
        kind: 'teaches-nothing',
        detail:
          `no value imports from [${importSpecifiers.join(', ')}] found in ${fileCount} page(s) under ` +
          `${taughtPaths.join(', ')}; fix taughtPaths/importSpecifiers in PACKAGE_OVERRIDES, ` +
          'or add a `NO_SCREEN` entry with a reason',
      });
      continue;
    }

    if (screens.length === 0) {
      failures.push({
        configName,
        kind: 'screen-missing',
        detail: `pages teach [${taught.join(', ')}] but no test-expo screen at app/${screenBase}.tsx or app/${screenBase}/`,
      });
      continue;
    }

    const references = collectScreenReferences(screens);
    for (const name of taught) {
      if (!referencedInScreen(references, importSpecifiers, name)) {
        failures.push({
          configName,
          kind: 'taught-not-on-screen',
          detail:
            `\`${name}\` is taught under ${taughtPaths.join(', ')} but is not referenced in code in ` +
            `test-expo/app/${screenBase} (value-import it from [${importSpecifiers.join(', ')}] and use it)`,
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
