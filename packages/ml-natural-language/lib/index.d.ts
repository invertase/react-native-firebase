/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase ML Kit package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `mlKitLanguage` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml-natural-language';
 *
 * // firebase.mlKitLanguage().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `mlKitLanguage` package:
 *
 * ```js
 * import mlKitLanguage from '@react-native-firebase/ml-natural-language';
 *
 * // mlKitLanguage().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/ml-natural-language';
 *
 * // firebase.mlKitLanguage().X
 * ```
 *
 * @firebase ml-natural-language
 */
export namespace MLKitLanguage {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {}

  /**
   * An interface representing the language identification options to be used with the
   * `identifyLanguage` and `identifyPossibleLanguages` methods.
   */
  export interface LanguageIdentificationOptions {
    /**
     * The confidence threshold for language identification. The identified languages will have a
     * confidence higher or equal to the confidence threshold. The value should be between 0 and 1, e.g. 0.5.
     *
     * If no value is set, a default value is used instead.
     *
     */
    confidenceThreshold?: number;
  }

  /**
   * An identified language for the given input text. Returned as an Array of IdentifiedLanguage from
   * `identifyPossibleLanguages`.
   */
  export interface IdentifiedLanguage {
    /**
     * The [BCP-47 language code](https://en.wikipedia.org/wiki/IETF_language_tag) for the language, e.g. 'en'.
     */
    language: string;

    /**
     * The confidence score of the language. A float value between 0 and 1.
     */
    confidence: number;
  }

  /**
   * An interface representing a suggest reply, an array of these are returned from `SmartReplyConversation.getSuggestedReplies`
   *
   * #### Example
   *
   * ```js
   * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
   * conversation.addRemoteUserMessage('hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
   *
   * const suggestedReplies = await conversation.getSuggestedReplies();
   * console.log(suggestedReplies); // [ { text: 'Sure' }, ...etc ]
   * ```
   */
  export interface SuggestedReply {
    text: string;
  }

  /**
   * A class representing a Smart Reply conversation in your app.
   *
   * #### Example
   *
   * ```js
   * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
   * ```
   *
   */
  export class SmartReplyConversation {
    /**
     * Add a local message to this conversation, e.g. for the currently signed in user on this device.
     *
     * #### Example
     *
     * ```js
     * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
     * conversation.addRemoteUserMessage('Hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
     * conversation.addLocalUserMessage('That sounds great!');
     * conversation.addRemoteUserMessage('Great, does 12pm work for you?', Date.now(), 'jimBobTheGreat');
     *
     * const suggestedReplies = await conversation.getSuggestedReplies();
     * console.log(suggestedReplies); // [ { text: 'Sure' }, ...etc ]
     * ```
     *
     * @param text The local users message text.
     * @param timestamp The timestamp of when the message was created.
     */
    addLocalUserMessage(text: string, timestamp?: number): void;

    /**
     * Add a remote message to this conversation, e.g. for a user that's not on this device.
     *
     * #### Example
     *
     * ```js
     * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
     * conversation.addRemoteUserMessage('hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
     *
     * const suggestedReplies = await conversation.getSuggestedReplies();
     * console.log(suggestedReplies); // [ { text: 'Sure' }, ...etc ]
     * ```
     *
     * @param text The remote users message text.
     * @param timestamp The timestamp of when the message was received.
     * @param remoteUserId The remote users identifier in your app.
     */
    addRemoteUserMessage(text: string, timestamp: number, remoteUserId: string): void;

    /**
     * Get suggested replies for the current conversation.
     *
     * #### Example
     *
     * ```js
     * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
     * conversation.addRemoteUserMessage('hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
     *
     * const suggestedReplies = await conversation.getSuggestedReplies();
     * console.log(suggestedReplies); // [ { text: 'Sure' }, ...etc ]
     * ```
     */
    getSuggestedReplies(): Promise<SuggestedReply[]>;

    /**
     * Removes all messages from this conversation, e.g. all messages added via `addLocalUserMessage` and `addRemoteUserMessage`.
     *
     * #### Example
     *
     * ```js
     * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
     * conversation.addRemoteUserMessage('hey, want to get lunch today?', Date.now(), 'jimBobTheGreat');
     * // start over
     * conversation.clearMessages();
     * ```
     */
    clearMessages(): void;
  }

  /**
   * The Firebase ML Kit service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the ML Kit service for the default app:
   *
   * ```js
   * const defaultAppMLKit = firebase.mlKitLanguage();
   * ```
   */
  export class Module extends FirebaseModule {
    /**
     * Identifies the main language for the given text.
     *
     * Returns a promise that resolves with a [BCP-47 language code](https://en.wikipedia.org/wiki/IETF_language_tag) of the detected language.
     *
     * If the language was undetected or unknown the code returned is `und`.
     *
     * #### Example
     *
     * ```js
     * const language = await firebase.mlKitLanguage().identifyLanguage('Hello there. General Kenobi.');
     * console.warn(language); // en
     *
     * const unknownLanguage = await firebase.mlKitLanguage().identifyLanguage('foo bar baz', { confidenceThreshold: 0.9 });
     * console.warn(language); // und
     * ```
     *
     * @param text The input text to use for identifying the language. Inputs longer than 200 characters are truncated to 200 characters, as longer input does not improve the detection accuracy.
     * @param options See `LanguageIdentificationOptions`.
     */
    identifyLanguage(text: string, options?: LanguageIdentificationOptions): Promise<string>;

    /**
     * Identifies possible languages for the given text.
     *
     * #### Example
     *
     * ```js
     * const identifiedLanguages = firebase.mlKitLanguage().identifyPossibleLanguages('hello world');
     * console.warn(identifiedLanguages[0].language); // en
     * ```
     *
     * @param text The input text to use for identifying the language. Inputs longer than 200 characters are truncated to 200 characters, as longer input does not improve the detection accuracy.
     * @param options See `LanguageIdentificationOptions`.
     */
    identifyPossibleLanguages(
      text: string,
      options?: LanguageIdentificationOptions,
    ): Promise<IdentifiedLanguage[]>;

    /**
     * Returns a new instance of SmartReplyConversation.
     *
     * #### Example
     *
     * ```js
     * const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
     * ```
     *
     * @param messageHistoryLimit Optional value to specify the number of messages to keep in history, messages in history are used with `SmartReplyConversation.getSuggestedReplies` and are sent natively every time this method is called. Defaults to 30.
     */
    newSmartReplyConversation(messageHistoryLimit?: number): SmartReplyConversation;
  }
}

declare module '@react-native-firebase/ml-natural-language' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<MLKitLanguage.Module, MLKitLanguage.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

    interface Module {
      mlKitLanguage: FirebaseModuleWithStaticsAndApp<MLKitLanguage.Module, MLKitLanguage.Statics>;
    }

    interface FirebaseApp {
      mlKitLanguage(): MLKitLanguage.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    ml_natural_language_language_id_model: boolean;
    ml_natural_language_smart_reply_model: boolean;
  }
}
