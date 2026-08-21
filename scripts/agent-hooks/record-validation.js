#!/usr/bin/env node
'use strict';

/**
 * Record OKF validation runs after shell tools finish
 * (Cursor afterShellExecution / Claude PostToolUse).
 *
 * Writes .git/rnfb-validation-evidence.json (never committed).
 * Not forge-resistant by design — friction only.
 */

const {
  readStdin,
  parseHookInput,
  normalizeInput,
  findRepoRoot,
  isRnfbRepo,
  isValidationCommand,
  looksFailed,
  appendValidationRun,
} = require('./lib');

function main() {
  const input = normalizeInput(parseHookInput(readStdin()));
  const command = input.command;
  const repoRoot = findRepoRoot(input);

  if (!isRnfbRepo(repoRoot) || !command || !isValidationCommand(command)) {
    // Always exit 0; recording hooks must not disrupt the session.
    process.stdout.write(`${JSON.stringify({ continue: true })}\n`);
    return;
  }

  const ok = !looksFailed(input.output, input.exitCode);
  appendValidationRun(repoRoot, { command, ok });

  process.stdout.write(
    `${JSON.stringify({
      continue: true,
      // Harmless ack for debugging in Hooks output channels.
      user_message: ok
        ? `Recorded OKF validation evidence for: ${command.slice(0, 120)}`
        : `Validation looked failed; not counting as commit evidence: ${command.slice(0, 120)}`,
    })}\n`,
  );
}

main();
