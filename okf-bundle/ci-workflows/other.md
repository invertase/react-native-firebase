# Other CI workflows

## macOS e2e (`tests_e2e_other.yml`)

Local macOS e2e: [running e2e § Rules](../testing/running-e2e.md#rules) only. CI pipeline below mirrors `tests_e2e_other.yml` (uses `-ci` packager variants).

### Pipeline (CI — mirrors `tests_e2e_other.yml`; local operators use [running e2e](../testing/running-e2e.md) only)

1. Build macOS app (`tests:macos:build`, `SKIP_BUNDLING=1`)
2. Start Firestore emulator
3. Start Metro (`tests:packager:jet-ci` — CI variant; local: [running e2e § Rules #1](../testing/running-e2e.md#rules))
4. **Pre-fetch JS bundle**; URL must match app request
5. `tests:macos:test-cover` — internal `before` hook prefetches, then `open` app

### CI failure: bundle load hang / `Could not connect to development server`

**Symptom** — `[💻] macOS app started` but no `[🟩] Jet client connected`; `syslog` shows:

```
HTTP load failed, <partial>/<bundle-size> bytes (error code: -1017)
Could not connect to development server.
URL: http://localhost:8081/index.bundle?platform=macos&...&inlineSourceMap=false...
```

**Cause**

1. **Startup race** — app opened before Metro finished bundle; native HTTP got truncated response (`-1017`), JS never loaded.
2. **Prefetch URL mismatch** — warmed URL differed from app request, causing cache miss and second bundle build.
3. **`localhost` vs `127.0.0.1`** — same class as [iOS AppDelegate](ios.md#operational-notes); macOS may use `::1` while Metro streams.

**Mitigations in this repo**

| Change | Location |
|--------|----------|
| `127.0.0.1` + explicit `inlineSourceMap:YES` bundle URL (mirrors iOS) | `tests/macos/io.invertase.testing-macOS/AppDelegate.mm` |
| `waitForMetroMacosBundle()` before `open` app | `tests/.jetrc.js` → `macos.before` |
| CI prefetch uses **exact** bundle query string (127.0.0.1, `lazy`, `inlineSourceMap=true`, `app=`) | `.github/workflows/tests_e2e_other.yml` |

**Diagnosing**

```bash
rg 'Could not connect to development server|HTTP load failed|Jet client connected|macOS Metro bundle prefetched' detox-step.log syslog.log
log show --predicate 'process == "io.invertase.testing"' --last 10m --style compact | rg 'development server|HTTP load failed'
```

### CI failure: `tryDeserialize is not a function` (mocha-remote-server patch)

**Symptom** — crash on first WS message:

```
TypeError: (0 , serialization_1.tryDeserialize) is not a function
    at Server.handleMessage (.../mocha-remote-server/dist/Server.js:149)
```

**Cause** — patch called `tryDeserialize` but did not add it to `dist/serialization.js`.

**Fix** — export `tryDeserialize` in `.yarn/patches/mocha-remote-server-npm-1.13.2-*.patch`; run `yarn patch-commit` + `yarn install`.

### Related

- [iOS CI](ios.md) — simulator + Detox; shared Jet / mocha-remote patches
- [Coverage design](../testing/coverage-design.md) — macOS uploads `e2e-ts-macos` only (no native gate)
- [Cloud API quota triage](../testing/firebase-testing-project.md#ci-triage-cloud-api-quota-pressure) — live FIS/RC pressure (macOS loads RC; shared project with all matrix legs)

## Windows / shared

TBD — Windows workflows and shared actions (caches, Codecov, etc.).
