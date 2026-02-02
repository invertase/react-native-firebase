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

import type { Storage, Reference } from './storage';
import type EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

/**
 * Internal Storage type with access to private properties.
 * Used internally by StorageReference and other internal classes.
 */
export type StoragePrivate = Storage & {
  native: any;
  _customUrlOrRegion: string | null;
  emitter: EventEmitter;
  eventNameForApp: (...args: Array<string | number>) => string;
};

/**
 * Internal Reference type with access to private properties.
 * Used internally by StorageTask and other internal classes.
 */
export type ReferencePrivate = Reference & {
  _storage: StoragePrivate;
};
