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

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import {
  isAndroid,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@react-native-firebase/common';

import version from './version';
import SmartReplyConversation from './SmartReplyConversation';

// TODO not available on iOS until SDK 6.0.0
// import TranslateModelManager from './TranslateModelManager';

const statics = {};
const namespace = 'mlKitLanguage';
const nativeModuleName = [
  'RNFBMLNaturalLanguageIdModule',
  'RNFBMLNaturalLanguageTranslateModule',
  'RNFBMLNaturalLanguageSmartReplyModule',
];

function validateIdentifyLanguageArgs(text, options, methodName) {
  if (!isString(text)) {
    throw new Error(`firebase.mlKitLanguage().${methodName}(*, _) 'text' must be a string value.`);
  }

  if (!isObject(options)) {
    throw new Error(
      `firebase.mlKitLanguage().${methodName}(_, *) 'options' must be an object or undefined.`,
    );
  }

  if (
    !isUndefined(options.confidenceThreshold) &&
    (!isNumber(options.confidenceThreshold) ||
      options.confidenceThreshold < 0 ||
      options.confidenceThreshold > 1)
  ) {
    throw new Error(
      `firebase.mlKitLanguage().${methodName}(_, *) 'options.confidenceThreshold' must be a float value between 0 and 1.`,
    );
  }
}

function validateOptionalNativeDependencyExists(firebaseJsonKey, nativeFnExists) {
  if (nativeFnExists) return;
  let errorMessage = `You attempted to use an optional ML Kit API that's not enabled natively. \n\n To enable `;

  if (firebaseJsonKey === 'ml_natural_language_language_id_model') {
    errorMessage += `Language ID detection`;
  } else if (firebaseJsonKey === 'ml_natural_language_smart_reply_model') {
    errorMessage += `Smart Replies`;
  }

  errorMessage += ` please set the 'react-native' -> '${firebaseJsonKey}' key to true in your firebase.json file`;

  if (isAndroid) {
    errorMessage += ' and rebuild your Android app.';
  } else {
    errorMessage +=
      ', re-run pod install and rebuild your iOS app. ' +
      "If you're not using Pods then make sure you've have downloaded the necessary Firebase iOS SDK dependencies for this API.";
  }

  throw new Error(errorMessage);
}

class FirebaseMlKitLanguageModule extends FirebaseModule {
  identifyLanguage(text, options = {}) {
    validateOptionalNativeDependencyExists(
      'ml_natural_language_language_id_model',
      !!this.native.identifyLanguage,
    );
    validateIdentifyLanguageArgs(text, options, 'identifyLanguage');
    return this.native.identifyLanguage(text.slice(0, 200), options);
  }

  identifyPossibleLanguages(text, options = {}) {
    validateOptionalNativeDependencyExists(
      'ml_natural_language_language_id_model',
      !!this.native.identifyPossibleLanguages,
    );
    validateIdentifyLanguageArgs(text, options, 'identifyPossibleLanguages');
    return this.native.identifyPossibleLanguages(
      text.slice(0, 200),
      Object.assign({}, options, { multipleLanguages: true }),
    );
  }

  newSmartReplyConversation(messageHistoryLimit) {
    validateOptionalNativeDependencyExists(
      'ml_natural_language_smart_reply_model',
      !!this.native.getSuggestedReplies,
    );
    if (!isUndefined(messageHistoryLimit) && !isNumber(messageHistoryLimit)) {
      throw new Error(
        `firebase.mlKitLanguage().newSmartReplyConversation(*) 'messageHistoryLimit' must be a number or undefined.`,
      );
    }

    return new SmartReplyConversation(this.native, messageHistoryLimit);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/mlkit';
export const SDK_VERSION = version;

// import mlKitLanguage from '@react-native-firebase/mlkit';
// mlKitLanguage().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMlKitLanguageModule,
});

// import mlKitLanguage, { firebase } from '@react-native-firebase/mlkit';
// mlKitLanguage().X(...);
// firebase.mlKitLanguage().X(...);
export const firebase = getFirebaseRoot();

// TODO not available on Firebase iOS until SDK 6.0.0, add in RNFB >6.1
// --------------------------
//     LANGUAGE_TRANSLATE
// --------------------------
// translate(text, translationOptions) {
//   const _translationOptions = {};
//
//   // retrieve the language id integers
//   const { sourceLanguage, targetLanguage } = translationOptions;
//   _translationOptions.sourceLanguage = this.native.TRANSLATE_LANGUAGES[sourceLanguage];
//   _translationOptions.targetLanguage = this.native.TRANSLATE_LANGUAGES[targetLanguage];
//   // translationOptions required:
//   //    sourceLanguage
//   //    targetLanguage
//   return this.native.translate(text, _translationOptions);
// }
//
// get translateModelManager() {
//   return new TranslateModelManager(this);
// }
