#!/usr/bin/env node
/**
 * Run `mellifera-cli reserve` with the caller argv unchanged, then pass that
 * grant JSON to mellifera-apply-reservation.js.
 *
 * No deadline or extra flag is inserted. Flags are not split or re-emitted.
 * Default outputs are gitignored runner files, not a session store.
 *
 * usage: mellifera-reserve-apply.js [reserve args...]
 */
'use strict';

const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const APPLY = path.join(SCRIPT_DIR, 'mellifera-apply-reservation.js');
const DEFAULT_ENV = path.join(REPO_ROOT, 'tests', '.mellifera-session.env');
const DEFAULT_PORTS = path.join(REPO_ROOT, 'tests', 'mellifera.env.json');

function resolveCli() {
  const fromEnv = process.env.MELLIFERA_CLI && process.env.MELLIFERA_CLI.trim();
  return fromEnv || 'mellifera-cli';
}

function fail(message) {
  console.error(`mellifera-reserve-apply: ${message}`);
  process.exit(1);
}

/** First JSON object in reserve stdout. Shell export lines after it are ignored. */
function extractGrantJson(stdout) {
  const start = stdout.indexOf('{');
  if (start < 0) {
    fail('reserve produced no grant JSON');
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < stdout.length; i++) {
    const ch = stdout[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        const slice = stdout.slice(start, i + 1);
        try {
          JSON.parse(slice);
        } catch (err) {
          fail(`reserve grant JSON is invalid: ${err.message}`);
        }
        return slice;
      }
    }
  }
  fail('reserve produced incomplete grant JSON');
}

function runApply(grantJson) {
  const envFile = process.env.MELLIFERA_APPLY_ENV_FILE
    ? path.resolve(process.env.MELLIFERA_APPLY_ENV_FILE)
    : DEFAULT_ENV;
  const portsFile = process.env.MELLIFERA_APPLY_PORTS_FILE
    ? path.resolve(process.env.MELLIFERA_APPLY_PORTS_FILE)
    : DEFAULT_PORTS;
  const child = spawn(process.execPath, [APPLY, grantJson, envFile, portsFile], {
    stdio: 'inherit',
    cwd: REPO_ROOT,
  });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }
    process.exit(code == null ? 1 : code);
  });
}

function main() {
  const user = process.argv.slice(2);
  const child = spawn(resolveCli(), ['reserve', ...user], {
    stdio: ['inherit', 'pipe', 'inherit'],
  });
  let stdout = '';
  child.stdout.on('data', chunk => {
    stdout += chunk.toString();
    process.stdout.write(chunk);
  });
  child.on('error', err => {
    fail(err.message);
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }
    if (code !== 0) {
      process.exit(code == null ? 1 : code);
    }
    runApply(extractGrantJson(stdout));
  });
}

main();
