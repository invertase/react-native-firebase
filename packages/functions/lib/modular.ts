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

import { getApp } from '@react-native-firebase/app';
import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/lib/common';
import type {
  Functions,
  FirebaseApp,
  HttpsCallableOptions,
  HttpsCallable,
} from './types/functions';

/**
 * Returns a Functions instance for the given app.
 * @param app - The FirebaseApp to use. Optional.
 * @param regionOrCustomDomain - One of: a) The region the callable functions are located in (ex: us-central1) b) A custom domain hosting the callable functions (ex: https://mydomain.com). Optional.
 * @returns Functions instance for the given app.
 */
export function getFunctions(app?: FirebaseApp, regionOrCustomDomain?: string): Functions {
  if (app) {
    return (getApp(app.name) as unknown as FirebaseApp).functions(regionOrCustomDomain);
  }

  return (getApp() as unknown as FirebaseApp).functions(regionOrCustomDomain);
}

/**
 * Modify this instance to communicate with the Cloud Functions emulator.
 * Note: this must be called before this instance has been used to do any operations.
 * @param functionsInstance A functions instance.
 * @param host The emulator host. (ex: localhost)
 * @param port The emulator port. (ex: 5001)
 */
export function connectFunctionsEmulator(
  functionsInstance: Functions,
  host: string,
  port: number,
): void {
  // @ts-ignore
  return functionsInstance.useEmulator.call(functionsInstance, host, port, MODULAR_DEPRECATION_ARG);
}

/**
 * Returns a reference to the callable HTTPS trigger with the given name.
 * @param functionsInstance A functions instance.
 * @param name The name of the trigger.
 * @param options An interface for metadata about how calls should be executed.
 * @returns HttpsCallable instance
 */
export function httpsCallable<RequestData = unknown, ResponseData = unknown>(
  functionsInstance: Functions,
  name: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData> {
  return functionsInstance.httpsCallable.call(
    functionsInstance,
    name,
    options,
    // @ts-ignore
    MODULAR_DEPRECATION_ARG,
  ) as HttpsCallable<RequestData, ResponseData>;
}

/**
 * Returns a reference to the callable HTTPS trigger with the specified url.
 * @param functionsInstance A functions instance.
 * @param url The url of the trigger.
 * @param options An instance of HttpsCallableOptions containing metadata about how calls should be executed.
 * @returns HttpsCallable instance
 */
export function httpsCallableFromUrl<RequestData = unknown, ResponseData = unknown>(
  functionsInstance: Functions,
  url: string,
  options?: HttpsCallableOptions,
): HttpsCallable<RequestData, ResponseData> {
  return functionsInstance.httpsCallableFromUrl.call(
    functionsInstance,
    url,
    options,
    // @ts-ignore
    MODULAR_DEPRECATION_ARG,
  ) as HttpsCallable<RequestData, ResponseData>;
}
