/*
 * Known differences between the firebase-js-sdk AI public API and the
 * @react-native-firebase/ai public API.
 *
 * Reference: root node_modules/firebase AI public types.
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

import type { PackageConfig } from '../src/types';

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
      name: 'LanguageModelDownloadMonitor',
      reason:
        'Chrome Prompt API download monitor type for browser on-device language models. Not relevant to the React Native runtime.',
    },
    {
      name: 'LanguageModelExpected',
      reason: 'Chrome Prompt API type tied to browser-only on-device language model integration.',
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
      name: 'ContextWindowCompressionConfig',
      reason:
        'Live session context window compression config added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GoogleMaps',
      reason:
        'Google Maps grounding tool added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GoogleMapsGroundingChunk',
      reason:
        'Google Maps grounding chunk type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GoogleMapsTool',
      reason:
        'Google Maps tool type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'ImageConfig',
      reason:
        'Image generation config type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'ImageConfigAspectRatio',
      reason:
        'Image aspect ratio type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'ImageConfigImageSize',
      reason:
        'Image size type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LatLng',
      reason:
        'Latitude/longitude type for Google Maps grounding added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LiveSessionResumptionUpdate',
      reason:
        'Live session resumption update type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'RetrievalConfig',
      reason:
        'Tool retrieval config type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'SessionResumptionConfig',
      reason:
        'Live session resumption config added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'SlidingWindow',
      reason:
        'Context window compression sliding window type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
    },
    {
      name: 'TemplateToolConfig',
      reason:
        'Template tool config type added in firebase-js-sdk; not yet implemented in React Native Firebase.',
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
      name: 'FinishReason',
      reason:
        'firebase-js-sdk added image, tool, and response finish-reason constants; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GenerationConfig',
      reason:
        'firebase-js-sdk added `imageConfig` to generation config; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GenerativeModel',
      reason:
        'firebase-js-sdk added browser-only `initializeDeviceModel()` for Chrome on-device language models; not implemented in React Native Firebase.',
    },
    {
      name: 'GroundingChunk',
      reason:
        'firebase-js-sdk added Google Maps grounding chunks; not yet implemented in React Native Firebase.',
    },
    {
      name: 'GroundingMetadata',
      reason:
        'firebase-js-sdk added `googleMapsWidgetContextToken`; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LiveGenerationConfig',
      reason:
        'firebase-js-sdk added `contextWindowCompression`; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LiveGenerativeModel',
      reason:
        'firebase-js-sdk added session resumption support to `connect()`; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LiveResponseType',
      reason:
        'firebase-js-sdk added `SESSION_RESUMPTION_UPDATE`; not yet implemented in React Native Firebase.',
    },
    {
      name: 'LiveSession',
      reason:
        'firebase-js-sdk added session resumption APIs (`connectionPromise`, `resumeSession`, resumption updates in `receive()`); not yet implemented in React Native Firebase.',
    },
    {
      name: 'TemplateGenerativeModel',
      reason:
        'firebase-js-sdk added `TemplateToolConfig` parameter to template generation methods; not yet implemented in React Native Firebase.',
    },
    {
      name: 'Tool',
      reason:
        'firebase-js-sdk added `GoogleMapsTool` to the tool union; not yet implemented in React Native Firebase.',
    },
    {
      name: 'ToolConfig',
      reason:
        'firebase-js-sdk added `retrievalConfig`; not yet implemented in React Native Firebase.',
    },
  ],
};

export default config;
