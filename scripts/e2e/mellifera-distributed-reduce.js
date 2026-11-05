#!/usr/bin/env node
/**
 * Reducer for a distributed e2e run (three overlapping remote grants:
 * android, ios, macos). Runs in this worktree after the remote pieces.
 *
 * Subcommands:
 *   field   --reserve FILE --field sessionId|slot|placement
 *           Print one non-secret grant field. A grant with no placement is
 *           placement "pool". `slot` prints the slot for placement "slot"
 *           (local or global) and an empty line for placement "host". Any
 *           other placement, such as "pool" from a global grant, or a "slot"
 *           grant with no non-negative integer slot, names no slot index:
 *           `slot` exits 3 rather than let a caller pick a slot or a
 *           whole-host release.
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
 *   extend  --reserve FILE --ttl-ms N [--url URL] [--federation ID]
 *           Extend that grant's lease to N ms through the CLI forwarder. A
 *           local-core grant, including a spill, uses the session route with
 *           the token passed like release; the local core extends the global
 *           grant behind it. A global grant (phase "pool-global") gets exactly
 *           `extend --global --session-id GRANT_ID --ttl-ms N`, with no session
 *           token (the API key authorizes it, and the global counts it as a
 *           holder renewal), and must come back from the global grant route
 *           (`grantId` and `expiresAt`). A CLI that prints usage for it, or
 *           extends some other way, exits 1 with an upgrade message.
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

const PIECES = {
  android: {
    kind: 'linux-nested-virt-self-hosted',
    coverage: 'tests/android/app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml',
  },
  ios: { kind: 'macos-self-hosted', coverage: 'coverage/ios-native/lcov.info' },
  macos: { kind: 'macos-self-hosted', coverage: null },
};
const FIELDS = ['sessionId', 'slot', 'placement'];
const GLOBAL_PLACEMENT_DOC = 'okf-bundle/testing/running-e2e-distributed.md#global-grant-placement';
const RENEWAL_DOC = 'okf-bundle/testing/running-e2e-distributed.md#held-grant-renewal';
const CLI_REJECTED = /unknown (flag|option)|unrecognized (flag|option)|^usage:/im;

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

function placementOf(grant) {
  return grant.placement == null ? 'pool' : grant.placement;
}

function slotOf(grant) {
  return placementOf(grant) === 'slot' && Number.isInteger(grant.slot) && grant.slot >= 0
    ? grant.slot
    : null;
}

function isGlobalGrant(grant) {
  return grant.phase === 'pool-global';
}

function cmdField(flags) {
  const grant = readReserve(need(flags, 'reserve'));
  const field = need(flags, 'field');
  if (!FIELDS.includes(field)) {
    usage(`--field must be one of ${FIELDS.join(', ')}`);
  }
  const placement = placementOf(grant);
  if (field === 'slot' && placement !== 'host' && slotOf(grant) === null) {
    console.error(
      `mellifera-distributed-reduce: grant placement is ${JSON.stringify(placement)} and ` +
        'the reserve JSON names no slot index. Refusing to choose a slot or a whole-host ' +
        `release (--placement=host would wipe every slot on a desk); see ${GLOBAL_PLACEMENT_DOC}`,
    );
    process.exit(3);
  }
  const values = { sessionId: grant.sessionId, slot: slotOf(grant), placement };
  const value = values[field];
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
    placement: placementOf(grant),
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
  const result = runWithToken(flags, grant, ['release'], []);
  process.exit(result.status == null ? 1 : result.status);
}

function cmdExtend(flags) {
  const ttl = need(flags, 'ttl-ms');
  if (!/^[1-9]\d*$/.test(ttl)) {
    usage(`--ttl-ms must be a positive whole number of milliseconds, got ${JSON.stringify(ttl)}`);
  }
  const grant = readReserve(need(flags, 'reserve'));
  if (!isGlobalGrant(grant)) {
    const result = runWithToken(flags, grant, ['extend'], ['--ttl-ms', ttl]);
    process.exit(result.status == null ? 1 : result.status);
  }
  const grantId = globalGrantId(grant);
  // Without --global the CLI takes the global grant route only for the
  // worktree pointer's grant, and a distributed run's later reserves replace it.
  // No session token: a CLI without `extend --global` then prints usage and
  // exits 1 instead of extending through the session route.
  const env = { ...process.env };
  delete env.MELLIFERA_SESSION_TOKEN;
  const result = spawnSync(
    process.execPath,
    [FORWARDER, '1', 'extend', '--global', '--session-id', grantId, '--ttl-ms', ttl],
    { cwd: REPO_ROOT, env, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] },
  );
  if (result.error) {
    usage(result.error.message);
  }
  const out = result.stdout || '';
  const err = result.stderr || '';
  const upgrade =
    'Upgrade mellifera-cli to a release whose usage lists ' +
    '`extend --global [--session-id ID] --ttl-ms N` and run this again; ' +
    `see ${RENEWAL_DOC}.`;
  if (result.status !== 0) {
    if (CLI_REJECTED.test(`${out}\n${err}`)) {
      console.error(
        `mellifera-distributed-reduce: the installed mellifera-cli printed usage for ` +
          `\`extend --global --session-id ${grantId}\`, so global grant ${grantId} was not ` +
          `renewed. ${upgrade}`,
      );
      process.exit(1);
    }
    process.stdout.write(out);
    process.stderr.write(err);
    console.error(
      `mellifera-distributed-reduce: extend --global for global grant ${grantId} exited ` +
        `${result.status}; the grant was not renewed. See ${RENEWAL_DOC}.`,
    );
    process.exit(result.status == null ? 1 : result.status);
  }
  process.stderr.write(err);
  let body = null;
  try {
    body = JSON.parse(out);
  } catch {
    body = null;
  }
  if (!body || body.grantId !== grantId || typeof body.expiresAt !== 'string') {
    console.error(
      `mellifera-distributed-reduce: mellifera-cli did not extend global grant ${grantId} ` +
        'through the global grant route (no `grantId` and `expiresAt` in its answer), so the ' +
        `holder renewal did not happen. ${upgrade}`,
    );
    process.exit(1);
  }
  process.stdout.write(out);
  process.exit(0);
}

/**
 * The id the global knows a pool-global grant by. `reserve --global` writes it
 * as the session id; a `federation.grantId`, when present, must agree.
 */
