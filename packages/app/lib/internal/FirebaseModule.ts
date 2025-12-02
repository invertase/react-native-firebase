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

import { getAppModule, getNativeModule } from './registry/nativeModule';
import SharedEventEmitter from './SharedEventEmitter';
import type { ReactNativeFirebase } from '../types';

let firebaseJson: any = null;

export interface ModuleConfig {
  namespace: string;
  nativeModuleName?: string;
  hasMultiAppSupport?: boolean;
  hasCustomUrlOrRegionSupport?: boolean;
  nativeEvents?: string[];
}

export default class FirebaseModule {
  _app: ReactNativeFirebase.FirebaseApp;
  _nativeModule: any;
  _customUrlOrRegion: string | null;
  _config: ModuleConfig;

  constructor(
    app: ReactNativeFirebase.FirebaseApp,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    this._app = app;
    this._nativeModule = null;
    this._customUrlOrRegion = customUrlOrRegion || null;
    this._config = Object.assign({}, config);
  }

  get app(): ReactNativeFirebase.FirebaseApp {
    return this._app;
  }

  get firebaseJson(): any {
    if (firebaseJson) {
      return firebaseJson;
    }
    firebaseJson = JSON.parse(getAppModule().FIREBASE_RAW_JSON);
    return firebaseJson;
  }

  get emitter(): any {
    return SharedEventEmitter;
  }

  eventNameForApp(...args: any[]): string {
    return `${this.app.name}-${args.join('-')}`;
  }

  get native(): any {
    if (this._nativeModule) {
      return this._nativeModule;
    }
    this._nativeModule = getNativeModule(this);
    return this._nativeModule;
  }
}

// Instance of checks don't work once compiled
(FirebaseModule as any).__extended__ = {};
