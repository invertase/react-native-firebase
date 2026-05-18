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
      name: 'ChatSessionBase',
      reason:
        'Base class used by the firebase-js-sdk template chat implementation. RN Firebase exposes its concrete chat session surface instead.',
    },
    {
      name: 'StartTemplateChatParams',
      reason:
        'Template chat startup parameters are part of the firebase-js-sdk template chat API, which RN Firebase does not currently expose.',
    },
    {
      name: 'TemplateChatSession',
      reason:
        'Template chat sessions are not currently part of the RN Firebase public AI API.',
    },
    {
      name: 'TemplateFunctionDeclaration',
      reason:
        'Template function declaration helpers are part of firebase-js-sdk template tooling that RN Firebase does not currently expose.',
    },
    {
      name: 'TemplateFunctionDeclarationsTool',
      reason:
        'Template function declaration tools are part of firebase-js-sdk template tooling that RN Firebase does not currently expose.',
    },
    {
      name: 'TemplateTool',
      reason:
        'Template tool unions are part of firebase-js-sdk template tooling that RN Firebase does not currently expose.',
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
        'RN Firebase chat sessions expose `getHistory()` directly on the concrete class while the firebase-js-sdk inherits it from `ChatSessionBase`.',
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
      name: 'GenerationConfig',
      reason:
        'RN Firebase does not currently expose the JS SDK `responseJsonSchema` generation config field.',
    },
    {
      name: 'RequestOptions',
      reason:
        'RN Firebase does not currently expose `maxSequentialFunctionCalls`, so its request options are limited to timeout and base URL.',
    },
    {
      name: 'TemplateGenerativeModel',
      reason:
        'RN Firebase template generative models do not currently expose `startChat`, so template chat sessions remain absent.',
    },
    {
      name: 'UsageMetadata',
      reason:
        'RN Firebase usage metadata does not currently surface tool-use and cache token accounting fields that are present in the JS SDK declaration.',
    },
  ],
};

export default config;
