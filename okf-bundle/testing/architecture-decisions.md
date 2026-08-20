---
type: Reference
title: Published types and CI decisions (ADR)
description: Canonical owner of durable decisions for published-package type checking (attw, consumer tsc, Expo config plugins).
tags: [testing, types, attw, expo, adr]
timestamp: 2026-07-10T00:00:00Z
---

# Published types and CI decisions (ADR)

**Canonical owner** of durable decisions for how RNFB validates published package types in CI. Procedure and commands: [validation checklist](validation-checklist.md). Implementation: `.attw.json`, `.github/scripts/attw/`, `tsconfig.consumer.json`.

**Related (separate owner):** Android JVM unit testing — [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1).

**Policy:** [OKF documentation policy](../documentation-policy.md). Do not duplicate these decisions in work queues.

## Decision ID convention

Use the **`Types-AD-<n>`** prefix when citing these decisions in code or docs.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decided; CI enforces this. |
| **Proposed** | Planned; not yet enforced. |

---

## Types-AD-1 — Consumer matrix drives attw scope — **Accepted**

RNFB published types are validated against the **actual consumer matrix**, not generic npm “strict” resolution.

**Supported consumer chain (current direction):**

| Layer | Minimum | Notes |
|-------|---------|-------|
| iOS / Xcode | firebase-ios-sdk 12.12.0+ → Xcode 26.2+ | Drives recent RN only |
| React Native | New Architecture only (coordinated major) | Metro bundler, not Node `require()` for app JS |
| Node (dev) | RN 0.84+ → Node **22.11.0+**; RN 0.81–0.83 → Node **20.19.4+** | See [RN support matrix](https://github.com/reactwg/react-native-releases/blob/main/docs/support.md) |
| TypeScript (app) | `moduleResolution: "bundler"` | `yarn tsc:compile:consumer` |

**Why:** Node 10 and Node 16 are EOL. RN apps resolve `@react-native-firebase/*` through Metro (`bundler`), not through Node10/Node16-CJS `require()`. attw `strict` (185 findings on current packages) mostly reports resolution modes our consumers never use.

**CI gates (ordered):**

1. `yarn tsc:compile` — monorepo internal TS
2. `yarn tsc:compile:consumer` — **primary RN app consumer gate** (`bundler`)
3. `yarn attw:check` — published tarball hygiene (scoped per Types-AD-2)
4. Expo plugin smoke test inside `yarn attw:check` (Types-AD-3)

---

## Types-AD-2 — attw profile and ignored rules — **Accepted**

`yarn attw:check` uses repo-root [`.attw.json`](../../.attw.json):

```json
{
  "profile": "esm-only",
  "ignoreRules": ["internal-resolution-error", "cjs-resolves-to-esm"]
}
```

| attw mode | Enforced? | Discarded because |
|-----------|-----------|-------------------|
| **node10** | No (`esm-only` ignores) | EOL; no RN consumer uses Node10 resolution |
| **node16-cjs** | No (`esm-only` ignores) | RN apps do not `require()` RNFB JS from Node; plugins are separate (Types-AD-3) |
| **node16-esm `InternalResolutionError`** | No (`ignoreRules`) | Extensionless `.d.ts` relative imports fail Node16 but **`bundler` passes** — covered by consumer tsc |
| **`CJSResolvesToESM`** | No (`ignoreRules`) | ESM-only published JS is intentional; Metro/bundler consumers resolve correctly |
| **node16-esm + bundler (remaining)** | **Yes** | Real export/type surface regressions for modern consumers |

attw has **no Node 22 or bundler-only profile**. This config is the closest match to the RN consumer matrix until upstream adds finer profiles.

**Advisory only (not a merge gate):** `attw --profile strict` may be run locally to see the full generic-npm report.

---

## Types-AD-3 — Expo config plugins: separate validation path — **Accepted**

Expo config plugins are **not** validated by discarding `app.plugin.js` from attw. They use a dedicated smoke test in `yarn attw:check`.

**How Expo loads library plugins:**

1. User adds `"@react-native-firebase/<module>"` to `app.json` / `app.config` `plugins`.
2. Expo CLI resolves `app.plugin.js` at the package root ([Expo library plugin docs](https://docs.expo.dev/config-plugins/development-for-libraries/)).
3. Root `app.plugin.js` is a one-line shim: `module.exports = require('./plugin/build/app.plugin')` (required at package root for Expo filesystem probe).
4. Plugin sources compile with `tsc --build plugin` (`@tsconfig/node-lts`) into `plugin/build/` — including `app.plugin.ts` (`export =`) for types and runtime entry.

**What we check for each package with `app.plugin.js`:**

| Check | Purpose |
|-------|---------|
| `plugin/build/app.plugin.js` exists after `prepare` | Tarball contains compiled Expo entry (`export =` from `plugin/src/app.plugin.ts`) |
| `exports["./app.plugin"]` + `exports["./app.plugin.js"].types` → `plugin/build/app.plugin.d.ts` | Strict Expo resolver + attw `export =` matches CJS shim |
| Consumer smoke: `npm pack` → temp install with `@react-native-firebase/app` (when needed) + `@expo/config-plugins` → `require('<pkg>/app.plugin.js')` | Matches Expo prebuild Node resolution |

**Packages with plugins (8):** `app`, `analytics`, `auth`, `messaging`, `crashlytics`, `perf`, `app-check`, `app-distribution`.

**Why attw `UntypedResolution` / `FalseExportDefault` on `app.plugin.js` was misleading:** attw compares the root CJS shim against declaration shape. `plugin/src/app.plugin.ts` compiles to `plugin/build/app.plugin.d.ts` with `export =`, matching `module.exports = require('./plugin/build/app.plugin')`. `plugin/build/index.d.ts` keeps `export default` for the implementation module. Runtime correctness is additionally covered by the consumer smoke test.

**Plugin layout:** committed TypeScript under `plugin/src/` (including `app.plugin.ts`); built JS + `.d.ts` under `plugin/build/` (gitignored). Package root keeps only the one-line `app.plugin.js` shim.

**Plugin authoring lint:** `yarn lint:plugin` per package (eslint on `plugin/src`) — run when editing plugin sources; not duplicated in attw script.

---

## Types-AD-4 — Perfection target — **Accepted**

**Merge gate “perfection”** means:

- `yarn tsc:compile:consumer` — zero errors
- `yarn attw:check` — zero errors under Types-AD-2 config **and** Expo plugin smoke passes

Fixing all 185 `strict` findings is **not** a merge requirement unless Types-AD-2 is revised.

Future improvement (Proposed): emit `.d.ts` with `.js` extension suffixes in relative imports to clear Node16 `InternalResolutionError` without ignoring the rule — only if we expand supported consumers beyond `bundler`.
