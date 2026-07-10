---
type: Ephemeral
title: Prepare benchmark baseline
description: Ephemeral pre-Nx benchmark output for MT0.3.
tags: [monorepo, tooling, benchmark, prepare, ephemeral]
timestamp: 2026-07-10T17:31:42Z
---

# Prepare benchmark baseline

Ephemeral MT0.3 note. These numbers are baseline evidence for the monorepo tooling rollout and are intentionally not part of the durable prepare/cache design.

## Pre-Nx baseline

Command:

```bash
bash ./scripts/benchmark-prepare.sh
```

Environment notes:

- Host: macOS (`darwin 25.5.0`).
- Tree state: `nx.json` absent before the benchmark run.
- Benchmark logs: `.tmp/prepare-benchmarks/20260710-122118/`.
- Script scenario D applies and then removes a temporary comment in `packages/firestore/lib/index.ts` so content-hash-based runners observe a real single-package edit.
- First sandboxed attempt exited before timing because the sandbox could not remove a few ignored `node_modules` entries; the recorded run below was rerun unsandboxed and exited 0.

| Scenario | Name | Median (s) | Runs (s) |
|----------|------|------------|----------|
| A | Cold install | 125.583 | 125.583, 138.092, 122.102 |
| B | Full rebuild | 23.686 | 24.171, 23.686, 23.461 |
| C | No-op rebuild | 23.694 | 23.555, 23.811, 23.694 |
| D | Single-package edit | 23.758 | 23.849, 23.758, 23.515 |

Exit code: 0.

