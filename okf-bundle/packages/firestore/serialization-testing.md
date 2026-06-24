---
type: Reference
title: Pipeline serialization testing (per export)
description: Required Jest and e2e serialization checks for every new Firestore Pipelines expression export.
tags: [firestore, pipelines, testing, jest, serialization]
timestamp: 2026-06-24T00:00:00Z
---

# Pipeline serialization testing

`compare:types` and compile-time `type-test.ts` lines do **not** prove pipelines serialize correctly at runtime. Global helpers and fluent methods use different code paths (`normalizeGlobalArguments` vs `createMethodResult`).

Apply **all four** checks below for every new pipeline expression export. These are **blocking** alongside platform e2e — not optional extras.

## 1. Jest serialization matrix (global overloads)

For each firebase-js-sdk overload listed in `type-test.ts` / `consumer-type-test.ts`:

1. Build a minimal pipeline with `.select(...)` using that overload.
2. Call `.serialize()` on the pipeline source.
3. Assert the function node name and **each argument** `{ exprType, path | value }` — especially `Field` vs `Constant` for string arguments.

Cover **every** overload shape, not only the happy-path pair used in e2e. Example for `timestampDiff`:

| Overload | End arg | Start arg |
|----------|---------|-----------|
| `(Expression, Expression, unit)` | Field | Field |
| `(Expression, string, unit)` | Field | Field |
| `(string, Expression, unit)` | Field | Field |
| `(string, string, unit)` | Field | Field |

Place tests in `packages/firestore/__tests__/pipelines.test.ts` or `pipelines-serialization-matrix.test.ts`.

## 2. E2e runtime per overload class

E2e proves Enterprise DB results for pipelines you actually build. Add at least one runtime assertion per overload **class** where string arguments mean **field paths** (not literal values):

- `(Expression, Expression, …)`
- `(Expression, string field name, …)`
- `(string field name, Expression, …)`
- `(string field name, string field name, …)`

Use the same fixture document when possible; assert numeric or structural outcomes per column.

## 3. `EXPRESSION_METHOD_NAMES` checklist

Before adding a name to `EXPRESSION_METHOD_NAMES` in `expressions.ts`:

| Question | Action |
|----------|--------|
| Does the firebase-js-sdk expose this as a **receiver** method on `Expression`? | If **no**, keep standalone export only; add Jest asserting `field('x').<name>` is `undefined`. |
| Does any global overload treat a string arg as a **field path** at index ≥ 1? | If **yes**, do **not** register as fluent unless `createMethodResult` applies the same field-index rules as `normalizeGlobalArguments`. |
| Is the name registered as fluent? | Add Jest **"global helper and fluent method"** serialization test (see `coalesce`, `ifNull`, `arrayFilter` in `pipelines.test.ts`). |

**Never** add zero-argument helpers (e.g. `currentDocument`) to `EXPRESSION_METHOD_NAMES`.

## 4. Multi-index field normalization guard

When `normalizeGlobalArguments` uses `fieldIndexList.push(0, 1)` (or more indices) for string→field coercion:

- Prefer **standalone** export only (omit from `EXPRESSION_METHOD_NAMES`).
- Add Jest: `expect(field('a').<name>).toBeUndefined()`.
- Document in the export's doc page if fluent form is intentionally unsupported.

If fluent support is required later, extend `createMethodResult` to mirror `normalizeGlobalArguments` field indices (receiver = index 0, method args shift by 1).

## Commands

During implementation:

```bash
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines.test.ts
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines-serialization-matrix.test.ts
yarn tests:jest --watchman=false packages/firestore/__tests__/pipelines-fluent-serialization.test.ts
```

Before handoff (part of [Validation checklist](../../testing/validation-checklist.md)):

- [ ] All SDK overloads have Jest serialization assertions (Field vs Constant explicit).
- [ ] E2e covers each field-path string overload class for the export.
- [ ] `EXPRESSION_METHOD_NAMES` decision documented in tests (fluent test **or** standalone-only guard).
- [ ] Multi-index field normalization handled (standalone-only or `createMethodResult` fix).
