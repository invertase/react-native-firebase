# Other CI workflows

## macOS Jet e2e (`tests_e2e_other.yml`)

macOS e2e runs **Jet directly**: `yarn tests:macos:test-cover`; app launched via `open` in `tests/.jetrc.js`.

### Pipeline

1. Build macOS app (`yarn tests:macos:build`, `SKIP_BUNDLING=1`)
2. Start Firestore emulator
3. Start Metro (`yarn tests:packager:jet-ci`)
4. **Pre-fetch JS bundle**; URL must match app request
5. `yarn tests:macos:test-cover` — Jet `before` hook also prefetches, then `open` app

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

## Windows / shared

TBD — Windows workflows and shared actions (caches, Codecov, etc.).
