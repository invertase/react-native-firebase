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
 * Firebase _Template_ package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `_template_` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/_template_';
 *
 * // firebase._template_().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `_template_` package:
 *
 * ```js
 * import _template_ from '@react-native-firebase/_template_';
 *
 * // _template_().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/_template_';
 *
 * // firebase._template_().X
 * ```
 *
 * @firebase _template_
 */
export namespace Firebase_Template_Types {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Statics {
    // firebase._template_.* static props go here
  }

  /**
   * // TODO CHOOSE THIS ---------------------------------------
   *
   * The Firebase _Template_ service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the _Template_ service for the default app:
   *
   * ```js
   * const defaultApp_Template_ = firebase._template_();
   * ```
   *
   * // TODO OR THIS -------------------------------------------
   *
   * The Firebase _Template_ service is available for the default app or a given app.
   *
   * #### Example 1
   *
   * Get the _template_ instance for the **default app**:
   *
   * ```js
   * const _template_ForDefaultApp = firebase._template_();
   * ```
   *
   * #### Example 2
   *
   * Get the _template_ instance for a **secondary app**:
   *˚
   * ```js
   * const otherApp = firebase.app('otherApp');
   * const _template_ForOtherApp = firebase._template_(otherApp);
   * ```
   *
   */
  export class Module extends FirebaseModule {
    // firebase._template_().* methods & props go here
  }
}

declare const defaultExport: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  Firebase_Template_Types.Module,
  Firebase_Template_Types.Statics
>;

export const firebase: ReactNativeFirebase.Module & {
  _template_: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & { _template_(): Firebase_Template_Types.Module };
};

export default defaultExport;

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      _template_: FirebaseModuleWithStaticsAndApp<
        Firebase_Template_Types.Module,
        Firebase_Template_Types.Statics
      >;
    }
    interface FirebaseApp {
      _template_(): Firebase_Template_Types.Module;
    }
  }
}
