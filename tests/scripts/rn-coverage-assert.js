#!/usr/bin/env node
/**
 * Presence guard via portal-linked `rn-coverage assert` (exit 2 on empty).
 * Keeps the yarn script name `tests:coverage:assert-presence` stable.
 */
'use strict';

const { runRnCoverage } = require('./resolve-rn-coverage');

const passthrough = process.argv.slice(2);
const { status, signal } = runRnCoverage(['assert', ...passthrough]);
if (signal) {
  process.kill(process.pid, signal);
}
process.exit(status == null ? 1 : status);
