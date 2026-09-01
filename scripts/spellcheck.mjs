#!/usr/bin/env node
/**
 * Runs the repo spellchecker invocation and makes unparseable frontmatter fatal.
 *
 * spellchecker-cli exits non-zero only when a file produced messages. Frontmatter it cannot
 * parse is reported on stderr and then skipped, so that page's frontmatter goes unchecked
 * while the run still exits 0. Child output is streamed through unchanged.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPELLCHECKER_BIN = createRequire(import.meta.url).resolve('spellchecker-cli/build/index.js');

// Must stay identical to the flags the lint:spellcheck script used before this wrapper existed.
const SPELLCHECKER_ARGS = [
  '--quiet',
  '--files=docs/**/*.{md,mdx}',
  '--dictionaries=./.spellcheck.dict.txt',
  '--reports=spelling.json',
  '--plugins',
  'spell',
  'indefinite-article',
  'repeated-words',
  'syntax-mentions',
  'syntax-urls',
  'frontmatter',
];

const FRONTMATTER_PARSE_FAILURE = /Failed to parse (?:YAML|TOML) frontmatter/;
const ANSI_ESCAPE = /\u001B\[[0-9;]*m/g;
// Longest overlap a chunk boundary could hide the marker across.
const CARRY_OVER = 128;

let frontmatterParseFailed = false;

function tee(source, sink) {
  let carried = '';
  source.on('data', chunk => {
    sink.write(chunk);
    const text = carried + chunk.toString('utf8').replace(ANSI_ESCAPE, '');
    if (FRONTMATTER_PARSE_FAILURE.test(text)) {
      frontmatterParseFailed = true;
    }
    carried = text.slice(-CARRY_OVER);
  });
}

const env = { ...process.env };
if (process.stdout.isTTY && env.FORCE_COLOR === undefined) {
  env.FORCE_COLOR = '1';
}

const child = spawn(process.execPath, [SPELLCHECKER_BIN, ...SPELLCHECKER_ARGS], {
  cwd: REPO_ROOT,
  env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

tee(child.stdout, process.stdout);
tee(child.stderr, process.stderr);

child.on('error', error => {
  console.error(`[lint:spellcheck] failed to start spellchecker: ${error.message}`);
  process.exitCode = 1;
});

child.on('close', (code, signal) => {
  if (signal) {
    console.error(`[lint:spellcheck] spellchecker terminated by signal ${signal}`);
    process.exitCode = 1;
    return;
  }

  if (code !== 0) {
    process.exitCode = code;
    return;
  }

  if (frontmatterParseFailed) {
    console.error(
      [
        '',
        '[lint:spellcheck] Frontmatter failed to parse, so that page was spellchecked without it.',
        '[lint:spellcheck] spellchecker-cli treats this as a warning and still exits 0; this repo',
        '[lint:spellcheck] treats it as a failure because the frontmatter is silently unchecked.',
        '[lint:spellcheck] Usual cause: an unquoted colon in a frontmatter value, for example',
        '[lint:spellcheck]     description: v27: Imagen API removal',
        '[lint:spellcheck] Fix it by quoting the whole value:',
        "[lint:spellcheck]     description: 'v27: Imagen API removal'",
      ].join('\n'),
    );
    process.exitCode = 1;
  }
});
