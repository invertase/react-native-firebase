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

import { ReactNativeFirebase } from '@react-native-firebase/app';
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
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {}

  export class Module extends FirebaseModule {}
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseMLTypes.Module,
  FirebaseMLTypes.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  ml: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { ml(): FirebaseMLTypes.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      ml: FirebaseModuleWithStaticsAndApp<FirebaseMLTypes.Module, FirebaseMLTypes.Statics>;
    }

    interface FirebaseApp {
      ml(): FirebaseMLTypes.Module;
    }
  }
}
