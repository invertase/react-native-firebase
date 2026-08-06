# @react-native-firebase/ai

Knowledge for the Firebase AI Logic modular package (`getAI`, backends, generative models).

## Documents

* [Agent Platform rename work queue](agent-platform-rename-work-queue.md) — ephemeral gates for CPRN-293 (`VertexAIBackend` → `AgentPlatformBackend`)

## Related repository files

* [`packages/ai/lib/backend.ts`](../../../packages/ai/lib/backend.ts) — `GoogleAIBackend`, `VertexAIBackend` (deprecated), `AgentPlatformBackend`
* [`packages/ai/lib/constants.ts`](../../../packages/ai/lib/constants.ts) — `DEFAULT_LOCATION` (`global`), `LEGACY_DEFAULT_LOCATION` (`us-central1`)
* [`packages/ai/lib/public-types.ts`](../../../packages/ai/lib/public-types.ts) — `BackendType`, `AI`, `AIOptions`
* [`packages/ai/lib/index.ts`](../../../packages/ai/lib/index.ts) — `getAI` and public exports
* [`.github/scripts/compare-types/configs/ai.ts`](../../../.github/scripts/compare-types/configs/ai.ts) — firebase-js-sdk type parity
