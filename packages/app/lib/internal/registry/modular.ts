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

import { DEFAULT_APP_NAME } from '../constants';
import type FirebaseModule from '../FirebaseModule';
import type { ReactNativeFirebase } from '../../types/app';
import type { ModuleConfig } from '../../types/internal';
import { addOnAppDestroy, getApp } from './app';
import { MODULAR_DEPRECATION_ARG } from '../../common';

/**
 * Constructor signature shared by every {@link FirebaseModule} subclass.
 */
type ModularModuleClass<T extends FirebaseModule> = new (
  app: ReactNativeFirebase.FirebaseAppBase,
  config: ModuleConfig,
  customUrlOrRegion?: string | null,
) => T;

// app.name -> instanceKey -> module instance
const MODULAR_INSTANCES: Record<string, Record<string, FirebaseModule>> = {};

let destroyHookRegistered = false;
function ensureDestroyHook(): void {
  if (destroyHookRegistered) {
    return;
  }
  destroyHookRegistered = true;
  addOnAppDestroy(app => {
    delete MODULAR_INSTANCES[app.name];
  });
}

/**
 * Builds (and memoises per app) a Firebase service instance for the modular API, without the
 * namespaced registry, `KNOWN_NAMESPACES`, or the deprecation proxy.
 *
 * This is the modular-only replacement for `getApp().<module>()`. Each module's `modular.ts`
 * defines its own `ModuleClass` and `ModuleConfig` and calls this from `getX(app?)`.
 *
 * @param ModuleClass - The module's `FirebaseModule` subclass.
 * @param config - Static `ModuleConfig` for the module (namespace, native module name, support flags).
 * @param app - The `FirebaseApp` to use; defaults to the default app.
 * @param customUrlOrRegion - Optional URL/region/databaseId for modules that support it.
 * @returns The memoised module instance for that app + key.
 */
export function getOrCreateModularInstance<T extends FirebaseModule>(
  ModuleClass: ModularModuleClass<T>,
  config: ModuleConfig,
  app?: ReactNativeFirebase.FirebaseApp,
  customUrlOrRegion?: string | null,
): T {
  ensureDestroyHook();

  // Resolve through the app registry by name (canonical instance; throws for unknown app names).
  // Passing the modular sentinel suppresses the internal getApp() modular-deprecation warning.
  // Re-resolving by name also rejects deleted apps (their name is removed from the registry on
  // delete), giving the parity the namespaced app proxy provided via app._checkDestroyed().
  const _app = (
    getApp as unknown as (name?: string, modularArg?: unknown) => ReactNativeFirebase.FirebaseApp
  )(app?.name, MODULAR_DEPRECATION_ARG);

  const { namespace, hasMultiAppSupport } = config;

  // Modules such as analytics only run on the default app.
  if (!hasMultiAppSupport && _app.name !== DEFAULT_APP_NAME) {
    throw new Error(
      [
        `You attempted to call "${namespace}" with a secondary Firebase App but; ${namespace} does not support multiple Firebase Apps.`,
        '',
        `Ensure you access ${namespace} from the default application only.`,
      ].join('\r\n'),
    );
  }

  const key = customUrlOrRegion ? `${customUrlOrRegion}:${namespace}` : namespace;

  if (!MODULAR_INSTANCES[_app.name]) {
    MODULAR_INSTANCES[_app.name] = {};
  }

  if (!MODULAR_INSTANCES[_app.name]![key]) {
    MODULAR_INSTANCES[_app.name]![key] = new ModuleClass(
      _app as unknown as ReactNativeFirebase.FirebaseAppBase,
      Object.assign({}, config),
      customUrlOrRegion,
    );
  }

  return MODULAR_INSTANCES[_app.name]![key] as T;
}
