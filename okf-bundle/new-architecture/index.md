# New Architecture (TurboModules)

Durable architectural decisions for React Native Firebase TurboModules. Product changes use [change authoring](../testing/change-authoring-workflow.md), [running e2e](../testing/running-e2e.md), and [agent command policy](../testing/agent-command-policy.md) — not a separate migration checklist.

**Policy:** [OKF documentation and commit policy](../documentation-policy.md).

## Documents

* [Architecture decisions (ADR)](architecture-decisions.md) — **canonical owner** of durable decisions

## Reference implementation

* [`packages/functions`](../../../packages/functions/) — first TurboModule package ([PR #8603](https://github.com/invertase/react-native-firebase/pull/8603); new-arch-only from v24)
* [`packages/app`](../../../packages/app/) — first multi-spec package (`NativeRNFBTurboApp` + `NativeRNFBTurboUtils`)

## Related repository files

* [`packages/app/lib/internal/registry/nativeModule.ts`](../../../packages/app/lib/internal/registry/nativeModule.ts) — `turboModule` flag, null encoding, module wrapping
* [`packages/app/lib/internal/nullSerialization.ts`](../../../packages/app/lib/internal/nullSerialization.ts) — iOS null sentinel for TurboModule object args
* [`packages/functions/specs/NativeRNFBTurboFunctions.ts`](../../../packages/functions/specs/NativeRNFBTurboFunctions.ts) — Codegen spec pattern
* [`packages/functions/package.json`](../../../packages/functions/package.json) — `codegenConfig`, committed generated output
