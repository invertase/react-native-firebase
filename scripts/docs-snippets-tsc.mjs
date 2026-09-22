#!/usr/bin/env node
/**
 * Docs snippet type-check harness — NON-BLOCKING / advisory only.
 *
 * Extracts every ```js``` / ```jsx``` fenced code block under `docs/**\/*.mdx`
 * into a standalone generated module, then type-checks each one against the
 * *real* `@react-native-firebase/*` package type declarations — the same
 * consumer-facing type surface `yarn tsc:compile:consumer` validates (this
 * script extends `tsconfig.consumer.json`; it does not invent a separate
 * module-resolution strategy).
 *
 * Not wired into `yarn lint`, `yarn lint:markdown`, `yarn lint:all`, or any CI
 * workflow. It is a standalone script an agent/author runs manually while
 * writing docs. Today's docs corpus (pre-rewrite) is expected to
 * produce many failures — that is normal; this harness's job is to exist and
 * report accurately, not to make today's docs pass.
 *
 * Opt-out marker (explicit, documented — silent skipping is not supported):
 *   Put `// codeblock-ignore` as the first non-blank line *inside* the fence
 *   to exclude an intentionally partial/pseudo-code snippet from extraction.
 *   Example:
 *     ```js
 *     // codeblock-ignore: elided, see full example above
 *     onSnapshot(query, snapshot => { ... });
 *     ```
 *
 * Transforms applied to every extracted (non-excluded) block before compiling:
 *   - `import ...;` statements are hoisted verbatim above the wrapper so ESM
 *     imports stay valid (they cannot appear inside a function body).
 *   - Everything else is wrapped in `(async () => { ... })().catch(...)` so
 *     bare top-level `await` (very common in docs snippets) compiles without
 *     requiring every snippet to show its own wrapping async function.
 *   - A top-level `export default ...` (common in docs' JSX component
 *     examples, e.g. `export default function Foo() { ... }`) is rewritten
 *     to `const __docSnippetDefaultExport = ...` in place, since `export`
 *     is not valid inside a function body. This preserves the right-hand
 *     side (function/class/arrow/identifier) so it still type-checks; only
 *     the module-export semantics are dropped, which this harness doesn't
 *     need. Named `export { ... }` / `export const ...` forms are rare in
 *     docs and remain unhandled — mark those with the ignore marker above
 *     if that ever comes up.
 *   - `jsx` fences (or `js` fences whose content looks like JSX) are written
 *     with a `.jsx` extension so `tsc` parses them with JSX enabled; plain
 *     `js` fences are written as `.js` and JSX syntax in them is a real
 *     failure (correct — that block is mislabeled and should say ```jsx).
 *
 * Why the TypeScript *compiler API* and not the `tsc` CLI:
 *   Extracted blocks are independent, unrelated snippets compiled together
 *   as one batch for speed. Empirically, the `tsc` CLI silently drops
 *   *semantic* diagnostics for every file in a run once *any* file in that
 *   same run has a syntactic error (e.g. a ```js fence that actually
 *   contains TS-only syntax) — a single bad fence would silently blank out
 *   real type errors in the other ~280 fences. Calling
 *   `program.getSyntacticDiagnostics(sourceFile)` /
 *   `getSemanticDiagnostics(sourceFile)` per file against one shared
 *   `ts.Program` does not have that problem — each file's diagnostics are
 *   independent. Confirmed by constructing a batch with one syntactically
 *   broken fence alongside otherwise-valid fences carrying real semantic
 *   errors: the CLI reports zero errors for the whole batch, while the
 *   compiler-API path above still reports the real errors on the valid
 *   fences.
 *
 * Usage: `yarn docs:tsc:check` (repo root).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const GENERATED_ROOT = path.join(REPO_ROOT, '.docs-snippets-tsc');
const SNIPPETS_DIR = path.join(GENERATED_ROOT, 'snippets');
// Lives at repo root (sibling to tsconfig.consumer.json) purely so its
// `extends`/`paths` resolve with zero path-translation. Regenerated every
// run; gitignored — see root .gitignore. Written to disk (not just held
// in-memory) so an author can reproduce a single file's result by hand:
// `yarn tsc --project tsconfig.docs-snippets.generated.json <file>`.
const TMP_TSCONFIG = path.join(REPO_ROOT, 'tsconfig.docs-snippets.generated.json');

const IGNORE_MARKER = '// codeblock-ignore';

const FENCE_OPEN_RE = /^```(js|jsx)\b.*$/;
const FENCE_CLOSE_RE = /^```\s*$/;
// Heuristic: a closing tag or a self-closing tag. Deliberately conservative
// (does not fire on plain comparisons like `a < b`) so a `js` fence only gets
// treated as JSX when it plausibly contains real JSX syntax.
const JSX_HEURISTIC_RE = /<\/[A-Za-z][\w.]*\s*>|<[A-Za-z][\w.]*(?:\s[^<>]*)?\/>/;
// Matches `await` anywhere in the fence text, including inside an already
// async nested function — not just genuine top-level await. That's fine for
// this stat's purpose (it's an informational "contains await" count, not a
// compile-affecting distinction: every fence is wrapped in the same async
// IIFE regardless), so it's reported below as "contains-await", not
// "top-level-await".
const AWAIT_HEURISTIC_RE = /\bawait\b/;
const IMPORT_STATEMENT_RE = /^[ \t]*import\s[^;]*;[ \t]*$/gm;
// Top-level `export default ...` (function/class/arrow/identifier) is the
// only export form common in docs' JSX component examples. `export` isn't
// valid inside a function body, so once the fence is wrapped in the async
// IIFE below this is rewritten in place to a plain `const` assignment,
// preserving the right-hand side so it still type-checks.
const EXPORT_DEFAULT_RE = /^([ \t]*)export\s+default\s+/gm;

function findMdxFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findMdxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

function extractFences(mdxAbsPath) {
  const relPath = path.relative(REPO_ROOT, mdxAbsPath);
  const lines = fs.readFileSync(mdxAbsPath, 'utf8').split('\n');
  const fences = [];
  let i = 0;
  while (i < lines.length) {
    const openMatch = FENCE_OPEN_RE.exec(lines[i]);
    if (!openMatch) {
      i += 1;
      continue;
    }
    const lang = openMatch[1];
    const startLine = i + 1; // 1-indexed line of the opening fence
    const contentLines = [];
    let j = i + 1;
    while (j < lines.length && !FENCE_CLOSE_RE.test(lines[j])) {
      contentLines.push(lines[j]);
      j += 1;
    }
    fences.push({
      relPath,
      lang,
      startLine,
      content: contentLines.join('\n'),
    });
    i = j + 1;
  }
  return fences;
}

function isMarkerExcluded(content) {
  const firstNonBlank = content.split('\n').find(l => l.trim().length > 0);
  return Boolean(firstNonBlank && firstNonBlank.trim().startsWith(IGNORE_MARKER));
}

function transform(content) {
  const imports = [];
  let body = content.replace(IMPORT_STATEMENT_RE, m => {
    imports.push(m.trim());
    return '';
  });
  // See EXPORT_DEFAULT_RE above: rewrite in place (not hoisted, unlike
  // imports) since a `const` assignment is valid anywhere the original
  // `export default` statement was.
  body = body.replace(EXPORT_DEFAULT_RE, '$1const __docSnippetDefaultExport = ');
  const importBlock = imports.length ? `${imports.join('\n')}\n\n` : '';
  return `${importBlock}(async () => {\n${body}\n})().catch(e => {\n  throw e;\n});\n`;
}

function sanitizeBaseName(relPath, index) {
  const withoutExt = relPath.replace(/\.mdx$/, '');
  const flat = withoutExt.replace(/[\\/]/g, '__');
  return `${flat}.block${index}`;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`[docs:tsc:check] docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  // Clean slate every run so stale generated files never linger.
  fs.rmSync(GENERATED_ROOT, { recursive: true, force: true });
  fs.mkdirSync(SNIPPETS_DIR, { recursive: true });

  const mdxFiles = findMdxFiles(DOCS_DIR);

  const records = [];
  let markerExcludedCount = 0;

  for (const mdxAbsPath of mdxFiles) {
    const fences = extractFences(mdxAbsPath);
    fences.forEach((fence, index) => {
      const record = {
        relPath: fence.relPath,
        startLine: fence.startLine,
        lang: fence.lang,
        markerExcluded: isMarkerExcluded(fence.content),
        isJSX: fence.lang === 'jsx' || JSX_HEURISTIC_RE.test(fence.content),
        hasAwait: AWAIT_HEURISTIC_RE.test(fence.content),
        generatedAbsPath: null,
        failed: null,
        firstDiagnostic: null,
      };

      if (record.markerExcluded) {
        markerExcludedCount += 1;
        records.push(record);
        return;
      }

      const ext = record.isJSX ? '.jsx' : '.js';
      const fileName = `${sanitizeBaseName(fence.relPath, index)}${ext}`;
      const generatedAbsPath = path.join(SNIPPETS_DIR, fileName);
      fs.writeFileSync(generatedAbsPath, transform(fence.content), 'utf8');
      record.generatedAbsPath = generatedAbsPath;
      records.push(record);
    });
  }

  const extractedRecords = records.filter(r => !r.markerExcluded);

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
    include: ['.docs-snippets-tsc/snippets/**/*.js', '.docs-snippets-tsc/snippets/**/*.jsx'],
    exclude: ['node_modules'],
  };
  fs.writeFileSync(TMP_TSCONFIG, JSON.stringify(tmpTsconfig, null, 2), 'utf8');

  if (extractedRecords.length > 0) {
    const configFile = ts.readConfigFile(TMP_TSCONFIG, ts.sys.readFile);
    if (configFile.error) {
      console.error(
        `[docs:tsc:check] failed to read ${TMP_TSCONFIG}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`,
      );
      process.exit(1);
    }
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, REPO_ROOT, undefined, TMP_TSCONFIG);

    // One shared Program for the whole batch (fast — parses/resolves once),
    // but diagnostics are pulled per-file below. Critically, this avoids the
    // `tsc` CLI's cross-file suppression described in the header comment: a
    // syntax error in one generated file must not blank out semantic errors
    // in the other ~280.
    const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

    for (const record of extractedRecords) {
      const sourceFile = program.getSourceFile(record.generatedAbsPath);
      if (!sourceFile) {
        record.failed = true;
        record.firstDiagnostic = 'tsc did not produce a SourceFile for this generated file';
        continue;
      }
      const diagnostics = [
        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile),
      ];
      record.failed = diagnostics.length > 0;
      if (diagnostics.length > 0) {
        record.firstDiagnostic = ts.flattenDiagnosticMessageText(diagnostics[0].messageText, '\n');
      }
    }
  }

  const cleanRecords = extractedRecords.filter(r => !r.failed);
  const failedRecords = extractedRecords.filter(r => r.failed);
  const jsxTotal = extractedRecords.filter(r => r.isJSX);
  const awaitTotal = extractedRecords.filter(r => r.hasAwait);
  const jsxClean = cleanRecords.filter(r => r.isJSX);
  const awaitClean = cleanRecords.filter(r => r.hasAwait);

  console.log('[docs:tsc:check] docs snippet type-check harness (non-blocking)');
  console.log(`[docs:tsc:check] mdx files scanned:      ${mdxFiles.length}`);
  console.log(`[docs:tsc:check] js/jsx fences found:    ${records.length}`);
  console.log(`[docs:tsc:check] marker-excluded:        ${markerExcludedCount} (${IGNORE_MARKER})`);
  console.log(`[docs:tsc:check] extracted + compiled:   ${extractedRecords.length}`);
  console.log(`[docs:tsc:check]   compiled clean:       ${cleanRecords.length}`);
  console.log(`[docs:tsc:check]   failed (expected on unrewritten docs): ${failedRecords.length}`);
  console.log(`[docs:tsc:check]   JSX fences clean:     ${jsxClean.length} / ${jsxTotal.length} JSX total`);
  console.log(
    `[docs:tsc:check]   contains-await fences clean: ${awaitClean.length} / ${awaitTotal.length} await total`,
  );
  console.log('[docs:tsc:check] generated output: .docs-snippets-tsc/ and tsconfig.docs-snippets.generated.json (gitignored)');

  if (failedRecords.length > 0) {
    console.log(`[docs:tsc:check] first ${Math.min(10, failedRecords.length)} failures:`);
    for (const r of failedRecords.slice(0, 10)) {
      console.log(
        `[docs:tsc:check]   ${r.relPath}:${r.startLine} (${path.relative(REPO_ROOT, r.generatedAbsPath)}) — ${r.firstDiagnostic}`,
      );
    }
  }

  // Advisory harness: always exit 0 when it ran successfully. Per-block
  // compile failures are the expected, informational signal on today's
  // not-yet-rewritten docs corpus — nothing invokes this script in CI, so a
  // non-zero exit here would not gate anything anyway; it would just make the
  // manual/agent invocation look like tooling failure when it is not.
  process.exit(0);
}

main();
