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

import { isNumber, isString } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import StorageReference from './StorageReference';
import StorageStatics from './StorageStatics';
import { getGsUrlParts, getHttpUrlParts, handleStorageEvent } from './utils';
import version from './version';

const namespace = 'storage';
const nativeEvents = ['storage_event'];
const nativeModuleName = 'RNFBStorageModule';

class FirebaseStorageModule extends FirebaseModule {
  constructor(app, config, bucketUrl) {
    super(app, config, bucketUrl);
    if (bucketUrl === undefined) {
      this._customUrlOrRegion = `gs://${app.options.storageBucket}`;
    } else if (!isString(bucketUrl) || !bucketUrl.startsWith('gs://')) {
      throw new Error(
        "firebase.app().storage(*) bucket url must be a string and begin with 'gs://'",
      );
    }

    this.emitter.addListener(
      this.eventNameForApp(nativeEvents[0]),
      handleStorageEvent.bind(null, this),
    );

    this._maxUploadRetryTime = this.native.maxUploadRetryTime || 0;
    this._maxDownloadRetryTime = this.native.maxDownloadRetryTime || 0;
    this._maxOperationRetryTime = this.native.maxOperationRetryTime || 0;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxuploadretrytime
   */
  get maxUploadRetryTime() {
    return this._maxUploadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxdownloadretrytime
   */
  get maxDownloadRetryTime() {
    return this._maxDownloadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#maxoperationretrytime
   */
  get maxOperationRetryTime() {
    return this._maxOperationRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#ref
   */
  ref(path = '/') {
    if (!isString(path)) {
      throw new Error("firebase.storage().ref(*) 'path' must be a string value.");
    }

    return new StorageReference(this, path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#refFromURL
   */
  refFromURL(url) {
    if (!isString(url) || (!url.startsWith('gs://') && !url.startsWith('http'))) {
      throw new Error(
        "firebase.storage().refFromURL(*) 'url' must be a string value and begin with 'gs://' or 'https://'.",
      );
    }

    let path;
    let bucket;

    if (url.startsWith('http')) {
      const parts = getHttpUrlParts(url);
      if (!parts) {
        throw new Error(
          "firebase.storage().refFromURL(*) unable to parse 'url', ensure it's a valid storage url'.",
        );
      }
      ({ bucket, path } = parts);
    } else {
      ({ bucket, path } = getGsUrlParts(url));
    }

    const storageInstance = this.app.storage(bucket);
    return new StorageReference(storageInstance, path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  setMaxOperationRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error(
        "firebase.storage().setMaxOperationRetryTime(*) 'time' must be a number value.",
      );
    }

    this._maxOperationRetryTime = time;
    return this.native.setMaxOperationRetryTime(time);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   */
  setMaxUploadRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error("firebase.storage().setMaxUploadRetryTime(*) 'time' must be a number value.");
    }

    this._maxUploadRetryTime = time;
    return this.native.setMaxUploadRetryTime(time);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
   */
  setMaxDownloadRetryTime(time) {
    if (!isNumber(time)) {
      throw new Error(
        "firebase.storage().setMaxDownloadRetryTime(*) 'time' must be a number value.",
      );
    }

    this._maxDownloadRetryTime = time;
    return this.native.setMaxDownloadRetryTime(time);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/storage';
export const SDK_VERSION = version;

// import { STATICS } from '@react-native-firebase/storage';
export const STATICS = StorageStatics;

// import storage from '@react-native-firebase/storage';
// storage().X(...);
export default createModuleNamespace({
  statics: StorageStatics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  disablePrependCustomUrlOrRegion: true,
  ModuleClass: FirebaseStorageModule,
});

// import storage, { firebase } from '@react-native-firebase/storage';
// storage().X(...);
// firebase.storage().X(...);
export const firebase = getFirebaseRoot();
