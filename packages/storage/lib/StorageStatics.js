/* eslint-disable no-console */
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

import { NativeModules } from 'react-native';
import { stripTrailingSlash } from '@react-native-firebase/common';

// TODO(salakar) refactor once deprecations have been removed

const PATH_NAMES = {
  MainBundle: 'MAIN_BUNDLE_PATH',
  CachesDirectory: 'CACHES_DIRECTORY_PATH',
  DocumentDirectory: 'DOCUMENT_DIRECTORY_PATH',
  ExternalDirectory: 'EXTERNAL_DIRECTORY_PATH',
  ExternalStorageDirectory: 'EXTERNAL_STORAGE_DIRECTORY_PATH',
  TempDirectory: 'TEMP_DIRECTORY_PATH',
  LibraryDirectory: 'LIBRARY_DIRECTORY_PATH',
  PicturesDirectory: false,
  MoviesDirectory: false,
};

const PATH_FILE_TYPES = ['FILE_TYPE_REGULAR', 'FILE_TYPE_DIRECTORY'];

const path = {};
let processedPathConstants = false;

function processPathConstants(nativeModule) {
  if (processedPathConstants || !nativeModule) return path;
  processedPathConstants = true;

  const entries = Object.entries(PATH_NAMES);
  for (let i = 0; i < entries.length; i++) {
    const [newName, oldName] = entries[i];
    path[newName] = nativeModule[newName] ? stripTrailingSlash(nativeModule[newName]) : null;

    // TODO(salakar) deprecated remove in 6.1.0:
    if (oldName) {
      Object.defineProperty(path, `${oldName}`, {
        // eslint-disable-next-line no-loop-func
        get() {
          console.warn(
            `'firebase.storage.Native.${oldName}' is deprecated and will be removed in 6.1.0 please use 'firebase.storage.Path.${newName}' instead`,
          );

          return path[newName];
        },
      });
    }
  }

  for (let i = 0; i < PATH_FILE_TYPES.length; i++) {
    const pathFileType = PATH_FILE_TYPES[i];
    path[pathFileType] = stripTrailingSlash(nativeModule[pathFileType]);

    // TODO(salakar) deprecated remove in 6.1.0:
    const deprecatedFileTypeName = pathFileType.replace('_', '');
    path[deprecatedFileTypeName] = path[pathFileType];
  }

  Object.freeze(path);

  return path;
}

export default {
  StringFormat: {
    RAW: 'raw',
    BASE64: 'base64',
    BASE64URL: 'base64url',
    DATA_URL: 'data_url',
  },
  TaskEvent: {
    STATE_CHANGED: 'state_changed',
  },
  TaskState: {
    RUNNING: 'running',
    PAUSED: 'paused',
    SUCCESS: 'success',
    CANCELLED: 'cancelled',
    ERROR: 'error',
  },
  get Path() {
    return processPathConstants(NativeModules.RNFBStorageModule);
  },
  // TODO(salakar) deprecated remove in 6.1.0:
  get Native() {
    return processPathConstants(NativeModules.RNFBStorageModule);
  },
};
