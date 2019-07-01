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

import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

/**
 * @firebase firebase
 */
declare module '@react-native-firebase/app' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const ReactNativeFirebase: {} & ReactNativeFirebaseNamespace;
  export default ReactNativeFirebase;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    utils?: {
      (app?: FirebaseApp): FirebaseUtilsModule;
    };
  }

  interface FirebaseApp {
    utils?(app?: FirebaseApp): FirebaseUtilsModule;
  }
}
