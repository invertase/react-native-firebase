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

type FirebaseModule = ReactNativeFirebase.FirebaseModule;

/**
 * @deprecated Use the exported types directly instead.
 * FirebaseMLTypes namespace is kept for backwards compatibility.
 */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebaseMLTypes {
  export interface Statics {
    SDK_VERSION: string;
  }

  export interface Module extends FirebaseModule {
    /** @deprecated Use the modular API instead. */
    app: ReactNativeFirebase.FirebaseApp;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      ml: FirebaseModuleWithStaticsAndApp<
        FirebaseMLTypes.Module,
        FirebaseMLTypes.Statics
      >;
    }
    interface FirebaseApp {
      ml(): FirebaseMLTypes.Module;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
