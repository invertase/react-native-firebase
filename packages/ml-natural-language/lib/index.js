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

import version from './version';

const statics = {};

const namespace = 'mlkit';

const nativeModuleName = 'RNFBMLModule';

// TODO(salakar) figure out a JS API
// firebase.ml().natualLanguage().languageId().detectLanguage(text)

// -- LANGUAGE_LANGUAGE_ID
// --------------------------
// firebase.ml().language().detectLanguageId(text)

// -- LANGUAGE_SMART_REPLIES
// --------------------------
// firebase.ml().language().newSmartReplyConversation(): SmartReplyConversation
//      -> SmartReplyConversation
//          -> destroy(): void;
//          -> clear(): void;
//          -> getSuggestedReplies(): Promise<SuggestedReply[]>;
//          -> addLocalUserMessage(message, timestamp = Date.now()): void;
//          -> addRemoteUserMessage(message, timestamp = Date.now(), remoteUserId): void;

// -- LANGUAGE_TRANSLATE
// --------------------------
// firebase.ml().language().translateText(text, options): Promise<string>;
// firebase.ml().language().translateGetAvailableModels(): Promise<Object[]>;
// firebase.ml().language().translateDeleteDownloadedModel(languageId: int): Promise<void>;
// firebase.ml().language().translateDownloadRemoteModel(languageId: int, downloadConditions: Object): Promise<void>;

// firebase.ml().vision().detectFacesInImage(imageUri)
// firebase.ml().vision().detectTextInImage(imageUri)
// firebase.ml().vision().readBarcodeFromImage(imageUri)

class FirebaseMlkitModule extends FirebaseModule {}

// import { SDK_VERSION } from '@react-native-firebase/mlkit';
export const SDK_VERSION = version;

// import mlkit from '@react-native-firebase/mlkit';
// mlkit().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMlkitModule,
});

// import mlkit, { firebase } from '@react-native-firebase/mlkit';
// mlkit().X(...);
// firebase.mlkit().X(...);
export const firebase = getFirebaseRoot();
