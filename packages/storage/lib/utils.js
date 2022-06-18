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

import { isNull, isObject, isString } from '@react-native-firebase/app/lib/common';
import { NativeFirebaseError } from '@react-native-firebase/app/lib/internal';

const SETTABLE_FIELDS = [
  'cacheControl',
  'contentDisposition',
  'contentEncoding',
  'contentLanguage',
  'contentType',
  'customMetadata',
  'md5hash',
];

export async function handleStorageEvent(storageInstance, event) {
  const { taskId, eventName } = event;
  const body = event.body || {};

  if (body.error) {
    body.error = await NativeFirebaseError.fromEvent(body.error, storageInstance._config.namespace);
  }

  storageInstance.emitter.emit(storageInstance.eventNameForApp(taskId, eventName), body);
}

export function getHttpUrlParts(url) {
  const decoded = decodeURIComponent(url);
  const parts = decoded.match(/\/b\/(.*)\/o\/([a-zA-Z0-9./\-_]+)(.*)/);

  if (!parts || parts.length < 3) {
    return null;
  }

  return { bucket: `gs://${parts[1]}`, path: parts[2] };
}

export function getGsUrlParts(url) {
  const bucket = url.substring(0, url.indexOf('/', 5)) || url;
  const path =
    (url.indexOf('/', 5) > -1 ? url.substring(url.indexOf('/', 5) + 1, url.length) : '/') || '/';

  return { bucket, path };
}

export function validateMetadata(metadata, update = true) {
  if (!isObject(metadata)) {
    throw new Error('firebase.storage.SettableMetadata must be an object value if provided.');
  }

  const metadataEntries = Object.entries(metadata);

  for (let i = 0; i < metadataEntries.length; i++) {
    const [key, value] = metadataEntries[i];
    // validate keys
    if (!SETTABLE_FIELDS.includes(key)) {
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

  return metadata;
}
