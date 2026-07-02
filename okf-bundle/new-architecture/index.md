# New Architecture (TurboModules)

TurboModule migration for React Native Firebase native bridge packages.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Documents

* [Architecture decisions (ADR)](architecture-decisions.md) — **canonical owner** of durable decisions (the "what + why"); other docs reference it
* [Migration work queue](migration-work-queue.md) — ephemeral gates, phase ordering, package inventory
* [TurboModule implementation workflow](turbomodule-implementation-workflow.md) — spec/codegen/native conversion, area harness; extends [change authoring](../testing/change-authoring-workflow.md)

## Reference implementation

* [`packages/functions`](../../../packages/functions/) — first TurboModule package ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603); new-arch-only from v24)
* [`packages/app`](../../../packages/app/) — Phase 0 foundation; first [multi-spec package](migration-work-queue.md#package-inventory) (`NativeRNFBTurboApp` + `NativeRNFBTurboUtils`); see [workflow § multi-spec / gotchas](turbomodule-implementation-workflow.md#multi-spec-packages-app-precedent)

## Related repository files

* [`packages/app/lib/internal/registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) — `turboModule` flag, null encoding, module wrapping
* [`packages/app/lib/internal/nullSerialization.ts`](../../../packages/app/lib/internal/nullSerialization.ts) — iOS null sentinel for TurboModule object args
* [`packages/functions/specs/NativeRNFBTurboFunctions.ts`](../../../packages/functions/specs/NativeRNFBTurboFunctions.ts) — Codegen spec pattern
* [`packages/functions/package.json`](../../../packages/functions/package.json) — `codegenConfig`, committed generated output
