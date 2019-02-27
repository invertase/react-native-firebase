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

import { isBoolean } from '@react-native-firebase/common';

import version from './version';

const statics = {};

const namespace = 'fiam';

const nativeModuleName = 'RNFBFiamModule';

class FirebaseFiamModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._isMessagesDisplaySuppressed = this.native.isMessagesDisplaySuppressed;
    this._isAutomaticDataCollectionEnabled = this.native.isAutomaticDataCollectionEnabled;
  }

  get isMessagesDisplaySuppressed() {
    return this._isMessagesDisplaySuppressed;
  }

  get isAutomaticDataCollectionEnabled() {
    return this._isAutomaticDataCollectionEnabled;
  }

  setMessagesDisplaySuppressed(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        `firebase.fiam().setMessagesDisplaySuppressed(*) 'enabled' must be a boolean.`,
      );
    }

    this._isMessagesDisplaySuppressed = enabled;
    return this.native.setMessagesDisplaySuppressed(enabled);
  }

  setAutomaticDataCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        `firebase.fiam().setAutomaticDataCollectionEnabled(*) 'enabled' must be a boolean.`,
      );
    }

    this._isAutomaticDataCollectionEnabled = enabled;
    return this.native.setAutomaticDataCollectionEnabled(enabled);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/fiam';
export const SDK_VERSION = version;

// import fiam from '@react-native-firebase/fiam';
// fiam().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseFiamModule,
});

// import fiam, { firebase } from '@react-native-firebase/fiam';
// fiam().X(...);
// firebase.fiam().X(...);
export const firebase = getFirebaseRoot();
