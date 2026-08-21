#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const gate = path.join(root, 'scripts/agent-hooks/gate-commit.js');
const record = path.join(root, 'scripts/agent-hooks/record-validation.js');
const handoff = path.join(root, 'scripts/agent-hooks/handoff-nudge.js');

function run(script, payload) {
  const result = spawnSync(process.execPath, [script], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    cwd: root,
  });
  return {
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

const bypassFlag = ['--', 'no', '-verify'].join('');
const cases = [];

cases.push(['allow non-commit', run(gate, { command: 'ls' })]);
cases.push(['deny bypass flag', run(gate, { command: `git commit -m test ${bypassFlag}` })]);
cases.push(['allow -n inside message', run(gate, { command: 'git commit -m "fix -n bug"' })]);
cases.push([
  'deny bypass via workspace_roots from foreign cwd',
  (() => {
    const result = spawnSync(process.execPath, [gate], {
      input: JSON.stringify({
        command: `git commit -m test ${bypassFlag}`,
        cwd: '',
        workspace_roots: [root],
      }),
      encoding: 'utf8',
      cwd: path.join(require('os').homedir(), '.cursor'),
    });
    return {
      status: result.status,
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
    };
  })(),
]);
cases.push([
  'deny missing evidence via workspace_roots (worktree or staged product)',
  (() => {
    // Use a temp clone with a staged packages file and no evidence.
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'rnfb-gate-'));
    const resultInit = spawnSync('git', ['init', '-q', tmp], { encoding: 'utf8' });
    if (resultInit.status !== 0) {
      return { status: 1, stdout: '', stderr: resultInit.stderr || 'git init failed' };
    }
    spawnSync('git', ['-C', tmp, 'config', 'user.email', 't@t.com'], { encoding: 'utf8' });
    spawnSync('git', ['-C', tmp, 'config', 'user.name', 't'], { encoding: 'utf8' });
    fs.mkdirSync(path.join(tmp, 'packages/app'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'okf-bundle'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({ name: 'react-native-firebase' }),
    );
    fs.writeFileSync(path.join(tmp, 'packages/app/x.js'), 'module.exports = 1;\n');
    spawnSync('git', ['-C', tmp, 'add', 'packages/app/x.js', 'package.json'], { encoding: 'utf8' });
    const result = spawnSync(process.execPath, [gate], {
      input: JSON.stringify({
        command: 'git commit -m missing-evidence',
        cwd: '',
        workspace_roots: [tmp],
      }),
      encoding: 'utf8',
      cwd: path.join(require('os').homedir(), '.cursor'),
    });
    return {
      status: result.status,
      stdout: (result.stdout || '').trim(),
      stderr: (result.stderr || '').trim(),
    };
  })(),
]);
cases.push([
  'record pass',
  run(record, {
    command: 'yarn tests:jest',
    output: 'Test Suites: 1 passed, 1 total',
  }),
]);
cases.push([
  'record fail',
  run(record, {
    command: 'yarn tests:jest',
    output: 'Test Suites: 1 failed\nFAIL packages/foo',
  }),
]);
cases.push(['handoff', run(handoff, { workspace_roots: [root] })]);

let failed = false;
for (const [name, result] of cases) {
  console.log(`\n=== ${name} ===`);
  console.log(`status=${result.status}`);
  console.log(result.stdout.slice(0, 400));
  if (result.stderr) {
    console.log('stderr:', result.stderr.slice(0, 200));
  }
  if (
    name === 'deny bypass via workspace_roots from foreign cwd' ||
    name === 'deny missing evidence via workspace_roots (worktree or staged product)'
  ) {
    if (result.status !== 2 || !/"permission":"deny"/.test(result.stdout)) {
      console.log(`ASSERT FAIL: expected deny for ${name}`);
      failed = true;
    }
  }
}

const { evidencePath } = require('./lib');
const evidenceFile = evidencePath(root);
console.log('\n=== evidence file ===');
console.log(fs.readFileSync(evidenceFile, 'utf8'));

if (failed) {
  process.exitCode = 1;
}
