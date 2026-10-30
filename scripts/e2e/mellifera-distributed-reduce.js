#!/usr/bin/env node
/**
 * Reducer for a distributed e2e run (three overlapping remote grants:
 * android, ios, macos). Runs in this worktree after the remote pieces.
 *
 * Subcommands:
 *   field   --reserve FILE --field sessionId|slot|placement
 *           Print one non-secret grant field. `slot` prints the slot for
 *           placement "slot" and an empty line for any other placement.
 *   record  --run-dir DIR --piece android|ios|macos --reserve FILE
 *           (--exit N | --exit-file FILE) [--coverage PATH]
 *           [--started EPOCH_S] [--ended EPOCH_S]
 *           Write DIR/piece-<piece>.json. android and ios have fixed coverage
 *           paths; macos requires --coverage. Paths are relative to the repo root.
 *   report  --run-dir DIR
 *           Write DIR/report.json and DIR/report.md. Exit 1 when a piece is
 *           missing, a piece exit is non-zero, a coverage artifact is missing or
 *           empty, two pieces share a session, a piece has no start/end time or
 *           starts at or after its end, or the lifetimes do not overlap.
 *   release --reserve FILE [--url URL] [--federation ID]
 *           Release that grant on the issuing core through the CLI forwarder.
 *           The token is read from the reserve JSON and never printed.
 *
 * Run dirs and reports stay in this worktree. Usage errors exit 2.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const FORWARDER = path.join(SCRIPT_DIR, 'mellifera-cli-forward.js');
const DEFAULT_CLI = path.join(REPO_ROOT, 'scripts/mellifera/cli.js');

const PIECES = {
  android: {
    kind: 'linux-nested-virt-self-hosted',
    coverage: 'tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
  ios: { kind: 'macos-self-hosted', coverage: 'coverage/ios-native/lcov.info' },
  macos: { kind: 'macos-self-hosted', coverage: null },
};
const FIELDS = ['sessionId', 'slot', 'placement'];

function usage(message) {
  console.error(`mellifera-distributed-reduce: ${message}`);
  process.exit(2);
}

function parseFlags(args) {
  /** @type {Record<string, string>} */
  const flags = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      usage(`unexpected argument ${arg}`);
    }
    const eq = arg.indexOf('=');
    if (eq > 0) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const value = args[i + 1];
    if (value === undefined || value.startsWith('--')) {
      usage(`${arg} requires a value`);
    }
    flags[arg.slice(2)] = value;
    i += 1;
  }
  return flags;
}

function need(flags, name) {
  if (flags[name] === undefined || flags[name] === '') {
    usage(`--${name} is required`);
  }
  return flags[name];
}

function insideWorktree(rel, label) {
  const abs = path.resolve(REPO_ROOT, rel);
  if (abs !== REPO_ROOT && !abs.startsWith(REPO_ROOT + path.sep)) {
    usage(`${label} must be inside this worktree: ${rel}`);
  }
  return abs;
}

function readReserve(file) {
  let grant;
  try {
    grant = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  } catch {
    usage(`cannot read reserve JSON ${file}: not readable or not valid JSON`);
  }
  if (!grant || typeof grant.sessionId !== 'string' || !grant.sessionId) {
    usage(`reserve JSON ${file} has no sessionId`);
  }
  return grant;
}

function slotOf(grant) {
  return grant.placement === 'slot' && Number.isInteger(grant.slot) ? grant.slot : null;
}

function cmdField(flags) {
  const grant = readReserve(need(flags, 'reserve'));
  const field = need(flags, 'field');
  if (!FIELDS.includes(field)) {
    usage(`--field must be one of ${FIELDS.join(', ')}`);
  }
  const value = field === 'slot' ? slotOf(grant) : grant[field];
  process.stdout.write(`${value == null ? '' : value}\n`);
}

function parseExit(flags) {
  let raw = flags.exit;
  if (raw === undefined && flags['exit-file'] !== undefined) {
    try {
      raw = fs.readFileSync(path.resolve(flags['exit-file']), 'utf8').trim();
    } catch (err) {
      usage(`cannot read --exit-file: ${err.message}`);
    }
  }
  if (raw === undefined) {
    usage('--exit or --exit-file is required');
  }
  if (!/^\d+$/.test(raw)) {
    usage(`exit code must be a non-negative integer, got ${JSON.stringify(raw)}`);
  }
  return Number(raw);
}

function parseEpoch(flags, name) {
  if (flags[name] === undefined) {
    return null;
  }
  if (!/^\d+$/.test(flags[name])) {
    usage(`--${name} must be epoch seconds`);
  }
  return Number(flags[name]);
}

function cmdRecord(flags) {
  const runDir = insideWorktree(need(flags, 'run-dir'), '--run-dir');
  const piece = need(flags, 'piece');
  const spec = PIECES[piece];
  if (!spec) {
    usage(`--piece must be one of ${Object.keys(PIECES).join(', ')}`);
  }
  const grant = readReserve(need(flags, 'reserve'));
  if (grant.kind !== undefined && grant.kind !== spec.kind) {
    usage(`${piece} grant kind is ${grant.kind}, expected ${spec.kind}`);
  }
  const coverage = flags.coverage !== undefined ? flags.coverage : spec.coverage;
  if (!coverage) {
    usage(`--coverage is required for piece ${piece}`);
  }
  insideWorktree(coverage, '--coverage');
  const record = {
    piece,
    kind: spec.kind,
    sessionId: grant.sessionId,
    placement: grant.placement == null ? null : grant.placement,
    slot: slotOf(grant),
    checkoutMode: (grant.execution && grant.execution.checkoutMode) || null,
    exitCode: parseExit(flags),
    coverage,
    startedAt: parseEpoch(flags, 'started'),
    endedAt: parseEpoch(flags, 'ended'),
  };
  fs.mkdirSync(runDir, { recursive: true });
  const out = path.join(runDir, `piece-${piece}.json`);
  fs.writeFileSync(out, `${JSON.stringify(record, null, 2)}\n`);
  process.stdout.write(`${path.relative(REPO_ROOT, out)}\n`);
}

