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
/**
 * @deprecated Use the exported types directly instead.
 * FirebaseMLTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseMLTypes {
  /**
   * @deprecated Use the exported types directly instead. FirebaseMLTypes namespace is kept for backwards compatibility.
   */
  type FirebaseModule = ReactNativeFirebase.FirebaseModule;

  /**
   * @deprecated Use the default export statics instead.
   */
  export interface Statics {
    /** @deprecated Use the default export statics instead. */
    SDK_VERSION: string;
  }

  /**
   * @deprecated Use the exported `FirebaseML` type instead.
   */
  export interface Module extends FirebaseModule {
    /**
     * @deprecated Use the exported `FirebaseML` type instead.
     *
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: ReactNativeFirebase.FirebaseApp;
  }
}

declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      ml: FirebaseModuleWithStaticsAndApp<FirebaseMLTypes.Module, FirebaseMLTypes.Statics>;
    }

    interface FirebaseApp {
      ml(): FirebaseMLTypes.Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
