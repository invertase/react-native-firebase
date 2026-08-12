'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EVIDENCE_FILENAME = 'rnfb-validation-evidence.json';
const EVIDENCE_VERSION = 1;
const MAX_RUNS = 50;

/** OKF allowlisted validation commands that mint commit evidence. */
const VALIDATION_PATTERNS = [
  /\byarn\s+tests:jest\b/,
  /\byarn\s+tests:jest-coverage\b/,
  /\byarn\s+lint:js\b/,
  /\byarn\s+lint:android\b/,
  /\byarn\s+lint:markdown\b/,
  /\byarn\s+lint:spellcheck\b/,
  /\byarn\s+lint:deps\b/,
  /\byarn\s+lint:ruby\b/,
  /\byarn\s+lint\b(?!:)/,
  /\byarn\s+tsc:compile\b/,
  /\byarn\s+tsc:compile:consumer\b/,
  /\byarn\s+compare:types\b/,
  /\byarn\s+reference:api\b/,
  /\byarn\s+tests:macos:test-cover\b/,
  /\byarn\s+tests:ios:test-cover\b/,
  /\byarn\s+tests:android:test-cover\b/,
  /\byarn\s+tests:ios:ruby\b/,
  /\byarn\s+tests:android:unit\b/,
  /\byarn\s+tests:android:post-e2e-coverage\b/,
];

const FAILURE_PATTERNS = [
  /\bELIFECYCLE\b/,
  /error Command failed/i,
  /Command failed with exit code [1-9]/i,
  /Test Suites:.*failed/,
  /\bFAIL\b/,
  /\bFAILED\b/,
  /([1-9]\d*)\s+failing\b/i,
  /Process exited with code [^0]/i,
  /exit code [^0]/i,
];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function parseHookInput(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return {};
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return { _raw: trimmed };
  }
}

/**
 * Normalize Cursor / Claude Code hook payloads into a shared shape.
 */
function normalizeInput(payload) {
  const toolInput =
    payload.tool_input && typeof payload.tool_input === 'object'
      ? payload.tool_input
      : typeof payload.tool_input === 'string'
        ? safeJson(payload.tool_input)
        : {};

  const command =
    payload.command ||
    toolInput.command ||
    payload.tool_input?.command ||
    (typeof payload.toolInput === 'object' ? payload.toolInput.command : undefined) ||
    '';

  const output =
    payload.output ||
    payload.tool_response ||
    payload.tool_result ||
    payload.response ||
    (typeof payload.toolResponse === 'string' ? payload.toolResponse : '') ||
    '';

  const exitCode =
    payload.exit_code ??
    payload.exitCode ??
    toolInput.exit_code ??
    extractExitCode(payload) ??
    null;

  const cwd =
    (typeof payload.cwd === 'string' && payload.cwd) ||
    (typeof toolInput.cwd === 'string' && toolInput.cwd) ||
    '';

  const workspaceRoots = collectWorkspaceRoots(payload, toolInput);

  return {
    command: String(command || ''),
    output: typeof output === 'string' ? output : JSON.stringify(output),
    exitCode,
    cwd,
    workspaceRoots,
    payload,
  };
}

