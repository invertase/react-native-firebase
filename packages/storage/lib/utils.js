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

import { NativeFirebaseError } from '@react-native-firebase/app/lib/internal';
import { isNull, isString } from '@react-native-firebase/common';

const SETTABLE_FIELDS = [
  'cacheControl',
  'contentDisposition',
  'contentEncoding',
  'contentLanguage',
  'contentType',
  'customMetadata',
];

export function handleStorageEvent(storageInstance, event) {
  const { taskId, eventName } = event;
  const body = event.body || {};

  if (body.error) {
    body.error = NativeFirebaseError.fromEvent(body.error, storageInstance._config.namespace);
  }

  storageInstance.emitter.emit(storageInstance.eventNameForApp(taskId, eventName), body);
}

export function getUrlParts(url) {
  const bucket = url.substring(0, url.indexOf('/', 5)) || url;
  const path =
    (url.indexOf('/', 5) > -1 ? url.substring(url.indexOf('/', 5) + 1, url.length) : '/') || '/';

  return { bucket, path };
}

/**
 * Returns the next parent of the path e.g. /foo/bar/car -> /foo/bar
 */
export function pathParent(path) {
  if (path.length === 0) {
    return null;
  }

  const index = path.lastIndexOf('/');
  if (index === -1) {
    return '';
  }

  return path.slice(0, index);
}

/**
 * Joins a parent and a child path
 */
export function pathChild(path, childPath) {
  const canonicalChildPath = childPath
    .split('/')
    .filter($ => $.length > 0)
    .join('/');

  if (path.length === 0) {
    return canonicalChildPath;
  }

  return `${path}/${canonicalChildPath}`;
}

/**
 * Returns the last component of a path, e.g /foo/bar.jpeg -> bar.jpeg
 */
export function pathLastComponent(path) {
  const index = path.lastIndexOf('/', path.length - 2);
  if (index === -1) {
    return path;
  }

  return path.slice(index + 1);
}

/**
 *
 */
export function validateMetadata(metadata) {
  const metadataEntries = Object.entries(metadata);

  for (let i = 0; i < metadataEntries.length; i++) {
    const [key, value] = metadataEntries[i];
    if (!SETTABLE_FIELDS.includes(key)) {
      throw new Error(
        `firebase.storage.StorageReference.updateMetadata(*) unknown property '${key}' provided for metadata.`,
      );
    }

    if (key !== 'customMetadata') {
      if (!isString(value) && !isNull(value)) {
        throw new Error(
          `firebase.storage.StorageReference.updateMetadata(*) property '${key}' should be a string or null value.`,
        );
      }
    } else {
      // TODO(salakar) customMetadata validate
    }
  }

  return metadata;
}
