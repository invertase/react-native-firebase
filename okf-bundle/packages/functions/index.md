---
type: Reference
title: "@react-native-firebase/functions"
description: Knowledge index for Cloud Functions — callable errors, consumer-type gotchas, and related package files.
tags: [functions, types, HttpsError, FunctionsError, test-expo]
timestamp: 2026-09-28T00:00:00Z
---

# @react-native-firebase/functions

Knowledge for the Cloud Functions modular package (`getFunctions`, callables, emulator).

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md). Agent shell commands: [agent command policy](../../testing/agent-command-policy.md) only.

## Gotchas

<a id="functionserror-instanceof-consumer-types"></a>

### `FunctionsError` is not usable as `instanceof` under consumer types

- Runtime value: `export { HttpsError, HttpsError as FunctionsError }` — same class constructor.
- Under consumer / published types (e.g. `yarn tsc:compile:test-expo`), `FunctionsError` is not a valid `instanceof` RHS (**TS2358**). Prefer `error instanceof HttpsError`, and assert the alias with `FunctionsError === HttpsError`.
- Do not write `instanceof FunctionsError` in `test-expo/`, docs fences, or other consumer-typechecked samples.

## Related repository files

* [`packages/functions/lib/index.ts`](../../../packages/functions/lib/index.ts) — modular exports; `HttpsError` / `FunctionsError` alias
* [`packages/functions/lib/HttpsError.ts`](../../../packages/functions/lib/HttpsError.ts) — runtime error class
* [`packages/functions/lib/types/functions.ts`](../../../packages/functions/lib/types/functions.ts) — consumer `HttpsError` interface and related types
* [`test-expo/app/functions.tsx`](../../../test-expo/app/functions.tsx) — Expo example screen (uses `instanceof HttpsError` + alias equality)
