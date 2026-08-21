#!/usr/bin/env node
'use strict';

/**
 * Pre-commit gate for agent shells (Cursor beforeShellExecution / Claude PreToolUse).
 *
 * Hard deny:
 *   - git commit --no-verify
 *   - staged .only(, tests/harness.overrides.js, RNFBDebug true
 *   - staged packages/** / tests/** / tests-web/** without fresh OKF validation evidence
 *
 * Non-commit shell commands are always allowed.
 *
 * Missing-evidence used to return `ask`, but Cursor agent Shell auto-continues on ask,
 * so that path had no friction. Deny forces validation (or a human terminal commit).
 */

const {
  readStdin,
  parseHookInput,
  normalizeInput,
  findRepoRoot,
  isRnfbRepo,
  isGitCommitCommand,
  hasNoVerify,
  stagedNameOnly,
  stagedRequiresEvidence,
  maxStagedProductMtimeMs,
  hasFreshEvidence,
  neverStageViolations,
  readEvidence,
  emitDecision,
  emitAllow,
} = require('./lib');

function main() {
  const input = normalizeInput(parseHookInput(readStdin()));
  const command = input.command;

  if (!command || !isGitCommitCommand(command)) {
    emitAllow();
    return;
  }

  const repoRoot = findRepoRoot(input);
  if (!isRnfbRepo(repoRoot)) {
    emitAllow();
    return;
  }

  if (hasNoVerify(command)) {
    emitDecision({
      permission: 'deny',
      reason:
        'Blocked: git commit --no-verify / -n is not allowed. Run validation, then commit with hooks enabled.',
    });
    return;
  }
  const violations = neverStageViolations(repoRoot);
  if (violations.length > 0) {
    emitDecision({
      permission: 'deny',
      reason: `Blocked commit (never-stage rules):\n- ${violations.join('\n- ')}\nUnstage those changes and retry.`,
    });
    return;
  }

  const staged = stagedNameOnly(repoRoot);
  if (!stagedRequiresEvidence(staged)) {
    emitAllow();
    return;
  }

  const sinceMs = maxStagedProductMtimeMs(repoRoot, staged);
  const evidence = readEvidence(repoRoot);
  if (hasFreshEvidence(evidence, sinceMs)) {
    emitAllow();
    return;
  }

  emitDecision({
    permission: 'deny',
    reason: [
      'Blocked: no fresh OKF validation evidence for staged product changes.',
      'Run allowlisted validation (e.g. yarn tests:jest, yarn lint:js, yarn tsc:compile, yarn tests:<platform>:test-cover)',
      'so scripts/agent-hooks can record evidence, then retry the commit.',
      'See okf-bundle/testing/change-authoring-workflow.md#validation-evidence-blocking',
    ].join(' '),
  });
}

main();
