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

import type { ReactNativeFirebase } from '@react-native-firebase/app';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import { version } from './version';

/**
 * Firebase ML package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `ml` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/ml';
 *
 * // firebase.ml().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `ml` package:
 *
 * ```js
 * import ml from '@react-native-firebase/ml';
 *
 * // ml().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/ml';
 *
 * // firebase.ml().X
 * ```
 *
 * @firebase ml
 */
export namespace FirebaseMLTypes {
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    SDK_VERSION: string;
  }

  export interface Module extends FirebaseModule {
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: ReactNativeFirebase.FirebaseApp;
  }
}

type MLNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseMLTypes.Module,
  FirebaseMLTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

const statics = {
  SDK_VERSION,
};

const namespace = 'ml';

const nativeModuleName = 'RNFBMLModule';

class FirebaseMLModule extends FirebaseModule {}

// import { SDK_VERSION } from '@react-native-firebase/ml';
export const SDK_VERSION = version;

export * from './modular';

// import ML from '@react-native-firebase/ml';
// ml().X(...);
const defaultExport = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMLModule,
}) as MLNamespace;

export default defaultExport;

// import ml, { firebase } from '@react-native-firebase/ml';
// ml().X(...);
// firebase.ml().X(...);
export const firebase = getFirebaseRoot() as ReactNativeFirebase.Module & {
  ml: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { ml(): FirebaseMLTypes.Module };
};

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      ml: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
        FirebaseMLTypes.Module,
        FirebaseMLTypes.Statics
      >;
    }

    interface FirebaseApp {
      ml(): FirebaseMLTypes.Module;
    }
  }
}
