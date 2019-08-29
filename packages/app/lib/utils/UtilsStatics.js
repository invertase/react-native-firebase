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
import { stripTrailingSlash } from '../../lib/common';

// TODO(salakar) refactor once deprecations have been removed
const PATH_NAMES = {
  MAIN_BUNDLE: 'MAIN_BUNDLE_PATH',
  CACHES_DIRECTORY: 'CACHES_DIRECTORY_PATH',
  DOCUMENT_DIRECTORY: 'DOCUMENT_DIRECTORY_PATH',
  EXTERNAL_DIRECTORY: 'EXTERNAL_DIRECTORY_PATH',
  EXTERNAL_STORAGE_DIRECTORY: 'EXTERNAL_STORAGE_DIRECTORY_PATH',
  TEMP_DIRECTORY: 'TEMP_DIRECTORY_PATH',
  LIBRARY_DIRECTORY: 'LIBRARY_DIRECTORY_PATH',
  PICTURES_DIRECTORY: false,
  MOVIES_DIRECTORY: false,
};

const PATH_FILE_TYPES = ['FILE_TYPE_REGULAR', 'FILE_TYPE_DIRECTORY'];

const path = {};
let processedPathConstants = false;

function processPathConstants(nativeModule) {
  if (processedPathConstants || !nativeModule) {
    return path;
  }
  processedPathConstants = true;

  const entries = Object.entries(PATH_NAMES);
  for (let i = 0; i < entries.length; i++) {
    const [newName, oldName] = entries[i];
    path[newName] = nativeModule[newName] ? stripTrailingSlash(nativeModule[newName]) : null;

    // TODO(salakar) deprecated remove in 6.1.0:
    if (oldName) {
      Object.defineProperty(path, `${oldName}`, {
        get() {
          console.warn(
            `'firebase.utils.Native.${oldName}' is deprecated and will be removed in 6.1.0 please use 'firebase.utils.FilePath.${newName}' instead`,
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
  SDK_VERSION: require('./../version'),
  get FilePath() {
    // TODO move from storage native code into utils native code
    return processPathConstants(NativeModules.RNFBUtilsModule);
  },
  // TODO(salakar) deprecated remove in 6.1.0:
  get Native() {
    // TODO move from storage native code into utils native code
    return processPathConstants(NativeModules.RNFBUtilsModule);
  },
};
