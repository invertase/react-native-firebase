---
type: Reference
title: Android unit testing decisions (ADR)
description: Canonical owner of durable decisions for Android JVM unit tests (Robolectric, Mockito, Jacoco *.exec).
tags: [testing, android, unit, robolectric, mockito, jacoco, adr]
timestamp: 2026-07-22T00:00:00Z
---

# Android unit testing decisions (ADR)

**Canonical owner** of durable decisions for Android **JVM** unit tests under `packages/*/android/src/test/java`. Commands: [agent command policy](agent-command-policy.md), [validation checklist](validation-checklist.md). Coverage contract: [coverage design](coverage-design.md). CI shape: [Android CI workflows](../ci-workflows/android.md).

**Policy:** [OKF documentation policy](../documentation-policy.md). Do not duplicate these decisions in work queues.

## Decision ID convention

Use the **`AndroidTest-AD-<n>`** prefix when citing these decisions in code or docs.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decided; CI and local yarn scripts enforce this. |
| **Proposed** | Planned; not yet enforced. |

---

<a id="androidtest-ad-1--robolectric--mockito-for-android-jvm-unit-tests--accepted"></a>
<a id="androidtest-ad-1"></a>

## AndroidTest-AD-1 — Robolectric + Mockito for Android JVM unit tests — **Accepted**

Use **Robolectric** (JUnit4 `RobolectricTestRunner`) and **Mockito** for Android Java state-machine / bridge logic that e2e cannot synthesize — for example multi-generation `ReactContext` overlap, Handler/Looper timing, and host/context doubles.

| Aspect | Decision |
|--------|----------|
| Location | `packages/*/android/src/test/java/**` |
| Runner | JUnit4 + Robolectric (`@RunWith(RobolectricTestRunner.class)`) |
| Doubles | Mockito (`mock`, `mockStatic`, etc.) for RN host/context APIs |
| Entry command | `yarn tests:android:unit` → `tests/android` `./gradlew rnfbDebugUnitTests` |
| Coverage artifact | Module Jacoco `*.exec` (merged into Codecov via `jacocoTestReport` — [coverage design](coverage-design.md)) |

**Why:** Detox/Jet e2e loads one live React Native generation and cannot reliably drive overlapping context generations, synthetic host wiring, or precise looper scheduling needed for some bridge state machines. JVM tests prove those contracts without an emulator.

**Not a substitute for area e2e:** JVM tests do **not** replace [platform coverage gate](running-e2e.md#platform-coverage-gate-blocking) delivery/integration e2e on platforms where the module loads. Multi-generation races may be proven **primarily** via JVM tests; e2e remains required for load, flush, and native↔JS delivery on those platforms.

**Formatting:** Java under `packages/*/android/src` uses **`yarn lint:android` only** — [agent command policy](agent-command-policy.md).
