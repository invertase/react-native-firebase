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

import type { AsyncStorageStatic } from '../types/internal';

// Memory storage Map instance
export const memoryStorage = new Map<string, string>();

// Storage key prefix
export const prefix = '@react-native-firebase:';

const asyncStorageMemory: AsyncStorageStatic = {
  setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    return Promise.resolve();
  },
  getItem(key: string): Promise<string | null> {
    const hasValue = memoryStorage.has(key);
    if (hasValue) {
      return Promise.resolve(memoryStorage.get(key) || null);
    }
    return Promise.resolve(null);
  },
  removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    return Promise.resolve();
  },
};

let asyncStorage: AsyncStorageStatic = asyncStorageMemory;

// Get the current AsyncStorage instance (either React Native AsyncStorage or memory storage)
export async function getReactNativeAsyncStorageInternal(): Promise<AsyncStorageStatic> {
  return asyncStorage;
}

// Set the AsyncStorage instance to use (React Native AsyncStorage or fallback to memory storage)
export function setReactNativeAsyncStorageInternal(
  asyncStorageInstance?: AsyncStorageStatic,
): void {
  asyncStorage = asyncStorageInstance || asyncStorageMemory;
}

// Check if currently using memory storage (fallback)
export function isMemoryStorage(): boolean {
  return asyncStorage === asyncStorageMemory;
}

// Set an item in storage with the React Native Firebase prefix
export async function setItem(key: string, value: string): Promise<void> {
  return await asyncStorage.setItem(prefix + key, value);
}

// Get an item from storage with the React Native Firebase prefix
export async function getItem(key: string): Promise<string | null> {
  return await asyncStorage.getItem(prefix + key);
}

// Remove an item from storage with the React Native Firebase prefix
export async function removeItem(key: string): Promise<void> {
  return await asyncStorage.removeItem(prefix + key);
}
