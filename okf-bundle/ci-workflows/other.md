# Other CI workflows

## macOS Jet e2e (`tests_e2e_other.yml`)

macOS e2e runs **Jet directly** (no Detox): `yarn tests:macos:test-cover`. The test app is a react-native-macos binary launched via `open` in `tests/.jetrc.js`.

### Pipeline

1. Build macOS app (`yarn tests:macos:build`, `SKIP_BUNDLING=1`)
2. Start Firestore emulator
3. Start Metro (`yarn tests:packager:jet-ci`)
4. **Pre-fetch JS bundle** (workflow step) — must match the URL the app requests
5. `yarn tests:macos:test-cover` — Jet `before` hook also prefetches, then `open` app

### CI failure: bundle load hang / `Could not connect to development server`

**Symptom** — Jet logs `[💻] macOS app started` but never `[🟩] Jet client connected`. System log / `syslog` artifact shows:

```
HTTP load failed, 384/63910994 bytes (error code: -1017)
Could not connect to development server.
URL: http://localhost:8081/index.bundle?platform=macos&...&inlineSourceMap=false...
```

**Cause**

1. **Startup race** — `.jetrc.js` opened the app before Metro finished the first ~64MB bundle. The native HTTP client received a truncated response (`-1017`) and JS never loaded, so mocha-remote never connected.
2. **Prefetch URL mismatch** — CI warmed `inlineSourceMap=true` without `lazy` / `app=` query params, while the default `AppDelegate` requested `localhost` with `inlineSourceMap=false` — a cache miss and a second full bundle build at app launch.
3. **`localhost` vs `127.0.0.1`** — same class of issue as [iOS AppDelegate](ios.md#operational-notes); macOS can connect via `::1` while Metro is still streaming.

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

**Symptom** — immediate crash on first WS message after client connects:

```
TypeError: (0 , serialization_1.tryDeserialize) is not a function
    at Server.handleMessage (.../mocha-remote-server/dist/Server.js:149)
```

**Cause** — `Server.js` patch called `tryDeserialize` but the helper was never added to `dist/serialization.js`.

**Fix** — export `tryDeserialize` from `serialization.js` in `.yarn/patches/mocha-remote-server-npm-1.13.2-*.patch`; run `yarn patch-commit` + `yarn install` so `yarn.lock` hash updates.

### Related

- [iOS CI](ios.md) — simulator + Detox; shared Jet / mocha-remote patches
- [Coverage design](../testing/coverage-design.md) — macOS uploads `e2e-ts-macos` only (no native gate)

## Windows / shared

TBD — Windows workflows and shared actions (caches, Codecov, etc.).
