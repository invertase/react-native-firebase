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

import { isNumber } from '@react-native-firebase/common';

import version from './version';
import StorageStatics from './StorageStatics';
import StorageReference from './StorageReference';

const namespace = 'storage';
const nativeEvents = ['storage_event'];
const nativeModuleName = 'RNFBStorageModule';

class FirebaseStorageModule extends FirebaseModule {
  constructor(...args) {
    super(...args);

    this.emitter.addListener(
      this.eventNameForApp('storage_event'),
      this._handleStorageEvent.bind(this),
    );

    // this.emitter.addListener(
    //   this.eventNameForApp('storage_error'),
    //   this._handleStorageEvent.bind(this),
    // );
  }

  ref(path) {
    return new StorageReference(this, path);
  }

  refFromURL(url) {
    return new StorageReference(this, `url::${url}`);
  }

  setMaxOperationRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error(
        `firebase.storage().setMaxOperationRetryTime(*) 'time' must be a number value.`,
      );
    }

    return this.native.setMaxOperationRetryTime(time);
  }

  setMaxUploadRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error(`firebase.storage().setMaxUploadRetryTime(*) 'time' must be a number value.`);
    }

    return this.native.setMaxUploadRetryTime(time);
  }

  setMaxDownloadRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error(
        `firebase.storage().setMaxDownloadRetryTime(*) 'time' must be a number value.`,
      );
    }

    return this.native.setMaxDownloadRetryTime(time);
  }

  _getSubEventName(path, eventName) {
    return this.eventNameForApp(`${path}-${eventName}`);
  }

  _handleStorageEvent(event) {
    const { path, eventName } = event;
    const body = event.body || {};
    if (eventName.endsWith('failure')) {
      // TODO generate an error?
    }
    this.emitter.emit(this._getSubEventName(path, eventName), body);
  }

  // _handleStorageError(error) {
  //   const { path, eventName } = error;
  //   const body = error.body || {};
  //
  //   this.emitter.emit(this._getSubEventName(path, eventName), body);
  // }

  _addListener(path, eventName, cb) {
    return this.emitter.addListener(this._getSubEventName(path, eventName), cb);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/storage';
export const SDK_VERSION = version;

// import storage from '@react-native-firebase/storage';
// storage().X(...);
export default createModuleNamespace({
  statics: StorageStatics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: true,
  // TODO
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseStorageModule,
});

// import storage, { firebase } from '@react-native-firebase/storage';
// storage().X(...);
// firebase.storage().X(...);
export const firebase = getFirebaseRoot();