function collectWorkspaceRoots(payload, toolInput) {
  const pools = [
    payload.workspace_roots,
    payload.workspaceRoots,
    toolInput.workspace_roots,
    toolInput.workspaceRoots,
  ];
  const roots = [];
  for (const pool of pools) {
    if (!Array.isArray(pool)) {
      continue;
    }
    for (const entry of pool) {
      if (typeof entry === 'string' && entry.trim()) {
        roots.push(entry.trim());
      }
    }
  }
  return roots;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function extractExitCode(payload) {
  if (payload.tool_response && typeof payload.tool_response === 'object') {
    if (typeof payload.tool_response.exit_code === 'number') {
      return payload.tool_response.exit_code;
    }
  }
  return null;
}

/**
 * Resolve the RNFB repo root for hook execution.
 *
 * Cursor user hooks (~/.cursor/hooks.json) run with cwd ~/.cursor and often an
 * empty payload.cwd, but they do include workspace_roots. Prefer those before
 * falling back to git from process.cwd().
 *
 * @param {{ cwd?: string, workspaceRoots?: string[] } | string} [hint]
 */
function findRepoRoot(hint) {
  const options =
    typeof hint === 'string'
      ? { cwd: hint, workspaceRoots: [] }
      : hint && typeof hint === 'object'
        ? hint
        : {};

  const candidates = [];
  if (typeof options.cwd === 'string' && options.cwd.trim()) {
    candidates.push(options.cwd.trim());
  }
  if (Array.isArray(options.workspaceRoots)) {
    for (const root of options.workspaceRoots) {
      if (typeof root === 'string' && root.trim()) {
        candidates.push(root.trim());
      }
    }
  }
  candidates.push(process.cwd());

  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    const toplevel = gitShowToplevel(candidate);
    if (toplevel) {
      return toplevel;
    }
    // Non-git path that already looks like an RNFB checkout (rare).
    if (isRnfbRepo(candidate)) {
      return candidate;
    }
  }

  return process.cwd();
}

