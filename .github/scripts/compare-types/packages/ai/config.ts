/*
 * Known differences between the firebase-js-sdk AI public API and the
 * @react-native-firebase/ai public API.
 *
 * Reference: .github/scripts/compare-types/packages/ai/firebase-sdk.d.ts (JS SDK snapshot).
 * RN Firebase built types: packages/ai/dist/typescript/lib/(any subdir)/*.d.ts
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 *
 * Sections:
 *  nameMapping     - exports that exist in both but under different names
 *  missingInRN     - firebase-js-sdk exports absent from RN Firebase
 *  extraInRN       - RN Firebase exports not present in the firebase-js-sdk
 *  differentShape  - exports present in both but with differing signatures/members
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [
    {
      name: 'startAudioConversation',
      reason:
        'Browser-only audio conversation helper built on Web Audio and getUserMedia. React Native has no equivalent built-in implementation.',
    },
    {
      name: 'AudioConversationController',
      reason:
        'Browser-only audio conversation controller for the Web Audio based live-session helpers. Not available in React Native.',
    },
    {
      name: 'StartAudioConversationOptions',
      reason:
        'Options type for the browser-only audio conversation helper APIs, which are intentionally not implemented in React Native.',
    },
    {
      name: 'ChromeAdapter',
      reason:
        "Chrome on-device AI adapter is browser-specific and intentionally not supported by React Native Firebase's AI package.",
    },
    {
      name: 'HybridParams',
      reason:
        'Hybrid mode combines Chrome on-device AI with cloud inference, which is a browser-only feature and intentionally absent in React Native.',
    },
    {
      name: 'OnDeviceParams',
      reason:
        'On-device inference params are only used by the browser Chrome adapter / hybrid flow, which is not supported in React Native.',
    },
    {
      name: 'InferenceSource',
      reason:
        'Inference source only reports whether a hybrid request ran on-device or in-cloud. React Native Firebase does not support hybrid/on-device inference.',
    },
    {
      name: 'LanguageModelCreateCoreOptions',
      reason:
        'Chrome Prompt API type for browser on-device language models. Not relevant to the React Native runtime.',
    },
    {
      name: 'LanguageModelCreateOptions',
      reason:
        'Chrome Prompt API type for browser on-device language models. Not relevant to the React Native runtime.',
    },
    {
      name: 'LanguageModelExpected',
      reason:
        'Chrome Prompt API type tied to browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelMessage',
      reason:
        'Chrome Prompt API message type used by browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelMessageContent',
      reason:
        'Chrome Prompt API content type used by browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelMessageContentValue',
      reason:
        'Chrome Prompt API content value type used by browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelMessageRole',
      reason:
        'Chrome Prompt API role type used by browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelMessageType',
      reason:
        'Chrome Prompt API message type discriminator used by browser-only on-device language model integration.',
    },
    {
      name: 'LanguageModelPromptOptions',
      reason:
        'Chrome Prompt API prompt options type used by browser-only on-device language model integration.',
    },
    {
      name: 'AnyOfSchema',
      reason:
        'RN Firebase schema-builder does not currently expose the `anyOf` helper class, so union-schema composition is not part of the public RN AI API.',
    },
    {
      name: 'LiveServerGoingAwayNotice',
      reason:
        'RN Firebase live sessions do not currently surface the server `goingAwayNotice` message type in the public API.',
    },
    {
      name: 'ObjectSchemaRequest',
      reason:
        'RN Firebase exposes `ObjectSchemaInterface` for schema helper typing, but does not separately export the raw request-shape `ObjectSchemaRequest` type.',
    },
    {
      name: 'SingleRequestOptions',
      reason:
        'RN Firebase does not currently expose per-call request overrides such as `AbortSignal`; requests are configured via model-level `RequestOptions` only.',
    },
    {
      name: 'ThinkingLevel',
      reason:
        'RN Firebase supports thinking budgets but does not currently expose the JS SDK `ThinkingLevel` preset constants/type.',
    },
  ],
  extraInRN: [
    {
      name: 'GroundingAttribution',
      reason:
        'Deprecated legacy grounding attribution type retained in RN Firebase declarations for compatibility, even though the JS SDK no longer exports it publicly.',
    },
    {
      name: 'ObjectSchemaInterface',
      reason:
        'RN Firebase-specific schema helper interface used by the local schema-builder implementation and request typing.',
    },
  ],
  differentShape: [
    {
      name: 'getAI',
      reason:
        'RN Firebase uses `ReactNativeFirebase.FirebaseApp` and injects auth/app-check modules directly instead of the firebase-js-sdk provider-based app wiring.',
    },
    {
      name: 'getGenerativeModel',
      reason:
        'RN Firebase intentionally accepts only `ModelParams`; the firebase-js-sdk also accepts browser-only `HybridParams` for Chrome on-device AI.',
    },
    {
      name: 'AI',
      reason:
        'RN Firebase uses `ReactNativeFirebase.FirebaseApp` and exposes direct `auth` / `appCheck` module references instead of firebase-js-sdk provider-based internals.',
    },
    {
      name: 'AIOptions',
      reason:
        'RN Firebase includes direct `auth` and `appCheck` modules in options because it does not use firebase-js-sdk providers.',
    },
    {
      name: 'EnhancedGenerateContentResponse',
      reason:
        'RN Firebase does not expose `inferenceSource` because hybrid on-device / in-cloud inference is a browser-only feature.',
    },
    {
      name: 'Citation',
      reason:
        'RN Firebase inlines the protobuf date type as local `Date`, while the firebase-js-sdk declaration references a generated alias name. The public structure is equivalent.',
    },
    {
      name: 'InferenceMode',
      reason:
        'RN Firebase omits the browser-only in-cloud preference mode used by Chrome hybrid/on-device inference, so the enum-like object has fewer values.',
    },
    {
      name: 'URLRetrievalStatus',
      reason:
        'Both packages expose the same URL retrieval status constants, but the generated declaration text differs (`string`-valued object in JS SDK vs readonly literal constants in RN).',
    },
    {
      name: 'ChatSession',
      reason:
        'RN Firebase chat sessions do not currently accept per-call `SingleRequestOptions`, so `sendMessage` and `sendMessageStream` expose fewer parameters.',
    },
    {
      name: 'FunctionDeclaration',
      reason:
        'RN Firebase function declarations accept `ObjectSchemaInterface` only and do not expose the JS SDK `functionReference` auto-calling hook.',
    },
    {
      name: 'FunctionResponse',
      reason:
        'RN Firebase function responses omit the optional `parts` field from the JS SDK declaration and only expose the structured response payload.',
    },
    {
      name: 'GenerativeModel',
      reason:
        'RN Firebase generative model methods do not currently accept per-call `SingleRequestOptions`, so request overrides are limited to model-level `RequestOptions`.',
    },
    {
      name: 'ImagenModel',
      reason:
        'RN Firebase Imagen model requests do not currently accept per-call `SingleRequestOptions`, so request overrides are limited to model-level `RequestOptions`.',
    },
    {
      name: 'LiveResponseType',
      reason:
        'RN Firebase live response typing omits `GOING_AWAY_NOTICE` because `LiveServerGoingAwayNotice` is not currently surfaced in the public API.',
    },
    {
      name: 'LiveSession',
      reason:
        'RN Firebase live sessions do not currently expose `LiveServerGoingAwayNotice` from `receive()`, so the response union is smaller than the JS SDK.',
    },
    {
      name: 'RequestOptions',
      reason:
        'RN Firebase does not currently expose `maxSequentalFunctionCalls`, so its request options are limited to timeout and base URL.',
    },
    {
      name: 'Schema',
      reason:
        'RN Firebase schema-builder requires an explicit `type` and does not expose the JS SDK `anyOf` helper, so the public schema shape differs.',
    },
    {
      name: 'SchemaInterface',
      reason:
        'RN Firebase schema interfaces require an explicit `type`, whereas the JS SDK declaration leaves `type` optional in the base interface.',
    },
    {
      name: 'SchemaRequest',
      reason:
        'RN Firebase request-shaped schemas require an explicit `type`, whereas the JS SDK declaration leaves `type` optional.',
    },
    {
      name: 'SchemaShared',
      reason:
        'RN Firebase shared schema typing omits the JS SDK `anyOf` property because `AnyOfSchema` is not currently part of the public RN API.',
    },
    {
      name: 'TemplateGenerativeModel',
      reason:
        'RN Firebase template generative model methods do not currently accept per-call `SingleRequestOptions`, so request overrides are limited to model-level `RequestOptions`.',
    },
    {
      name: 'TemplateImagenModel',
      reason:
        'RN Firebase template Imagen model methods do not currently accept per-call `SingleRequestOptions`, so request overrides are limited to model-level `RequestOptions`.',
    },
    {
      name: 'ThinkingConfig',
      reason:
        'RN Firebase thinking config supports `thinkingBudget` and `includeThoughts`, but does not currently expose the JS SDK `thinkingLevel` preset field.',
    },
    {
      name: 'TypedSchema',
      reason:
        'RN Firebase typed schema unions do not currently include `AnyOfSchema`, so the exported union is smaller than the JS SDK version.',
    },
    {
      name: 'UsageMetadata',
      reason:
        'RN Firebase usage metadata does not currently surface tool-use and cache token accounting fields that are present in the JS SDK declaration.',
    },
  ],
};

export default config;