function globalGrantId(grant) {
  const fed = grant.federation && grant.federation.grantId;
  if (fed && fed !== grant.sessionId) {
    usage(
      `reserve JSON for a global grant has sessionId ${JSON.stringify(grant.sessionId)} and ` +
        `federation.grantId ${JSON.stringify(fed)}; they must be the same grant id`,
    );
  }
  if (typeof grant.sessionId !== 'string' || !grant.sessionId) {
    usage('reserve JSON for a global grant has no sessionId');
  }
  return grant.sessionId;
}

function runWithToken(flags, grant, words, extra, options = {}) {
  if (typeof grant.token !== 'string' || !grant.token) {
    usage('reserve JSON has no token');
  }
  // The CLI reads MELLIFERA_SESSION_TOKEN only alongside --session-id. Passing
  // it in the child env keeps the token off argv, where ps would show it.
  const args = [FORWARDER, '1', ...words, '--session-id', grant.sessionId, ...extra];
  for (const name of ['url', 'federation']) {
    if (flags[name] !== undefined) {
      args.push(`--${name}`, flags[name]);
    }
  }
  const env = {
    ...process.env,
    MELLIFERA_SESSION_TOKEN: grant.token,
  };
  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    env,
    encoding: 'utf8',
    stdio: options.capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) {
    usage(result.error.message);
  }
  return result;
}

function main() {
  const [sub, ...rest] = process.argv.slice(2);
  const commands = {
    field: cmdField,
    record: cmdRecord,
    report: cmdReport,
    release: cmdRelease,
    extend: cmdExtend,
  };
  if (!commands[sub]) {
    usage('usage: mellifera-distributed-reduce.js field|record|report|release|extend [flags]');
  }
  commands[sub](parseFlags(rest));
}

main();
