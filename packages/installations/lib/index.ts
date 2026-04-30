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

import { isIOS } from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';

import { version } from './version';

const statics = {};

const namespace = 'installations';

const nativeModuleName = 'RNFBInstallationsModule';

interface InstallationsNativeModule {
  getId(): Promise<string>;
  getToken(forceRefresh: boolean): Promise<string>;
  delete(): Promise<void>;
}

/**
 * Firebase Installations package for React Native.
 *
 * @firebase installations
 */
export namespace FirebaseInstallationsTypes {
  export interface Statics {
    SDK_VERSION: string;
  }

  /**
   * The Firebase Installations service is available for the default app or a given app.
   */
  export interface Module extends ReactNativeFirebase.FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: ReactNativeFirebase.FirebaseApp;

    /**
     * Creates a Firebase Installation if there isn't one for the app and returns the Installation ID.
     */
    getId(): Promise<string>;

    /**
     * Retrieves a valid installation auth token.
     */
    getToken(forceRefresh?: boolean): Promise<string>;

    /**
     * Deletes the Firebase Installation and all associated data from the Firebase backend.
     */
    delete(): Promise<void>;
  }
}

class FirebaseInstallationsModule extends FirebaseModule {
  get native(): InstallationsNativeModule {
    return super.native as unknown as InstallationsNativeModule;
  }

  getId(): Promise<string> {
    return this.native.getId();
  }

  getToken(forceRefresh?: boolean): Promise<string> {
    if (!forceRefresh) {
      return this.native.getToken(false);
    } else {
      return this.native.getToken(true);
    }
  }

  delete(): Promise<void> {
    return this.native.delete();
  }

  onIdChange(): () => void {
    if (isIOS) {
      return () => {};
    }

    // TODO implement change listener on Android
    return () => {};
  }
}

type InstallationsNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseInstallationsTypes.Module,
  FirebaseInstallationsTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import { SDK_VERSION } from '@react-native-firebase/installations';
export const SDK_VERSION = version;

// import installations from '@react-native-firebase/installations';
// installations().X(...);
const defaultExport = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false, // TODO implement android id change listener: ['installations_id_changed'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseInstallationsModule,
}) as unknown as InstallationsNamespace;

export default defaultExport;

// import installations, { firebase } from '@react-native-firebase/installations';
// installations().X(...);
// firebase.installations().X(...);
export const firebase = getFirebaseRoot() as unknown as ReactNativeFirebase.Module & {
  installations: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { installations(): FirebaseInstallationsTypes.Module };
};

export * from './modular';

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

    interface Module {
      installations: FirebaseModuleWithStaticsAndApp<
        FirebaseInstallationsTypes.Module,
        FirebaseInstallationsTypes.Statics
      >;
    }

    interface FirebaseApp {
      installations(): FirebaseInstallationsTypes.Module;
    }
  }
}
