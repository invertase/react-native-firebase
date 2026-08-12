#!/usr/bin/env node
'use strict';

/**
 * Compaction handoff nudge (Cursor preCompact / Claude PreCompact).
 *
 * Cursor: primarily human-visible (user_message).
 * Claude: can surface to the agent (agent_message / systemMessage / additionalContext).
 *
 * When loaded from ~/.cursor (global), only nudge inside RNFB checkouts.
 */

const { readStdin, parseHookInput, normalizeInput, findRepoRoot, isRnfbRepo } = require('./lib');

const MESSAGE = [
  'Context compaction is about to run.',
  'Before continuing in a fresh/degraded context: update the active Linear issue',
  '(dated comment + live Decisions / Discovery / Work Completed / Work To Be Completed)',
  'so a new session can pick up cold. See Cross Platform Issue Authoring & Agent Workflow Guide.',
].join(' ');

function main() {
  const input = normalizeInput(parseHookInput(readStdin()));
  if (!isRnfbRepo(findRepoRoot(input))) {
    process.stdout.write(`${JSON.stringify({ continue: true })}\n`);
    return;
  }

  const body = {
    user_message: MESSAGE,
    agent_message: MESSAGE,
    systemMessage: MESSAGE,
    additionalContext: MESSAGE,
    continue: true,
  };
  process.stdout.write(`${JSON.stringify(body)}\n`);
}

main();