function reduce(runDir) {
  const problems = [];
  const pieces = [];
  for (const piece of Object.keys(PIECES)) {
    const file = path.join(runDir, `piece-${piece}.json`);
    if (!fs.existsSync(file)) {
      problems.push(`${piece}: no piece record`);
      pieces.push({ piece, exitCode: null, coverage: null, coveragePresent: false });
      continue;
    }
    let record;
    try {
      record = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      problems.push(`${piece}: piece record is not valid JSON`);
      pieces.push({ piece, exitCode: null, coverage: null, coveragePresent: false });
      continue;
    }
    const abs = path.resolve(REPO_ROOT, record.coverage);
    const present = fs.existsSync(abs) && fs.statSync(abs).isFile() && fs.statSync(abs).size > 0;
    if (record.exitCode !== 0) {
      problems.push(`${piece}: exit ${record.exitCode}`);
    }
    if (!present) {
      problems.push(`${piece}: coverage artifact missing or empty at ${record.coverage}`);
    }
    if (record.checkoutMode !== 'remote') {
      problems.push(`${piece}: checkoutMode ${record.checkoutMode}, expected remote`);
    }
    pieces.push({ ...record, coveragePresent: present });
  }
  const sessions = pieces.map(p => p.sessionId).filter(Boolean);
  if (new Set(sessions).size !== sessions.length) {
    problems.push('two pieces share one session; each piece is its own grant');
  }
  let overlap = false;
  const timed = [];
  for (const p of pieces) {
    if (p.exitCode === null) {
      continue;
    }
    if (!Number.isInteger(p.startedAt) || !Number.isInteger(p.endedAt)) {
      problems.push(`${p.piece}: start or end time not recorded; overlap cannot be proven`);
    } else if (p.startedAt >= p.endedAt) {
      problems.push(`${p.piece}: start ${p.startedAt} is not before end ${p.endedAt}`);
    } else {
      timed.push(p);
    }
  }
  if (timed.length === pieces.length) {
    overlap = Math.max(...timed.map(p => p.startedAt)) < Math.min(...timed.map(p => p.endedAt));
    if (!overlap) {
      problems.push('piece lifetimes do not overlap');
    }
  }
  return { ok: problems.length === 0, overlap, pieces, problems };
}

function toMarkdown(report) {
  const lines = [
    '# Distributed e2e reducer report',
    '',
    `Result: ${report.ok ? 'PASS' : 'FAIL'}`,
    `Overlap proven: ${report.overlap}`,
    '',
    '| Piece | Kind | Exit | Coverage artifact | Present |',
    '| ----- | ---- | ---- | ----------------- | ------- |',
  ];
  for (const p of report.pieces) {
    lines.push(
      `| ${p.piece} | ${p.kind || ''} | ${p.exitCode == null ? 'missing' : p.exitCode} | ${p.coverage ? `\`${p.coverage}\`` : ''} | ${p.coveragePresent ? 'yes' : 'no'} |`,
    );
  }
  if (report.problems.length) {
    lines.push('', '## Problems', '', ...report.problems.map(p => `- ${p}`));
  }
  return `${lines.join('\n')}\n`;
}

function cmdReport(flags) {
  const runDir = insideWorktree(need(flags, 'run-dir'), '--run-dir');
  if (!fs.existsSync(runDir)) {
    usage(`run dir not found: ${flags['run-dir']}`);
  }
  const report = reduce(runDir);
  fs.writeFileSync(path.join(runDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(runDir, 'report.md'), toMarkdown(report));
  process.stdout.write(toMarkdown(report));
  process.exit(report.ok ? 0 : 1);
}

function cmdRelease(flags) {
  const grant = readReserve(need(flags, 'reserve'));
  if (typeof grant.token !== 'string' || !grant.token) {
    usage('reserve JSON has no token');
  }
  // The CLI release reads the session token only from --token or the worktree
  // pointer (no env var), so it is on this child argv but never printed.
  const args = [FORWARDER, '1', 'release', '--session-id', grant.sessionId, '--token', grant.token];
  for (const name of ['url', 'federation']) {
    if (flags[name] !== undefined) {
      args.push(`--${name}`, flags[name]);
    }
  }
  const env = { ...process.env, MELLIFERA_CLI: process.env.MELLIFERA_CLI || DEFAULT_CLI };
  const result = spawnSync(process.execPath, args, { cwd: REPO_ROOT, env, stdio: 'inherit' });
  if (result.error) {
    usage(result.error.message);
  }
  process.exit(result.status == null ? 1 : result.status);
}

function main() {
  const [sub, ...rest] = process.argv.slice(2);
  const commands = { field: cmdField, record: cmdRecord, report: cmdReport, release: cmdRelease };
  if (!commands[sub]) {
    usage('usage: mellifera-distributed-reduce.js field|record|report|release [flags]');
  }
  commands[sub](parseFlags(rest));
}

main();
