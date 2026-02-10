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

import type { ModuleConfig } from '@react-native-firebase/app/dist/module/types/internal';
import type {
  Storage,
  Reference,
  EmulatorMockTokenOptions,
  SettableMetadata,
  Task,
  FullMetadata,
  ListResult,
  ListOptions,
} from './storage';
import type EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

/**
 * Internal Storage type with access to private properties.
 * Used internally by StorageReference and other internal classes.
 */
export type StorageInternal = Storage & {
  native: any;
  _customUrlOrRegion: string | null;
  emitter: EventEmitter;
  eventNameForApp: (...args: Array<string | number>) => string;
  _config: ModuleConfig;
  /**
   * Returns a reference to the object at the specified path.
   *
   * @param path - An optional string pointing to a location on the storage bucket. If no path
   * is provided, the returned reference will be the bucket root path.
   */
  ref(path?: string): Reference;

  /**
   * Returns a reference to the object at the specified URL.
   *
   * @param url - A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url.
   */
  refFromURL(url: string): Reference;

  /**
   * Sets the maximum time in milliseconds to retry operations if a failure occurs.
   *
   * @param time - The new maximum operation retry time in milliseconds.
   */
  setMaxOperationRetryTime(time: number): Promise<void>;

  /**
   * Sets the maximum time in milliseconds to retry an upload if a failure occurs.
   *
   * @param time - The new maximum upload retry time in milliseconds.
   */
  setMaxUploadRetryTime(time: number): Promise<void>;

  /**
   * Sets the maximum time in milliseconds to retry a download if a failure occurs.
   *
   * @param time - The new maximum download retry time in milliseconds.
   */
  setMaxDownloadRetryTime(time: number): Promise<void>;

  /**
   * Changes this instance to point to a Cloud Storage emulator running locally.
   *
   * @param host - The host of the emulator, e.g. "localhost" or "10.0.2.2" for Android.
   * @param port - The port of the emulator, e.g. 9199.
   * @param options - Optional settings for the emulator connection (web only).
   * @returns {void} - Undocumented return, just used to unit test android host remapping.
   */
  useEmulator(host: string, port: number, options?: EmulatorMockTokenOptions): void;
};

/**
 * Internal Reference type with access to private properties.
 * Used internally by StorageTask and other internal classes.
 */
export type ReferenceInternal = Reference & {
  _storage: StorageInternal;
  child(path: string): Reference;
  delete(): Promise<void>;
  getDownloadURL(): Promise<string>;
  getMetadata(): Promise<FullMetadata>;
  list(options?: ListOptions): Promise<ListResult>;
  listAll(): Promise<ListResult>;
  put(data: Blob | Uint8Array | ArrayBuffer, metadata?: SettableMetadata): Task;
  putString(
    string: string,
    format?: 'raw' | 'base64' | 'base64url' | 'data_url',
    metadata?: SettableMetadata,
  ): Task;
  updateMetadata(metadata: SettableMetadata): Promise<FullMetadata>;
  writeToFile(filePath: string): Task;
  putFile(filePath: string, metadata?: SettableMetadata): Task;
};

/**
 * Internal ListResult type with access to private properties.
 * Used internally by StorageListResult and other internal classes.
 */
export type ListResultInternal = {
  nextPageToken?: string | null;
  items: string[];
  prefixes: string[];
};
