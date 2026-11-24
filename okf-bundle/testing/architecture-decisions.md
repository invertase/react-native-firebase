---
type: Reference
title: Published types and CI decisions (ADR)
description: Canonical owner of durable decisions for published-package type checking (attw, consumer tsc, Expo config plugins).
tags: [testing, types, attw, expo, adr]
timestamp: 2026-11-24T00:00:00Z
---

# Published types and CI decisions (ADR)

**Canonical owner** of durable decisions for how RNFB validates published package types in CI. Procedure and commands: [validation checklist](validation-checklist.md). Implementation: `.attw.json`, `.github/scripts/attw/`, `tsconfig.consumer.json`.

**Related (separate owner):** Android JVM unit testing — [AndroidTest-AD-1](android-architecture-decisions.md#androidtest-ad-1). iOS XCTest — [IosTest-AD-1](ios-architecture-decisions.md#iostest-ad-1).

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
| Node (app dev) | RN 0.84+ → Node **22.11.0+**; RN 0.81–0.83 → Node **20.19.4+** | See [RN support matrix](https://github.com/reactwg/react-native-releases/blob/main/docs/support.md) |
| TypeScript (app) | `moduleResolution: "bundler"` | `yarn tsc:compile:consumer` |
| TypeScript (app) | `moduleResolution: "node16"` / `"nodenext"` (ESM), with `skipLibCheck: true` | `yarn attw:check` (`node16-esm`) |

**Why:** Node 10 is EOL. RN apps resolve `@react-native-firebase/*` through Metro (`bundler`), not through Node10/Node16-CJS `require()`. Apps that type-check with `nodenext` read the same `dist/typescript` output as ESM (`dist/typescript/package.json` is `"type": "module"`), so `node16-esm` is supported, assuming `skipLibCheck: true` (a common default, for example in Expo's base tsconfig). `skipLibCheck: false` is not supported in any resolution mode: published declaration files report library-check errors, such as imports whose target has no declaration (for example firestore's side-effect import of `react-native-url-polyfill/auto`, reported on TypeScript 6+, where `noUncheckedSideEffectImports` is on by default). An import in a published `.d.ts` that does not resolve is silent with `skipLibCheck: true`, and the imported names become `any`. See [known gaps](#types-ad-2-known-gaps) for imports attw does not check. attw `strict` mostly reports resolution modes our consumers never use.

The Node version needed to build the repo itself is in [CONTRIBUTING § Local Setup](../../CONTRIBUTING.md#local-setup).

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
  "ignoreRules": ["cjs-resolves-to-esm"]
}
```

| attw mode | Enforced? | Discarded because |
|-----------|-----------|-------------------|
| **node10** | No (`esm-only` ignores) | EOL; no RN consumer uses Node10 resolution |
| **node16-cjs** | No (`esm-only` ignores) | RN apps do not `require()` RNFB JS from Node; plugins are separate (Types-AD-3) |
| **`CJSResolvesToESM`** | No (`ignoreRules`) | ESM-only published JS is intentional; Metro/bundler consumers resolve correctly |
| **node16-esm + bundler** | **Yes** | Real export/type surface regressions for modern consumers, including `InternalResolutionError` |

`InternalResolutionError` under `node16-esm` catches relative imports in `.d.ts` files that do not resolve under Node ESM rules, for example a missing `.js` extension. `react-native-builder-bob` 0.42+ adds the extension to declaration imports when building with `esm: true`.

<a id="types-ad-2-known-gaps"></a>

**Known gaps attw does not cover:**

- **Wildcard subpaths.** attw skips `exports` keys that contain `*`, so `./dist/module/internal/*` and `./dist/module/common/*` in `app` are never resolved. For example, `internal/web/firebaseAppCheck.d.ts`, `firebaseRemoteConfig.d.ts` and `firebaseInstallations.d.ts` import `./memidb`, which has no emitted declaration. No non-wildcard entrypoint's types load these files, so this has no consumer impact unless a package's public types start importing them.
- **Imports into other packages.** attw checks one package at a time and does not resolve type imports into another RNFB package (for example `@react-native-firebase/app/dist/module/types/common`). `yarn tsc:compile:consumer` runs with `skipLibCheck: true`, so an unresolved import inside a published `.d.ts` is silent there too. It catches one only when a `consumer-type-test.ts` uses an affected type in a way that fails once the type becomes `any` (for example a `@ts-expect-error` assertion), and `paths` aliases in `tsconfig.consumer.json` can mask a missing `exports` entry.
- **Relative module augmentations.** bob rewrites import and export specifiers, not the name in `declare module '../x'`, and attw itself does not check augmentations. Under `nodenext` an augmentation whose name does not resolve is dropped silently, even with `skipLibCheck: false`, so the members it adds disappear. Write relative augmentation names with the `.js` extension in `lib` sources (for example `declare module '../types/firestore.js'`). `yarn attw:check` fails on any relative `declare module` name in a published package's `dist/**/*.d.ts` that does not end in `.js` or has no matching `.d.ts`.
- **Augmentations of other packages.** Packages augment `@react-native-firebase/app/dist/module/internal/NativeModules`, which resolves only through app's `./dist/module/internal/*` export. Nothing checks that these names resolve; if that export is removed or narrowed, the augmentations are dropped silently under both `bundler` and `nodenext`, and `paths` aliases in `tsconfig.consumer.json` hide it.

**Allowed findings.** Bob deliberately leaves imports of platform-specific modules (a module with platform variants, for example `.ios` / `.android` / `.web`) without an extension, so Metro can pick the platform file at runtime, and the declaration import then fails `node16-esm`. These exact findings are allowed in `ALLOWED_ISSUES` in `.github/scripts/attw/src/index.ts`:

| Package | Entrypoint | Importing file | Import | Why it is accepted |
|---------|------------|----------------|--------|--------------------|
| `ai` | `.` | `dist/typescript/lib/index.d.ts` | `./polyfills` | Side-effect import; it adds no types |
| `app` | `./dist/module/internal` | `dist/typescript/lib/internal/index.d.ts` | `./nativeModule` | Only `getReactNativeModule` / `setReactNativeModule` lose their types, and no published package's types use them. firestore types load this file. |

With `skipLibCheck: false`, a `nodenext` app that uses `firestore` gets a library-check error from the `./nativeModule` import, and one that uses `ai` or `vertexai` (which re-exports `ai`) gets one from `./polyfills` on TypeScript 6+ or with `noUncheckedSideEffectImports`.

Maintaining the list:

- An entry matches package, entrypoint, resolution, problem, importing file and import, not what the import brings in, and absorbs at most one finding. Re-check the reason when either importing file changes (for example if `./nativeModule` starts exporting more names, the existing import still matches but loses more types).
- The entrypoint is the first one attw reports the finding under. If a new export reaches the file first, the check reports the finding as both enforced and stale; update the entrypoint rather than removing the entry.
- An entry that no longer occurs (for example after a bob release adds extensions to platform-module declaration imports) fails `yarn attw:check` until it is removed. Add entries only for platform-specific module imports.

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
- `yarn attw:check` — zero errors under Types-AD-2 config (allowed findings matched, none stale) **and** Expo plugin smoke passes

Fixing all `strict` findings is **not** a merge requirement unless Types-AD-2 is revised.

---

<a id="types-ad-5--pack-ignores-nested-ios-unit-build-trees--accepted"></a>

## Types-AD-5 — attw packs an allowlisted stage — **Accepted**

`yarn attw:check` must not pack from the live package tree. Yarn still **walks** ignored directories during pack (known), so `.npmignore` alone does not keep nested XCTest `ios/**/build` trees (volatile derived data) out of the pack walk when those trees exist beside published sources.

**Required for attw / Expo plugin smoke:** stage a temp directory containing **only if present** these roots — `package.json`, `dist/`, `lib/`, `app.plugin.js`, `plugin/build/` — then `yarn pack` with `cwd` set to that stage (include-not-exclude). Shared helper for both attw and Expo smoke packs.

**Still required for real publish packs:** package `.npmignore` includes `ios/**/build` (in addition to `ios/build`). That remains the publish-path exclude; it is not a substitute for attw staging.

**Not** the required attw fix: `package.json` `files` allowlists on every package, or serializing attw vs `yarn tests:ios:unit`.

`yarn attw:check` **may stay parallel** with `yarn tests:ios:unit` in `scripts/run-full-tests.sh`. Allowlist staging is what keeps pack safe under concurrency; do not treat serializing those steps as the contract.