function gitShowToplevel(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function gitDir(repoRoot) {
  try {
    const dir = execFileSync('git', ['rev-parse', '--git-dir'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return path.isAbsolute(dir) ? dir : path.join(repoRoot, dir);
  } catch {
    return path.join(repoRoot, '.git');
  }
}

/**
 * Global (~/.cursor) hooks run in every workspace. Only enforce in RNFB checkouts
 * (including git worktrees of this repo).
 */
function isRnfbRepo(repoRoot) {
  try {
    if (fs.existsSync(path.join(repoRoot, 'okf-bundle'))) {
      return true;
    }
    const pkgPath = path.join(repoRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return false;
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.name === 'react-native-firebase';
  } catch {
    return false;
  }
}

function evidencePath(repoRoot) {
  // Worktrees have a .git *file*; write into the real git dir instead.
  return path.join(gitDir(repoRoot), EVIDENCE_FILENAME);
}

function readEvidence(repoRoot) {
  const file = evidencePath(repoRoot);
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data || data.version !== EVIDENCE_VERSION || !Array.isArray(data.runs)) {
      return { version: EVIDENCE_VERSION, updatedAt: null, runs: [] };
    }
    return data;
  } catch {
    return { version: EVIDENCE_VERSION, updatedAt: null, runs: [] };
  }
}

function writeEvidence(repoRoot, evidence) {
  const file = evidencePath(repoRoot);
  fs.writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}

function isValidationCommand(command) {
  return VALIDATION_PATTERNS.some(re => re.test(command));
}

function looksFailed(output, exitCode) {
  if (typeof exitCode === 'number' && exitCode !== 0) {
    return true;
  }
  if (!output) {
    return false;
  }
  return FAILURE_PATTERNS.some(re => re.test(output));
}

function isGitCommitCommand(command) {
  // Match `git commit`, `git commit -m`, etc. Avoid `git commit-tree`.
  return /(?:^|[;&|]\s*|&&\s*|^\s*env\s+[^=]+=\S+\s+)*git(?:\s+-C\s+\S+)?\s+commit\b/.test(command);
}

function hasNoVerify(command) {
  // Strip quoted args so commit messages containing "-n" do not false-positive.
  const stripped = String(command).replace(/'[^']*'|"[^"]*"/g, '""');
  return /--no-verify\b|(?:^|\s)-n(?:\s|$)/.test(stripped);
}

function stagedNameOnly(repoRoot) {
  try {
    const out = execFileSync('git', ['diff', '--cached', '--name-only', '-z'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

function stagedPatch(repoRoot) {
  try {
    return execFileSync('git', ['diff', '--cached', '--unified=0'], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return '';
  }
}

function isProductPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (
    normalized === 'tests/harness.overrides.example.js' ||
    normalized === 'tests/harness.overrides.stub.js'
  ) {
    return false;
  }
  return (
    normalized.startsWith('packages/') ||
    normalized.startsWith('tests/') ||
    normalized.startsWith('tests-web/')
  );
}

function isHooksOnlyPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.startsWith('scripts/agent-hooks/') ||
    normalized.startsWith('.claude/') ||
    normalized.startsWith('.cursor/') ||
    normalized.startsWith('.codex/')
  );
}

function stagedRequiresEvidence(files) {
  const product = files.filter(isProductPath);
  if (product.length === 0) {
    return false;
  }
  // Pure hook/config commits that also touch nothing else product-related already filtered.
  return true;
}

function maxStagedProductMtimeMs(repoRoot, files) {
  let max = 0;
  for (const file of files.filter(isProductPath)) {
    const abs = path.join(repoRoot, file);
    try {
      const stat = fs.statSync(abs);
      if (stat.mtimeMs > max) {
        max = stat.mtimeMs;
      }
    } catch {
      // Deleted or only-in-index: treat as needing evidence recorded "now or later".
      max = Math.max(max, Date.now());
    }
  }
  return max;
}

function hasFreshEvidence(evidence, sinceMs) {
  return (evidence.runs || []).some(run => {
    if (!run || run.ok !== true || !run.recordedAt) {
      return false;
    }
    const t = Date.parse(run.recordedAt);
    return Number.isFinite(t) && t >= sinceMs;
  });
}

function neverStageViolations(repoRoot) {
  const files = stagedNameOnly(repoRoot);
  const violations = [];

  if (files.includes('tests/harness.overrides.js')) {
    violations.push('staged tests/harness.overrides.js (never commit local harness overrides)');
  }

  const patch = stagedPatch(repoRoot);
  const addedLines = patch
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'));

  const addedText = addedLines.join('\n');
  if (/\.only\s*\(/.test(addedText)) {
    violations.push('staged `.only(` (never commit suite narrowing)');
  }
  if (/RNFBDebug\s*:\s*true/.test(addedText) || /RNFBDebug\s*=\s*true/.test(addedText)) {
    violations.push('staged `RNFBDebug: true` / `RNFBDebug = true` (never commit debug fail-fast)');
  }

  return violations;
}

function emitDecision({ permission, reason, eventName = 'PreToolUse' }) {
  const message = reason || '';
  const body = {
    permission,
    user_message: message,
    agent_message: message,
    // Claude Code nested format (also accepted by Cursor third-party hooks).
    hookSpecificOutput: {
      hookEventName: eventName,
      permissionDecision: permission,
      permissionDecisionReason: message,
    },
  };
  process.stdout.write(`${JSON.stringify(body)}\n`);
  if (permission === 'deny') {
    process.exitCode = 2;
  }
}

function emitAllow() {
  emitDecision({ permission: 'allow', reason: '' });
}

function appendValidationRun(repoRoot, { command, ok }) {
  const evidence = readEvidence(repoRoot);
  const recordedAt = new Date().toISOString();
  evidence.runs = [
    { command: command.slice(0, 500), ok, recordedAt },
    ...(evidence.runs || []),
  ].slice(0, MAX_RUNS);
  evidence.updatedAt = recordedAt;
  evidence.version = EVIDENCE_VERSION;
  writeEvidence(repoRoot, evidence);
  return evidence;
}

module.exports = {
  VALIDATION_PATTERNS,
  readStdin,
  parseHookInput,
  normalizeInput,
  findRepoRoot,
  evidencePath,
  readEvidence,
  writeEvidence,
  isValidationCommand,
  looksFailed,
  isGitCommitCommand,
  hasNoVerify,
  stagedNameOnly,
  stagedRequiresEvidence,
  maxStagedProductMtimeMs,
  hasFreshEvidence,
  neverStageViolations,
  emitDecision,
  emitAllow,
  appendValidationRun,
  isProductPath,
  isHooksOnlyPath,
  isRnfbRepo,
};
