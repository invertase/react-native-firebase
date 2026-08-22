# M1 — Perf duplicate trace/http/screen id collision semantics

**Item:** CPRN-365 / PR #9093 — M1 (Russell review)  
**Date:** 2026-08-26

## Pre-PR `main` behavior

| Platform | Container | Duplicate `start*` with same numeric id |
|----------|-----------|----------------------------------------|
| Android | `SparseArray.put(id, handle)` | **Silent last-wins overwrite.** Old handle dropped from map; SDK object keeps running as orphan until GC. `stopTrace(id)` affects the **latest** mapping only. |
| iOS | `NSMutableDictionary` subscript assign | **Silent last-wins overwrite.** Same orphan semantics as Android. |

Neither platform stopped the displaced handle. Neither surfaced an error to JS.

## Interim PR branch (pre-M1 fix)

| Platform | Mechanism | Duplicate id on `startTrace` / `startHttpMetric` / `startScreenTrace` |
|----------|-----------|-----------------------------------------------------------------------|
| Android | `putOrDiscard` then throw | **`IllegalStateException`** when id occupied — crashes/fails the TurboModule call. Trace/metric **already started** before registration, so collision also orphans the incoming SDK object. |
| iOS | `putOrDiscard` | **Silent first-wins discard** — incoming started trace/metric orphaned, existing mapping kept. |

Platform mismatch + both differ from main's last-wins overwrite.

## Firebase Performance SDK expectations

- `newTrace(name)` / `traceWithName:` and `newHttpMetric` / `HTTPMetric` create **independent** SDK objects; duplicate **names** are allowed.
- RNFB's numeric id is an **internal bridge handle** (from JS `MetricWithAttributes` auto-increment), not a Firebase trace name.
- The SDK does not define duplicate-handle semantics for RNFB ids; RNFB owns registry policy.

## JS / RNFB API expectations

- `Trace.start()`, `HttpMetric.start()`, `ScreenTrace.start()` call native `start*(id, …)` once per instance (`_started` guard).
- JS assigns **unique** ids via module-level `id++` in `MetricWithAttributes.ts` — duplicate ids are not produced by normal API use.
- Collisions are **programmer-error / race** territory (direct native calls, hot reload edge cases, concurrent misuse).
- Native `start*` methods are **`void`** (TurboModule spec) — no promise rejection path. Throwing on Android is a hard native crash, not a documented JS contract.
- Developers expect **`stop()` on their object** to finalize the trace they started; last-wins overwrite on main meant the **last** `start` won `stop(id)` — first object's `stop()` could no-op or finalize the wrong native handle.

## Options considered

| Policy | Pros | Cons |
|--------|------|------|
| **Silent last-wins** (`putReplacing` + stop displaced) | Matches main `stop(id)` target; stops orphaned SDK work; consistent Android/iOS; no JS throw | First trace stopped without JS metrics (same class of loss as main orphan, but cleanly finalized) |
| Silent discard incoming (`putIfAbsent`, register before start) | First wins; no duplicate SDK objects if register-before-start | **Breaks** main last-wins; `stop()` on second JS object would no-op |
| Throw to JS | Surfaces misuse | `void` TurboModule — not viable without API change; Android-only today |

## Decision

**Adopt silent last-wins: `putReplacing` + stop displaced handle outside the HandleMap lock.**

Applies consistently to **traces**, **HTTP metrics**, and **screen traces** on Android and iOS:

1. Create and start the new SDK metric.
2. `displaced = registry.putReplacing(id, newHandle)`.
3. If `displaced != null`, finalize displaced (`Trace.stop()` / `HttpMetric.stop()` / `ScreenTrace.sendScreenTrace()`).

Rationale:

- Restores main's last-wins `stop(id)` semantics.
- Improves on main by stopping displaced metrics instead of leaking them.
- Aligns Android with iOS (removes `IllegalStateException` vs silent-discard split).
- Avoids JS-visible throws on a void native method.

`putOrDiscard` remains on the registry for tests and future callers but is **not** used by perf module start paths.

## Implementation scope

- `UniversalFirebasePerfModule.java` — async + sync start paths
- `RNFBPerfModule.mm` — `startTrace`, `startHttpMetric`
- Registry javadoc (already documents `putReplacing` contract)
- Unit tests: collision last-wins pattern with fake stoppable handles (Android JVM + iOS XCTest)
- Coverage evidence: `.agents/reports/pr-9093/coverage-evidence-m1.md`

## YAML verdict

```yaml
item: M1
decision: silent_last_wins_putReplacing_stop_displaced
pre_main_behavior: silent_overwrite_orphan
interim_android: throw_IllegalStateException_after_start
interim_ios: silent_discard_incoming_orphan
platforms_aligned: true
js_throw: false
verdict: remediated
```
