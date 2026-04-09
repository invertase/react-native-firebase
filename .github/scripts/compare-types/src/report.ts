/**
 * Terminal output formatting for comparison results.
 *
 * Documented differences → yellow (~)  — informational only
 * Undocumented differences → red (✗)   — CI failure
 */

import type { ComparisonResult } from './types';

// ---------------------------------------------------------------------------
// ANSI helpers
// ---------------------------------------------------------------------------

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

function c(code: string, s: string): string {
  return `${code}${s}${RESET}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printSection(
  title: string,
  items: Array<{
    name: string;
    isUndocumented: boolean;
    reason?: string;
    extra?: string[];
  }>,
): void {
  console.log(`\n  ${c(CYAN, title)} (${items.length}):`);
  for (const item of items) {
    const bullet = item.isUndocumented ? c(RED, '  ✗') : c(YELLOW, '  ~');
    const tag = item.isUndocumented ? c(RED, ' [UNDOCUMENTED]') : '';
    const note = item.reason ? c(DIM, `  — ${item.reason}`) : '';
    console.log(`${bullet} ${c(BOLD, item.name)}${tag}${note}`);
    for (const line of item.extra ?? []) {
      console.log(`     ${c(DIM, line)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Print a human-readable report to stdout.
 *
 * @returns `true` if there are any undocumented differences (CI failure).
 */
export function printReport(results: ComparisonResult[]): boolean {
  console.log(
    c(BOLD, '\n🔍 Firebase JS SDK ↔ React Native Firebase Type Comparison'),
  );

  let hasFailures = false;

  for (const result of results) {
    console.log(`\n${c(BOLD, `📦 ${result.packageName}`)}`);

    const totalDiffs =
      result.missing.length +
      result.extra.length +
      result.differentShape.length;

    if (totalDiffs === 0) {
      console.log(c(GREEN, '  ✓ No differences found'));
      continue;
    }

    // --- Missing ---
    if (result.missing.length > 0) {
      printSection(
        'Missing in RN Firebase',
        result.missing.map(item => ({
          name: item.name,
          isUndocumented: result.undocumentedMissing.includes(item.name),
          reason: item.reason,
        })),
      );
    }

    // --- Extra ---
    if (result.extra.length > 0) {
      printSection(
        'Extra in RN Firebase',
        result.extra.map(item => ({
          name: item.name,
          isUndocumented: result.undocumentedExtra.includes(item.name),
          reason: item.reason,
        })),
      );
    }

    // --- Different shape ---
    if (result.differentShape.length > 0) {
      printSection(
        'Different shape',
        result.differentShape.map(item => ({
          name: item.name,
          isUndocumented: result.undocumentedDifferentShape.includes(item.name),
          reason: item.reason,
          extra: [
            `sdk: ${item.sdkShape}`,
            `rn:  ${item.rnShape}`,
          ],
        })),
      );
    }

    // --- Stale config entries ---
    const totalStale =
      result.staleConfigMissing.length +
      result.staleConfigExtra.length +
      result.staleConfigDifferentShape.length;

    if (totalStale > 0) {
      const staleNames = [
        ...result.staleConfigMissing,
        ...result.staleConfigExtra,
        ...result.staleConfigDifferentShape,
      ];
      console.log(`\n  ${c(RED, `Stale config entries`)} (${totalStale}):`);
      for (const name of staleNames) {
        console.log(
          `${c(RED, '  ✗')} ${c(BOLD, name)}${c(RED, ' [STALE]')}${c(DIM, '  — now matches the firebase-js-sdk; remove from config.ts')}`,
        );
      }
    }

    // --- Summary ---
    const totalUndoc =
      result.undocumentedMissing.length +
      result.undocumentedExtra.length +
      result.undocumentedDifferentShape.length;

    if (totalUndoc > 0 || totalStale > 0) {
      hasFailures = true;
      if (totalUndoc > 0) {
        console.log(
          `\n  ${c(RED, `✗ ${totalUndoc} undocumented difference(s) — add them to config.ts with a reason`)}`,
        );
      }
      if (totalStale > 0) {
        console.log(
          `\n  ${c(RED, `✗ ${totalStale} stale config entry/entries — remove them from config.ts`)}`,
        );
      }
    } else {
      console.log(
        `\n  ${c(GREEN, `✓ All ${totalDiffs} difference(s) are documented in config.ts`)}`,
      );
    }
  }

  console.log('');
  return hasFailures;
}
