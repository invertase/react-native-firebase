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

import { isNull, isObject, isString } from '@react-native-firebase/app/dist/module/common';
import { NativeFirebaseError } from '@react-native-firebase/app/dist/module/internal';
import type { SettableMetadata } from './types/storage';
import type { StorageInternal } from './types/internal';
import type { NativeErrorUserInfo } from '@react-native-firebase/app/dist/module/types/internal';

const SETTABLE_FIELDS = [
  'cacheControl',
  'contentDisposition',
  'contentEncoding',
  'contentLanguage',
  'contentType',
  'customMetadata',
  'md5hash',
] as const;

export async function handleStorageEvent(
  storageInstance: StorageInternal,
  event: {
    taskId: string;
    eventName: string;
    body?: { error?: NativeErrorUserInfo };
  },
): Promise<void> {
  const { taskId, eventName } = event;
  const body = event.body || {};

  if (body.error) {
    // Convert NativeErrorUserInfo to NativeFirebaseError instance
    const nativeError = NativeFirebaseError.fromEvent(
      body.error,
      storageInstance._config.namespace,
    );
    // Assign NativeFirebaseError (Error instance) to body.error for consumers
    // Type assertion needed because body.error is typed as NativeErrorUserInfo in input,
    // but consumers expect Error instance
    (body as { error?: Error }).error = nativeError;
  }

  storageInstance.emitter.emit(storageInstance.eventNameForApp(taskId, eventName), body);
}

export function getHttpUrlParts(url: string): { bucket: string; path: string } | null {
  const decoded = decodeURIComponent(url);
  const parts = decoded.match(/\/b\/(.*)\/o\/([a-zA-Z0-9./\-_]+)(.*)/);

  if (!parts || parts.length < 3) {
    return null;
  }

  return { bucket: `gs://${parts[1]}`, path: parts[2]! };
}

export function getGsUrlParts(url: string): { bucket: string; path: string } {
  const bucket = url.substring(0, url.indexOf('/', 5)) || url;
  const path =
    (url.indexOf('/', 5) > -1 ? url.substring(url.indexOf('/', 5) + 1, url.length) : '/') || '/';

  return { bucket, path };
}

export function validateMetadata(metadata: any, update = true): SettableMetadata {
  if (!isObject(metadata)) {
    throw new Error('firebase.storage.SettableMetadata must be an object value if provided.');
  }

  const metadataEntries = Object.entries(metadata);

  for (let i = 0; i < metadataEntries.length; i++) {
    const entry = metadataEntries[i];
    if (!entry) continue;
    const [key, value] = entry;
    // validate keys
    if (!SETTABLE_FIELDS.includes(key as (typeof SETTABLE_FIELDS)[number])) {
      throw new Error(
        `firebase.storage.SettableMetadata unknown property '${key}' provided for metadata.`,
      );
    }

    // md5 is only allowed on put, not on update
    if (key === 'md5hash' && update === true) {
      throw new Error(
        `firebase.storage.SettableMetadata md5hash may only be set on upload, not on updateMetadata`,
      );
    }

    // validate values
    if (key !== 'customMetadata') {
      if (!isString(value) && !isNull(value)) {
        throw new Error(
          `firebase.storage.SettableMetadata invalid property '${key}' should be a string or null value.`,
        );
      }
    } else if (!isObject(value) && !isNull(value)) {
      throw new Error(
        'firebase.storage.SettableMetadata.customMetadata must be an object of keys and string values or null value.',
      );
    }
  }

  return metadata as SettableMetadata;
}
