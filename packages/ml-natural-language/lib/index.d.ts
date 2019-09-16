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
 * Access the firebase export from the `naturalLanguage` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml-natural-language';
 *
 * // firebase.naturalLanguage().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `naturalLanguage` package:
 *
 * ```js
 * import naturalLanguage from '@react-native-firebase/ml-natural-language';
 *
 * // naturalLanguage().X
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
 * // firebase.naturalLanguage().X
 * ```
 *
 * @firebase ml-natural-language
 */
export namespace FirebaseMLKitLanguage {
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
   * An interface representing a suggest reply, an array of these are returned from `suggestReplies`
   *
   */
  export interface SuggestedReply {
    /**
     * The smart reply text.
     */
    text: string;
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
   * const defaultAppMLKit = firebase.naturalLanguage();
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
     * const language = await firebase.naturalLanguage().identifyLanguage('Hello there. General Kenobi.');
     * console.warn(language); // en
     *
     * const unknownLanguage = await firebase.naturalLanguage().identifyLanguage('foo bar baz', { confidenceThreshold: 0.9 });
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
     * const identifiedLanguages = firebase.naturalLanguage().identifyPossibleLanguages('hello world');
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
     * Returns suggested replies for a conversation.
     *
     * #### Example
     *
     * ```js
     * const replies = await firebase.naturalLanguage().suggestReplies([
     *   { text: "Hey, long time no speak!", },
     *   { text: 'I know right, it has been a while..', userId: 'xxxx', isLocalUser: false },
     *   { text: 'We should catchup some time!', },
     *   { text: 'Definitely, how about we go for lunch this week?', userId: 'xxxx', isLocalUser: false },
     * ]);
     * ```
     *
     * @param messages An array of `TextMessage` interfaces.
     */
    suggestReplies(messages: TextMessage[]): Promise<SuggestedReply[]>;
  }

  /**
   * A `TextMessage` interface provided to `suggestReplies()`.
   */
  export interface TextMessage {
    /**
     * The message text.
     *
     * This is required and must not be an empty string.
     */
    text: string;

    /**
     * Whether the message is a local user. If false, a `userId` must be provided for the message.
     *
     * Defaults to true.
     */
    isLocalUser?: boolean;

    /**
     * A user ID of a remote user.
     *
     * Used to help better identify users to provide more accurate replies.
     */
    userId?: string;

    /**
     * The timestamp of the message in milliseconds.
     *
     * Defaults to now (`Date.now()`).
     */
    timestamp?: number;
  }
}

declare module '@react-native-firebase/ml-natural-language' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<
    FirebaseMLKitLanguage.Module,
    FirebaseMLKitLanguage.Statics
  >;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

    interface Module {
      naturalLanguage: FirebaseModuleWithStaticsAndApp<
        FirebaseMLKitLanguage.Module,
        FirebaseMLKitLanguage.Statics
      >;
    }

    interface FirebaseApp {
      naturalLanguage(): FirebaseMLKitLanguage.Module;
    }
  }
}

namespace ReactNativeFirebase {
  interface FirebaseJsonConfig {
    /**
     * If `true`, the Language ID Model will be installed onto the device.
     */
    ml_natural_language_language_id_model: boolean;

    /**
     * If `true`, the Smart Reply Model will be installed onto the device.
     */
    ml_natural_language_smart_reply_model: boolean;
  }
}
