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
  isAndroid,
  isNumber,
  isString,
  createDeprecationProxy,
} from '@react-native-firebase/app/dist/module/common';

import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
  type ModuleConfig,
} from '@react-native-firebase/app/dist/module/internal';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import StorageReference from './StorageReference';
import { StringFormat, TaskEvent, TaskState } from './StorageStatics';
import { getGsUrlParts, getHttpUrlParts, handleStorageEvent } from './utils';
import { version } from './version';
import fallBackModule from './web/RNFBStorageModule';
import type { Storage, StorageStatics, Reference, EmulatorMockTokenOptions } from './types/storage';
import type { StorageInternal } from './types/internal';

const statics: StorageStatics = {
  StringFormat,
  TaskEvent,
  TaskState,
};

const namespace = 'storage';
const nativeEvents = ['storage_event'];
const nativeModuleName = 'RNFBStorageModule';

class FirebaseStorageModule extends FirebaseModule {
  emulatorHost: string | undefined;
  emulatorPort: number;
  _maxUploadRetryTime: number;
  _maxDownloadRetryTime: number;
  _maxOperationRetryTime: number;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    bucketUrl?: string | null,
  ) {
    super(app, config, bucketUrl);
    if (bucketUrl === undefined) {
      this._customUrlOrRegion = `gs://${app.options.storageBucket}`;
    } else if (!isString(bucketUrl) || !bucketUrl.startsWith('gs://')) {
      throw new Error(
        "firebase.app().storage(*) bucket url must be a string and begin with 'gs://'",
      );
    }

    this.emitter.addListener(
      this.eventNameForApp(nativeEvents[0]!),
      handleStorageEvent.bind(null, this),
    );

    // Emulator instance vars needed to send through on iOS, iOS does not persist emulator state between calls
    this.emulatorHost = undefined;
    this.emulatorPort = 0;
    this._maxUploadRetryTime = this.native.maxUploadRetryTime || 0;
    this._maxDownloadRetryTime = this.native.maxDownloadRetryTime || 0;
    this._maxOperationRetryTime = this.native.maxOperationRetryTime || 0;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxuploadretrytime
   */
  get maxUploadRetryTime(): number {
    return this._maxUploadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setmaxdownloadretrytime
   */
  get maxDownloadRetryTime(): number {
    return this._maxDownloadRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#maxoperationretrytime
   */
  get maxOperationRetryTime(): number {
    return this._maxOperationRetryTime;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#ref
   */
  ref(path: string = '/'): Reference {
    if (!isString(path)) {
      throw new Error("firebase.storage().ref(*) 'path' must be a string value.");
    }
    return createDeprecationProxy(new StorageReference(this, path)) as unknown as Reference;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#refFromURL
   */
  refFromURL(url: string): Reference {
    if (!isString(url) || (!url.startsWith('gs://') && !url.startsWith('http'))) {
      throw new Error(
        "firebase.storage().refFromURL(*) 'url' must be a string value and begin with 'gs://' or 'https://'.",
      );
    }

    let path: string;
    let bucket: string;

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
    return new StorageReference(storageInstance as StorageInternal, path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  setMaxOperationRetryTime(time: number): Promise<void> {
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
  setMaxUploadRetryTime(time: number): Promise<void> {
    if (!isNumber(time)) {
      throw new Error("firebase.storage().setMaxUploadRetryTime(*) 'time' must be a number value.");
    }

    this._maxUploadRetryTime = time;
    return this.native.setMaxUploadRetryTime(time);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
   */
  setMaxDownloadRetryTime(time: number): Promise<void> {
    if (!isNumber(time)) {
      throw new Error(
        "firebase.storage().setMaxDownloadRetryTime(*) 'time' must be a number value.",
      );
    }

    this._maxDownloadRetryTime = time;
    return this.native.setMaxDownloadRetryTime(time);
  }

  useEmulator(host: string, port: number, _options?: EmulatorMockTokenOptions): void {
    if (!host || !isString(host) || !port || !isNumber(port)) {
      throw new Error('firebase.storage().useEmulator() takes a non-empty host and port');
    }

    let _host = host;

    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _host) {
      if (_host === 'localhost' || _host === '127.0.0.1') {
        _host = '10.0.2.2';
        // eslint-disable-next-line no-console
        console.log(
          'Mapping storage host to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this.emulatorHost = host;
    this.emulatorPort = port;
    this.native.useEmulator(_host, port, this._customUrlOrRegion);
    // @ts-ignore undocumented return, just used to unit test android host remapping
    return [_host, port];
  }
}

// import { SDK_VERSION } from '@react-native-firebase/storage';
export const SDK_VERSION = version;

const storageNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  disablePrependCustomUrlOrRegion: true,
  ModuleClass: FirebaseStorageModule,
});

type StorageNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  Storage,
  StorageStatics
> & {
  storage: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<Storage, StorageStatics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import storage from '@react-native-firebase/storage';
// storage().X(...);
export default storageNamespace as unknown as StorageNamespace;

// import storage, { firebase } from '@react-native-firebase/storage';
// storage().X(...);
// firebase.storage().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'storage',
    Storage,
    StorageStatics,
    true
  >;

setReactNativeModule(nativeModuleName, fallBackModule);
