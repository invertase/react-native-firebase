#!/usr/bin/env node
/**
 * Docs snippet type-check harness (blocking).
 *
 * Extracts every JavaScript / TypeScript fenced code block under
 * `docs/**\/*.mdx` into a standalone generated module, then type-checks each
 * one against the *real* `@react-native-firebase/*` package type declarations,
 * the same consumer-facing type surface `yarn tsc:compile:consumer`
 * validates (this script extends `tsconfig.consumer.json`; it does not invent
 * a separate module-resolution strategy).
 *
 * Wired into the Documentation CI job (`.github/workflows/docs.yml`) and
 * invoked via `yarn docs:tsc:check`. A failed fence exits non-zero.
 *
 * Which fences are compiled (the info string's first word, case-insensitive):
 *   `js`, `javascript` → `.js` (or `.jsx` when the body looks like JSX)
 *   `jsx`              → `.jsx`
 *   `ts`, `typescript` → `.ts`
 *   `tsx`              → `.tsx`
 * The fence grammar lives in `scripts/lib/mdx-fences.mjs`, shared with
 * `docs-member-check.mjs`: fences may be indented (inside Tabs / admonitions /
 * lists), CRLF is normalised, an unclosed fence or a `~~~` fence is an error.
 * Every other language (bash, json, java, groovy, ...) is not compiled; the
 * summary prints those fences by language so the exclusion is visible. The run
 * FAILS when no compilable fence is found at all (a mis-parse must never turn
 * into a green no-op).
 *
 * What this check does and does not enforce:
 *   - Enforces: syntax, module resolution of `@react-native-firebase/*`
 *     imports, argument / return / property types against the built
 *     `dist/typescript` declarations, and unknown identifiers.
 *   - Does NOT isolate fences from each other: all fences share one type
 *     environment, so a fence can pass only because another fence in the
 *     same run pulls in global types (a lone `console.log(1)` fails with
 *     TS2584, but passes when another fence imports `react-native`).
 *   - Does NOT enforce strict mode: the generated tsconfig sets `strict: false`
 *     and `noImplicitAny: false` because doc snippets are routinely partial
 *     (undeclared inputs, untyped callbacks). Null / undefined misuse and
 *     implicit-any parameters are therefore NOT reported here. `strictNullChecks`
 *     alone is also off: untyped-JS `useState(null)` / `useState([])` inference
 *     and optional env values would fail fences that cannot be fixed without
 *     teaching noisier code.
 *   - Does NOT report unused locals / parameters (`yarn lint:markdown` owns
 *     `no-unused-vars` and `no-undef` for js/jsx fences; see
 *     `eslint.docs-snippets.config.mjs`).
 *
 * Opt-out marker (explicit and documented; silent skipping is not supported):
 *   Put `// codeblock-ignore` as the first non-blank line *inside* the fence
 *   to exclude an intentionally partial/pseudo-code snippet from extraction.
 *   Example:
 *     ```js
 *     // codeblock-ignore: elided, see full example above
 *     onSnapshot(query, snapshot => { ... });
 *     ```
 *
 * Transforms applied to every extracted (non-excluded) block before compiling:
 *   - Top-level `import` declarations (including `import type`) are located
 *     with the TypeScript parser (so a trailing comment, two imports on one
 *     line, or a semicolon-less import are all handled) and hoisted verbatim
 *     above the wrapper, because ESM imports cannot appear inside a function
 *     body. Each hoisted line keeps its original line number, so a diagnostic
 *     on a hoisted import points at the right mdx line.
 *   - Everything else is wrapped in `(async () => { ... })().catch(...)` so
 *     bare top-level `await` (very common in docs snippets) compiles without
 *     requiring every snippet to show its own wrapping async function.
 *   - A top-level `export default ...` (common in docs' JSX component
 *     examples, e.g. `export default function Foo() { ... }`) is rewritten
 *     to `const __docSnippetDefaultExport = ...` in place, since `export`
 *     is not valid inside a function body. This preserves the right-hand
 *     side (function/class/arrow/identifier) so it type-checks; only
 *     the module-export semantics are dropped, which this harness doesn't
 *     need. Named `export { ... }` / `export const ...` forms, and the
 *     TypeScript-only `import x = require('y')` and `export = ...` forms in a
 *     ts fence, are rare in docs and unhandled (they fail, e.g. with
 *     TS1232): mark those with the ignore marker above if one ever comes up.
 *   - `jsx` / `tsx` fences (or `js` fences whose content looks like JSX) are
 *     written with a `.jsx` / `.tsx` extension so `tsc` parses them with JSX
 *     enabled; plain `js` / `ts` fences are written as `.js` / `.ts` and JSX
 *     syntax in them is a real failure (the block is mislabeled and should say
 *     ```jsx / ```tsx).
 *
 * Generated file names: `<mdx path with separators as "__">.block<N>.<ext>`,
 * e.g. `docs__auth__usage__index.block3.jsx`. Characters other than
 * `[A-Za-z0-9.-]` inside a path segment are percent-style escaped (`_` →
 * `~5f`) so `a/b.mdx` and `a__b.mdx` can never collide; a collision is a hard
 * failure. Filtering by a `docs__<pkg>` substring selects one area.
 *
 * Why the TypeScript *compiler API* and not the `tsc` CLI:
 *   Extracted blocks are independent, unrelated snippets compiled together
 *   as one batch for speed. The `tsc` CLI silently drops *semantic*
 *   diagnostics for every file in a run once *any* file in that same run has a
 *   syntactic error (e.g. a ```js fence that contains TS-only syntax), so one
 *   bad fence would blank out real type errors in every other fence. Calling
 *   `program.getSyntacticDiagnostics(sourceFile)` /
 *   `getSemanticDiagnostics(sourceFile)` per file against one shared
 *   `ts.Program` keeps each file's diagnostics independent: a batch with one
 *   syntactically broken fence next to valid fences carrying semantic errors
 *   yields zero errors from the CLI and the real errors from this path.
 *
 * Failure output: each failing fence prints `<mdx>:<line>` (the line inside
 * the mdx file of the first diagnostic), the TS code and message, and how many
 * further diagnostics that fence has. By default the first 10 failing fences
 * are printed, followed by a count of the ones not shown. Set
 * `DOCS_TSC_ALL=1` to print every failing fence. When a diagnostic is an
 * unresolved `@react-native-firebase/<pkg>` import and that package's
 * `dist/typescript` is actually missing, a hint names the prepare command from
 * `okf-bundle/testing/agent-command-policy.md`.
 *
 * Usage: `yarn docs:tsc:check` (repo root).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  COMPILED_LANGS,
  FenceError,
  IGNORE_MARKER,
  extractFences,
  findMdxFiles,
  isMarkerExcluded,
} from './lib/mdx-fences.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const GENERATED_ROOT = path.join(REPO_ROOT, '.docs-snippets-tsc');
const SNIPPETS_DIR = path.join(GENERATED_ROOT, 'snippets');
// Lives at repo root (sibling to tsconfig.consumer.json) purely so its
// `extends`/`paths` resolve with zero path-translation. Regenerated every
// run; gitignored (see root .gitignore). Written to disk (not just held
// in-memory) so the generated output can be inspected. Do not re-check a
// file with `tsc --project <this file> <file>` (TS5042: a project cannot be
// mixed with source files). To see every failing fence, run
// `DOCS_TSC_ALL=1 yarn docs:tsc:check` and filter the output by path.
const TMP_TSCONFIG = path.join(REPO_ROOT, 'tsconfig.docs-snippets.generated.json');

const MAX_PRINTED_FAILURES = 10;
const PRINT_ALL = Boolean(process.env.DOCS_TSC_ALL);

const GENERATED_GLOBS = ['js', 'jsx', 'ts', 'tsx'].map(
  ext => `.docs-snippets-tsc/snippets/**/*.${ext}`,
);
const SCRIPT_KIND_BY_EXT = {
  '.js': ts.ScriptKind.JS,
  '.jsx': ts.ScriptKind.JSX,
  '.ts': ts.ScriptKind.TS,
  '.tsx': ts.ScriptKind.TSX,
};

// Heuristic: a closing tag or a self-closing tag. Deliberately conservative
// (does not fire on plain comparisons like `a < b`) so a `js` fence only gets
// treated as JSX when it plausibly contains real JSX syntax.
const JSX_HEURISTIC_RE = /<\/[A-Za-z][\w.]*\s*>|<[A-Za-z][\w.]*(?:\s[^<>]*)?\/>/;
// Matches `await` anywhere in the fence text, including inside an already
// async nested function, not just genuine top-level await. That is fine for
// this stat's purpose (it is an informational "contains await" count, not a
// compile-affecting distinction: every fence is wrapped in the same async
// IIFE regardless), so it is reported below as "contains-await", not
// "top-level-await".
const AWAIT_HEURISTIC_RE = /\bawait\b/;
// Top-level `export default ...` (function/class/arrow/identifier) is the
// only export form common in docs' JSX component examples. `export` isn't
// valid inside a function body, so once the fence is wrapped in the async
// IIFE below this is rewritten in place to a plain `const` assignment,
// preserving the right-hand side so it type-checks.
const EXPORT_DEFAULT_RE = /^([ \t]*)export\s+default\s+/gm;
const MISSING_RNFB_MODULE_RE = /Cannot find module '@react-native-firebase\/([^'/]+)/;

/**
 * Returns the generated module text and `lineMap`: for each generated line
 * (index 0 = line 1) the 1-based line inside the fence body it came from, or
 * 0 for harness-added wrapper lines.
 */
function transform(content, ext) {
  const sourceFile = ts.createSourceFile(
    `fence${ext}`,
    content,
    ts.ScriptTarget.Latest,
    false,
    SCRIPT_KIND_BY_EXT[ext],
  );
  const imports = [];
  // UTF-16 units (not code points), to match the parser's positions.
  const chars = content.split('');
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }
    const start = statement.getStart(sourceFile);
    const end = statement.getEnd();
    imports.push({
      text: content.slice(start, end),
      bodyLine: sourceFile.getLineAndCharacterOfPosition(start).line + 1,
    });
    // Blank the import out of the body (keeping newlines and columns) so body
    // line N maps to fence line N.
    for (let k = start; k < end; k += 1) {
      if (chars[k] !== '\n') {
        chars[k] = ' ';
      }
    }
  }
  // See EXPORT_DEFAULT_RE above: rewrite in place (not hoisted, unlike
  // imports) since a `const` assignment is valid anywhere the original
  // `export default` statement was.
  const body = chars.join('').replace(EXPORT_DEFAULT_RE, '$1const __docSnippetDefaultExport = ');

  const outLines = [];
  const lineMap = [];
  const push = (text, bodyLine) => {
    outLines.push(text);
    lineMap.push(bodyLine);
  };
  for (const imp of imports) {
    imp.text.split('\n').forEach((text, k) => push(text, imp.bodyLine + k));
  }
  if (imports.length) {
    push('', 0);
  }
  push('(async () => {', 0);
  body.split('\n').forEach((text, k) => push(text, k + 1));
  push('})().catch(e => {', 0);
  push('  throw e;', 0);
  push('});', 0);
  return { text: `${outLines.join('\n')}\n`, lineMap };
}

/**
 * Collision-safe base name: path segments are escaped (anything outside
 * `[A-Za-z0-9.-]`, including `_`, becomes `~<hex>`) and joined with `__`, so
 * the separator can never appear inside an escaped segment.
 */
function sanitizeBaseName(relPath, index) {
  const withoutExt = relPath.replace(/\.mdx$/, '');
  const flat = withoutExt
    .split(/[\\/]/)
    .map(seg =>
      seg.replace(/[^A-Za-z0-9.-]/g, c => `~${c.codePointAt(0).toString(16).padStart(2, '0')}`),
    )
    .join('__');
  return `${flat}.block${index}`;
}

function describeDiagnostic(record, diagnostic) {
  let line = record.startLine;
  if (diagnostic.file && diagnostic.start !== undefined) {
    const generatedLine = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line;
    line = record.startLine + (record.lineMap[generatedLine] || 0);
  }
  return {
    line,
    code: diagnostic.code,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  };
}

function formatCounts(counts) {
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length ? entries.map(([k, v]) => `${k}=${v}`).join(', ') : '(none)';
}

function fail(message) {
  console.error(`[docs:tsc:check] ${message}`);
  process.exit(1);
}

/** Packages named by an unresolved-import diagnostic whose built declarations are absent. */
function packagesWithMissingBuild(failedRecords) {
  const missing = new Set();
  for (const r of failedRecords) {
    for (const d of r.diagnostics) {
      const m = d.code === 2307 ? MISSING_RNFB_MODULE_RE.exec(d.message) : null;
      if (
        m &&
        fs.existsSync(path.join(REPO_ROOT, 'packages', m[1], 'package.json')) &&
        !fs.existsSync(path.join(REPO_ROOT, 'packages', m[1], 'dist/typescript/lib/index.d.ts'))
      ) {
        missing.add(`@react-native-firebase/${m[1]}`);
      }
    }
  }
  return missing;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    fail(`docs directory not found: ${DOCS_DIR}`);
  }

  // Clean slate every run so stale generated files never linger.
  fs.rmSync(GENERATED_ROOT, { recursive: true, force: true });
  fs.mkdirSync(SNIPPETS_DIR, { recursive: true });

  const mdxFiles = findMdxFiles(DOCS_DIR);

  const records = [];
  const skippedByLang = new Map();
  const compiledByLang = new Map();
  const generatedNames = new Map();
  let markerExcludedCount = 0;

  for (const mdxAbsPath of mdxFiles) {
    let fences;
    try {
      fences = extractFences(mdxAbsPath, REPO_ROOT);
    } catch (e) {
      if (e instanceof FenceError) {
        fail(e.message);
      }
      throw e;
    }
    let codeIndex = 0;
    for (const fence of fences) {
      const langSpec = COMPILED_LANGS[fence.lang];
      if (!langSpec) {
        const key = fence.lang || '(no language)';
        skippedByLang.set(key, (skippedByLang.get(key) || 0) + 1);
        continue;
      }
      const index = codeIndex;
      codeIndex += 1;
      compiledByLang.set(fence.lang, (compiledByLang.get(fence.lang) || 0) + 1);

      const isJSX = langSpec.sniffJsx
        ? JSX_HEURISTIC_RE.test(fence.content)
        : langSpec.jsExt === langSpec.jsxExt;
      const record = {
        relPath: fence.relPath,
        startLine: fence.startLine,
        lang: fence.lang,
        markerExcluded: isMarkerExcluded(fence.content),
        isJSX,
        hasAwait: AWAIT_HEURISTIC_RE.test(fence.content),
        generatedAbsPath: null,
        lineMap: null,
        failed: null,
        diagnostics: [],
      };
      records.push(record);

      if (record.markerExcluded) {
        markerExcludedCount += 1;
        continue;
      }

      const ext = isJSX ? langSpec.jsxExt : langSpec.jsExt;
      const fileName = `${sanitizeBaseName(fence.relPath, index)}${ext}`;
      const nameKey = fileName.toLowerCase();
      if (generatedNames.has(nameKey)) {
        fail(
          `generated file name collision: ${fileName} for ${fence.relPath}:${fence.startLine} ` +
            `and ${generatedNames.get(nameKey)}`,
        );
      }
      generatedNames.set(nameKey, `${fence.relPath}:${fence.startLine}`);
      const generatedAbsPath = path.join(SNIPPETS_DIR, fileName);
      const generated = transform(fence.content, ext);
      fs.writeFileSync(generatedAbsPath, generated.text, 'utf8');
      record.generatedAbsPath = generatedAbsPath;
      record.lineMap = generated.lineMap;
    }
  }

  const extractedRecords = records.filter(r => !r.markerExcluded);

  if (mdxFiles.length === 0 || records.length === 0 || extractedRecords.length === 0) {
    fail(
      `no compilable fences found (mdx files: ${mdxFiles.length}, js/ts fences: ${records.length}, ` +
        `compiled: ${extractedRecords.length}). Refusing to pass on an empty run; ` +
        'check the fence parser and the docs tree.',
    );
  }

  const tmpTsconfig = {
    extends: './tsconfig.consumer.json',
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      strict: false,
      noImplicitAny: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noUncheckedIndexedAccess: false,
      rootDir: '.docs-snippets-tsc/snippets',
    },
    include: GENERATED_GLOBS,
    exclude: ['node_modules'],
  };
  fs.writeFileSync(TMP_TSCONFIG, JSON.stringify(tmpTsconfig, null, 2), 'utf8');

  const configFile = ts.readConfigFile(TMP_TSCONFIG, ts.sys.readFile);
  if (configFile.error) {
    fail(
      `failed to read ${TMP_TSCONFIG}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`,
    );
  }
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    REPO_ROOT,
    undefined,
    TMP_TSCONFIG,
  );
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors) {
      console.error(
        `[docs:tsc:check] tsconfig error TS${e.code}: ${ts.flattenDiagnosticMessageText(e.messageText, '\n')}`,
      );
    }
    fail('the generated tsconfig did not parse cleanly (see above); refusing to type-check');
  }

  // One shared Program for the whole batch (fast: parses/resolves once),
  // but diagnostics are pulled per-file below. Critically, this avoids the
  // `tsc` CLI's cross-file suppression described in the header comment: a
  // syntax error in one generated file must not blank out semantic errors
  // in the other fences.
  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

  for (const record of extractedRecords) {
    const sourceFile = program.getSourceFile(record.generatedAbsPath);
    if (!sourceFile) {
      record.failed = true;
      record.diagnostics = [
        {
          line: record.startLine,
          code: 0,
          message: 'tsc did not produce a SourceFile for this generated file',
        },
      ];
      continue;
    }
    const diagnostics = [
      ...program.getSyntacticDiagnostics(sourceFile),
      ...program.getSemanticDiagnostics(sourceFile),
    ];
    record.failed = diagnostics.length > 0;
    record.diagnostics = diagnostics.map(d => describeDiagnostic(record, d));
  }

  const cleanRecords = extractedRecords.filter(r => !r.failed);
  const failedRecords = extractedRecords.filter(r => r.failed);
  const jsxTotal = extractedRecords.filter(r => r.isJSX);
  const awaitTotal = extractedRecords.filter(r => r.hasAwait);
  const jsxClean = cleanRecords.filter(r => r.isJSX);
  const awaitClean = cleanRecords.filter(r => r.hasAwait);

  console.log('[docs:tsc:check] docs snippet type-check harness');
  console.log(`[docs:tsc:check] mdx files scanned:      ${mdxFiles.length}`);
  console.log(`[docs:tsc:check] js/ts fences found:     ${records.length}`);
  console.log(`[docs:tsc:check]   by language:          ${formatCounts(compiledByLang)}`);
  console.log(`[docs:tsc:check] marker-excluded:        ${markerExcludedCount} (${IGNORE_MARKER})`);
  console.log(`[docs:tsc:check] extracted + compiled:   ${extractedRecords.length}`);
  console.log(`[docs:tsc:check]   compiled clean:       ${cleanRecords.length}`);
  console.log(`[docs:tsc:check]   failed:               ${failedRecords.length}`);
  console.log(
    `[docs:tsc:check]   JSX fences clean:     ${jsxClean.length} / ${jsxTotal.length} JSX total`,
  );
  console.log(
    `[docs:tsc:check]   contains-await fences clean: ${awaitClean.length} / ${awaitTotal.length} await total`,
  );
  console.log(`[docs:tsc:check] not compiled (other languages): ${formatCounts(skippedByLang)}`);
  console.log(
    '[docs:tsc:check] generated output: .docs-snippets-tsc/ and tsconfig.docs-snippets.generated.json (gitignored)',
  );

  if (failedRecords.length > 0) {
    const shown = PRINT_ALL ? failedRecords : failedRecords.slice(0, MAX_PRINTED_FAILURES);
    console.log(`[docs:tsc:check] ${shown.length} of ${failedRecords.length} failing fence(s):`);
    for (const r of shown) {
      const first = r.diagnostics[0];
      const more =
        r.diagnostics.length > 1 ? ` (+${r.diagnostics.length - 1} more in this fence)` : '';
      console.log(
        `[docs:tsc:check]   ${r.relPath}:${first.line} TS${first.code} ${first.message}${more}`,
      );
      console.log(
        `[docs:tsc:check]     generated: ${path.relative(REPO_ROOT, r.generatedAbsPath)}`,
      );
    }
    if (shown.length < failedRecords.length) {
      console.log(
        `[docs:tsc:check] and ${failedRecords.length - shown.length} more failing fence(s) not shown ` +
          '(set DOCS_TSC_ALL=1 to print all)',
      );
    }

    const missingPackages = packagesWithMissingBuild(failedRecords);
    if (missingPackages.size > 0) {
      const perPackage =
        missingPackages.size <= 3
          ? `, or per package: ${[...missingPackages]
              .map(p => `\`yarn lerna run prepare --scope ${p}\``)
              .join(', ')}`
          : '';
      console.log(
        '[docs:tsc:check] hint: the built declarations (dist/typescript) for the unresolved ' +
          '@react-native-firebase/* import(s) are missing. Per okf-bundle/testing/agent-command-policy.md run ' +
          `\`yarn lerna:prepare\`${perPackage} (blocking; wait for exit 0), then re-run ` +
          '`yarn docs:tsc:check`.',
      );
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
