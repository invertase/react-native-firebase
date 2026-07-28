---
type: Reference
title: Pipeline serialization testing (per export)
description: Required Jest and e2e serialization checks for every new Firestore Pipelines expression export.
tags: [firestore, pipelines, testing, jest, serialization]
timestamp: 2026-06-24T00:00:00Z
---

# Pipeline serialization testing

`compare:types` and `type-test.ts` do **not** prove runtime serialization. Global helpers and fluent methods use different paths (`normalizeGlobalArguments` vs `createMethodResult`).

Every new pipeline expression export must pass **all four** checks plus platform e2e.

## 1. Jest serialization matrix (global overloads)

For each firebase-js-sdk overload in `type-test.ts` / `consumer-type-test.ts`:

1. Build a minimal pipeline with `.select(...)` using that overload.
2. Call `.serialize()` on the pipeline source.
3. Assert function node name and **each argument** `{ exprType, path | value }`, especially string `Field` vs `Constant`.

Cover **every** overload shape, not just e2e happy paths. Example `timestampDiff`:

| Overload | End arg | Start arg |
|----------|---------|-----------|
| `(Expression, Expression, unit)` | Field | Field |
| `(Expression, string, unit)` | Field | Field |
| `(string, Expression, unit)` | Field | Field |
| `(string, string, unit)` | Field | Field |

Place tests in `packages/firestore/__tests__/pipelines.test.ts` or `pipelines-serialization-matrix.test.ts`.

## 2. E2e runtime per overload class

Add at least one runtime assertion per overload **class** where string args mean **field paths**:

- `(Expression, Expression, …)`
- `(Expression, string field name, …)`
- `(string field name, Expression, …)`
- `(string field name, string field name, …)`

Reuse fixtures when possible; assert numeric/structural outcomes per column.

## 3. `EXPRESSION_METHOD_NAMES` checklist

Before adding to `EXPRESSION_METHOD_NAMES`:

| Question | Action |
|----------|--------|
| Does the firebase-js-sdk expose this as a **receiver** method on `Expression`? | If **no**, keep standalone export only; add Jest asserting `field('x').<name>` is `undefined`. |
| Does any global overload treat string arg index ≥ 1 as **field path**? | If **yes**, do **not** register as fluent unless `createMethodResult` mirrors `normalizeGlobalArguments`. |
| Is the name registered as fluent? | Add Jest **"global helper and fluent method"** serialization test (see `coalesce`, `ifNull`, `arrayFilter` in `pipelines.test.ts`). |

**Never** add zero-argument helpers (e.g. `currentDocument`) to `EXPRESSION_METHOD_NAMES`.

## 4. Multi-index field normalization guard

When `normalizeGlobalArguments` uses multiple field indices for string→field coercion:

- Prefer **standalone** export only (omit from `EXPRESSION_METHOD_NAMES`).
- Add Jest: `expect(field('a').<name>).toBeUndefined()`.
- Document in the export's doc page if fluent form is intentionally unsupported.

If fluent support becomes required, extend `createMethodResult` to mirror `normalizeGlobalArguments` (receiver = index 0; method args shift by 1).

## Commands

Implementation:

```bash
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines.test.ts
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines-serialization-matrix.test.ts
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines-fluent-serialization.test.ts
```

Handoff ([Validation checklist](../../testing/validation-checklist.md)):

- [ ] All SDK overloads have Jest serialization assertions (Field vs Constant explicit).
- [ ] E2e covers each field-path string overload class for the export.
- [ ] `EXPRESSION_METHOD_NAMES` decision documented in tests (fluent test **or** standalone-only guard).
- [ ] Multi-index field normalization handled (standalone-only or `createMethodResult` fix).
