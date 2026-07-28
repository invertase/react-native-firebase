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

import { getReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import type { LogLevel } from '../types/firestore';

const FIRESTORE_MAIN_NATIVE_MODULE = 'NativeRNFBTurboFirestore';

type StaticFirestoreMainModule = {
  setLogLevel(level: LogLevel): void;
};

let memoizedMainModule: StaticFirestoreMainModule | null = null;

/** Memoized main Firestore turbo host for static helpers (NewArch-AD-18 E8). */
export function getStaticFirestoreMainModule(): StaticFirestoreMainModule {
  if (memoizedMainModule) {
    return memoizedMainModule;
  }

  const native = getReactNativeModule(
    FIRESTORE_MAIN_NATIVE_MODULE,
  ) as StaticFirestoreMainModule | null;

  if (!native?.setLogLevel) {
    throw new Error(`Native module ${FIRESTORE_MAIN_NATIVE_MODULE} is not registered.`);
  }

  memoizedMainModule = {
    setLogLevel: native.setLogLevel.bind(native),
  };

  return memoizedMainModule;
}
