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

// AsyncStorage interface compatible with React Native AsyncStorage
export interface AsyncStorageStatic {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

// Memory storage Map instance
export const memoryStorage: Map<string, string>;

// Storage key prefix
export const prefix: string;

// Get the current AsyncStorage instance (either React Native AsyncStorage or memory storage)
export function getReactNativeAsyncStorageInternal(): Promise<AsyncStorageStatic>;

// Set the AsyncStorage instance to use (React Native AsyncStorage or fallback to memory storage)
export function setReactNativeAsyncStorageInternal(asyncStorageInstance?: AsyncStorageStatic): void;

// Check if currently using memory storage (fallback)
export function isMemoryStorage(): boolean;

// Set an item in storage with the React Native Firebase prefix
export function setItem(key: string, value: string): Promise<void>;

// Get an item from storage with the React Native Firebase prefix
export function getItem(key: string): Promise<string | null>;

// Remove an item from storage with the React Native Firebase prefix
export function removeItem(key: string): Promise<void>;
