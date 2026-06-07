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
import './types/internal';
import type { FirebaseMLTypes } from './types/namespaced';
import { version } from './version';

const statics = {
  SDK_VERSION: version,
};

const namespace = 'ml';

const nativeModuleName = 'RNFBMLModule';

class FirebaseMLModule extends FirebaseModule<typeof nativeModuleName> {}

type MLNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebaseMLTypes.Module,
  FirebaseMLTypes.Statics
> & {
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

// import { SDK_VERSION } from '@react-native-firebase/ml';
export const SDK_VERSION = version;

const defaultExport = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseMLModule,
}) as unknown as MLNamespace;

export default defaultExport;

// import ml, { firebase } from '@react-native-firebase/ml';
// ml().X(...);
// firebase.ml().X(...);
export const firebase = getFirebaseRoot() as unknown as ReactNativeFirebase.Module & {
  ml: typeof defaultExport;
  app(name?: string): ReactNativeFirebase.FirebaseApp & { ml(): FirebaseMLTypes.Module };
};
