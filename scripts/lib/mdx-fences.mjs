/**
 * Shared fenced-code-block grammar for the docs checks
 * (`scripts/docs-snippets-tsc.mjs` and `scripts/docs-member-check.mjs`).
 *
 * One parser so both checks agree on what a fence is:
 *   - Opening fence: optional indent, 3+ backticks, optional info string. The
 *     language is the info string's first word, case-insensitive (`js{1}` is
 *     `js`). The closing fence needs at least as many backticks (indent is
 *     free). CRLF line endings are normalised, and the opening fence's indent
 *     is stripped from each body line where present (a less-indented body line
 *     is left-trimmed), which covers fences inside Tabs, admonitions and
 *     lists.
 *   - A fence with no closing fence before end of file is an error
 *     (`unclosed fence at <mdx>:<line>`), never silently run to EOF.
 *   - Tilde fences (`~~~`) are an error: the checks cannot see them, so they
 *     must be written with backticks.
 *   - A fence inside a blockquote (a line starting with `>` and then a fence)
 *     is an error (`fence inside a blockquote at <mdx>:<line> ...`): the docs
 *     lint sees such fences but the checks cannot, so move the fence out of
 *     the blockquote. A `>` inside an open fence body, or in prose without a
 *     fence, is not affected.
 *   - `// codeblock-ignore` as the first non-blank line inside a fence marks an
 *     intentionally partial snippet (see `isMarkerExcluded`).
 *
 * Errors are thrown as `FenceError`; callers print the message and exit 1.
 */
import fs from 'node:fs';
import path from 'node:path';

export const IGNORE_MARKER = '// codeblock-ignore';

/**
 * Languages the docs checks treat as code. `jsExt` is the extension a fence of
 * that language is compiled with, `jsxExt` the one used when the body is JSX,
 * and `sniffJsx` says whether a JSX-looking body upgrades `jsExt` to `jsxExt`.
 * Every other language (bash, json, java, ...) is not code to check.
 */
export const COMPILED_LANGS = {
  js: { jsExt: '.js', jsxExt: '.jsx', sniffJsx: true },
  javascript: { jsExt: '.js', jsxExt: '.jsx', sniffJsx: true },
  jsx: { jsExt: '.jsx', jsxExt: '.jsx', sniffJsx: false },
  ts: { jsExt: '.ts', jsxExt: '.tsx', sniffJsx: false },
  typescript: { jsExt: '.ts', jsxExt: '.tsx', sniffJsx: false },
  tsx: { jsExt: '.tsx', jsxExt: '.tsx', sniffJsx: false },
};

export class FenceError extends Error {}

// Opening fence: optional indent, 3+ backticks, optional info string.
const FENCE_OPEN_RE = /^([ \t]*)(`{3,})[ \t]*([^\s`]*)/;
const TILDE_FENCE_RE = /^[ \t]*~{3,}/;
// A fence opener after one or more blockquote markers (`> ```js`, `>> ~~~`).
const BLOCKQUOTE_FENCE_RE = /^[ \t]*>[> \t]*(?:`{3,}|~{3,})/;

export function findMdxFiles(dir) {
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

export function isMarkerExcluded(content) {
  const firstNonBlank = content.split('\n').find(l => l.trim().length > 0);
  return Boolean(firstNonBlank && firstNonBlank.trim().startsWith(IGNORE_MARKER));
}

/**
 * Every fenced block in an mdx file (any language), as
 * `{ relPath, lang, startLine, content }`. `startLine` is the 1-based line of
 * the opening fence; `content` has the fence's indent stripped and no `\r`.
 * Throws `FenceError` for an unclosed or tilde fence.
 */
export function extractFences(mdxAbsPath, repoRoot) {
  const relPath = path.relative(repoRoot, mdxAbsPath);
  const lines = fs.readFileSync(mdxAbsPath, 'utf8').split(/\r?\n/);
  const fences = [];
  let i = 0;
  while (i < lines.length) {
    if (TILDE_FENCE_RE.test(lines[i])) {
      throw new FenceError(
        `tilde fence at ${relPath}:${i + 1} is not supported; write the fence with backticks`,
      );
    }
    if (BLOCKQUOTE_FENCE_RE.test(lines[i])) {
      throw new FenceError(
        `fence inside a blockquote at ${relPath}:${i + 1} is not supported; move it out of the blockquote`,
      );
    }
    const openMatch = FENCE_OPEN_RE.exec(lines[i]);
    if (!openMatch) {
      i += 1;
      continue;
    }
    const indent = openMatch[1];
    const tickCount = openMatch[2].length;
    const lang = (/^[A-Za-z0-9_+-]*/.exec(openMatch[3])[0] || '').toLowerCase();
    const closeRe = new RegExp(`^[ \\t]*\`{${tickCount},}[ \\t]*$`);
    const startLine = i + 1;
    const contentLines = [];
    let j = i + 1;
    while (j < lines.length && !closeRe.test(lines[j])) {
      contentLines.push(
        lines[j].startsWith(indent)
          ? lines[j].slice(indent.length)
          : lines[j].replace(/^[ \t]+/, ''),
      );
      j += 1;
    }
    if (j >= lines.length) {
      throw new FenceError(`unclosed fence at ${relPath}:${startLine}`);
    }
    fences.push({ relPath, lang, startLine, content: contentLines.join('\n') });
    i = j + 1;
  }
  return fences;
}
