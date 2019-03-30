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

import { NativeModules } from 'react-native';

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';

import { stripTrailingSlash } from '@react-native-firebase/common';

import version from './version';

const statics = {
  TaskEvent: {
    STATE_CHANGED: 'state_changed',
  },
  TaskState: {
    RUNNING: 'running',
    PAUSED: 'paused',
    SUCCESS: 'success',
    CANCELLED: 'cancelled',
    ERROR: 'error',
  },
  Native: FirebaseStorage
    ? {
        MAIN_BUNDLE_PATH: stripTrailingSlash(NativeModules.RNFBStorageModule.MAIN_BUNDLE_PATH),
        CACHES_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.CACHES_DIRECTORY_PATH,
        ),
        DOCUMENT_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.DOCUMENT_DIRECTORY_PATH,
        ),
        EXTERNAL_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.EXTERNAL_DIRECTORY_PATH,
        ),
        EXTERNAL_STORAGE_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.EXTERNAL_STORAGE_DIRECTORY_PATH,
        ),
        TEMP_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.TEMP_DIRECTORY_PATH,
        ),
        LIBRARY_DIRECTORY_PATH: stripTrailingSlash(
          NativeModules.RNFBStorageModule.LIBRARY_DIRECTORY_PATH,
        ),
        FILE_TYPE_REGULAR: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_REGULAR),
        FILE_TYPE_DIRECTORY: stripTrailingSlash(
          NativeModules.RNFBStorageModule.FILE_TYPE_DIRECTORY,
        ),

        // TODO(salakar) remove in 6.1.0 - deprecated but here for backwards compat
        FILETYPE_REGULAR: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_REGULAR),
        FILETYPE_DIRECTORY: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_DIRECTORY),
      }
    : {},
};

const namespace = 'storage';

const nativeModuleName = 'RNFBStorageModule';

const nativeEvents = ['storage_event'];

class FirebaseStorageModule extends FirebaseModule {
  constructor(...args) {
    super(...args);

    this.emitter.addListener(
      this.eventNameForApp('storage_event'),
      this._handleStorageEvent.bind(this),
    );

    this.emitter.addListener(
      this.eventNameForApp('storage_error'),
      this._handleStorageEvent.bind(this),
    );
  }

  ref(path) {
    return new StorageRef(this, path);
  }

  refFromURL(url) {
    return new StorageRef(this, `url::${url}`);
  }

  setMaxOperationRetryTime(time) {
    return this.native.setMaxOperationRetryTime(time);
  }

  setMaxUploadRetryTime(time) {
    return this.native.setMaxUploadRetryTime(time);
  }

  setMaxDownloadRetryTime(time) {
    return this.native.setMaxDownloadRetryTime(time);
  }

  _getSubEventName(path, eventName) {
    return this.eventNameForApp(`${path}-${eventName}`);
  }

  _handleStorageEvent(event) {
    const { path, eventName } = event;
    const body = event.body || {};
    this.emitter.emit(this._getSubEventName(path, eventName), body);
  }

  _handleStorageError(error) {
    const { path, eventName } = error;
    const body = error.body || {};

    this.emitter.emit(this._getSubEventName(path, eventName), body);
  }

  _addListener(path, eventName, cb) {
    this.emitter.addListener(this._getSubEventName(path, eventName), cb);
  }

  _removeListener(path, eventName, origCB) {
    this.emitter.removeListener(this._getSubEventName(path, eventName), origCB);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/storage';
export const SDK_VERSION = version;

// import storage from '@react-native-firebase/storage';
// storage().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseStorageModule,
});

// import storage, { firebase } from '@react-native-firebase/storage';
// storage().X(...);
// firebase.storage().X(...);
export const firebase = getFirebaseRoot();
