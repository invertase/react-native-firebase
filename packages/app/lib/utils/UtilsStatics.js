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

const PATH_NAMES = [
  'MAIN_BUNDLE',
  'CACHES_DIRECTORY',
  'DOCUMENT_DIRECTORY',
  'EXTERNAL_DIRECTORY',
  'EXTERNAL_STORAGE_DIRECTORY',
  'TEMP_DIRECTORY',
  'LIBRARY_DIRECTORY',
  'PICTURES_DIRECTORY',
  'MOVIES_DIRECTORY',
];

const PATH_FILE_TYPES = ['FILE_TYPE_REGULAR', 'FILE_TYPE_DIRECTORY'];

const paths = {};
let processedPathConstants = false;

function processPathConstants(nativeModule) {
  if (processedPathConstants || !nativeModule) {
    return paths;
  }
  processedPathConstants = true;

  for (let i = 0; i < PATH_NAMES.length; i++) {
    const path = PATH_NAMES[i];
    paths[path] = nativeModule[path] ? stripTrailingSlash(nativeModule[path]) : null;
  }

  for (let i = 0; i < PATH_FILE_TYPES.length; i++) {
    const pathFileType = PATH_FILE_TYPES[i];
    paths[pathFileType] = stripTrailingSlash(nativeModule[pathFileType]);
  }

  Object.freeze(paths);

  return paths;
}

export default {
  SDK_VERSION: require('./../version'),
  get FilePath() {
    return processPathConstants(NativeModules.RNFBUtilsModule);
  },
};
