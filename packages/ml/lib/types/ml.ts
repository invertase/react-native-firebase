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

// ============ Module Interface ============

/**
 * ML module instance - returned from firebase.ml() or firebase.app().ml()
 * Note: Firebase ML Kit has no JavaScript SDK; types match RNFB native API.
 */
export interface ML extends ReactNativeFirebase.FirebaseModule {
  /** The FirebaseApp this module is associated with */
  app: ReactNativeFirebase.FirebaseApp;
}

// ============ Statics Interface ============

/**
 * Static properties available on firebase.ml
 */
export interface Statics {
  SDK_VERSION: string;
}

/**
 * FirebaseApp type with ml() method.
 * @deprecated Import FirebaseApp from '@react-native-firebase/app' instead.
 * The ml() method is added via module augmentation.
 */
export type FirebaseApp = ReactNativeFirebase.FirebaseApp;

// ============ Module Augmentation ============

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface Module {
      ml: FirebaseModuleWithStaticsAndApp<ML, Statics>;
    }
    interface FirebaseApp {
      ml(): ML;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// ============ Backwards Compatibility Namespace ============

type _Statics = Statics;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseMLTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseMLTypes {
  export type Module = ML;
  export type Statics = _Statics;
}
/* eslint-enable @typescript-eslint/no-namespace */
