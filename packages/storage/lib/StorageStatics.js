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

const NativePaths = NativeModules.RNFBStorageModule
  ? {
      MAIN_BUNDLE_PATH: stripTrailingSlash(NativeModules.RNFBStorageModule.MAIN_BUNDLE_PATH),
      CACHES_DIRECTORY_PATH: stripTrailingSlash(
        NativeModules.RNFBStorageModule.CACHES_DIRECTORY_PATH,
      ),
      DOCUMENT_DIRECTORY_PATH: stripTrailingSlash(
        NativeModules.RNFBStorageModule.DOCUMENT_DIRECTORY_PATH,
      ),
      EXTERNAL_DIRECTORY_PATH: stripTrailingSlash(
        NativeModules.RNFBStorageModule.EXTERNAL_DIRECTORY_PATH || null,
      ),
      EXTERNAL_STORAGE_DIRECTORY_PATH: stripTrailingSlash(
        NativeModules.RNFBStorageModule.EXTERNAL_STORAGE_DIRECTORY_PATH || null,
      ),
      TEMP_DIRECTORY_PATH: stripTrailingSlash(NativeModules.RNFBStorageModule.TEMP_DIRECTORY_PATH),
      LIBRARY_DIRECTORY_PATH: stripTrailingSlash(
        NativeModules.RNFBStorageModule.LIBRARY_DIRECTORY_PATH,
      ),
      FILE_TYPE_REGULAR: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_REGULAR),
      FILE_TYPE_DIRECTORY: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_DIRECTORY),

      // TODO(deprecation) remove in 6.2.0
      // TODO(salakar) add getter deprecation warning
      FILETYPE_REGULAR: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_REGULAR),
      FILETYPE_DIRECTORY: stripTrailingSlash(NativeModules.RNFBStorageModule.FILE_TYPE_DIRECTORY),
    }
  : {};

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
  Native: NativePaths,
};
