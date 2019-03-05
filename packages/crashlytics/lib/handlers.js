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

import StackTrace from 'stacktrace-js';
import { isError, once, hasOwnProperty } from '@react-native-firebase/common';

function createNativeErrorObj(error, stackFrames, isUnhandledRejection) {
  const nativeObj = {};

  nativeObj.message = `${error.message}`;
  if (isUnhandledRejection) {
    nativeObj.message = `Unhandled Promise Rejection: ${nativeObj.message}`;
  }

  // TODO
  // NativeFirebaseError additional properties
  // nativeObj.attributes = { jsError: 'true' };
  // if (hasOwnProperty(error, 'code')) nativeObj.attributes.code = `${error.code}`;
  // if (hasOwnProperty(error, 'namespace')) nativeObj.attributes.namespace = `${error.namespace}`;
  // if (hasOwnProperty(error, 'nativeErrorCode'))
  //   nativeObj.attributes.nativeErrorCode = `${error.nativeErrorCode}`;
  // if (hasOwnProperty(error, 'nativeErrorMessage'))
  //   nativeObj.attributes.nativeErrorMessage = `${error.nativeErrorMessage}`;

  nativeObj.frames = [];
  for (let i = 0; i < stackFrames.length; i++) {
    const { columnNumber, lineNumber, fileName, functionName, source } = stackFrames[i];
    nativeObj.frames.push({
      src: source,
      line: lineNumber || 0,
      col: columnNumber || 0,
      fn: functionName || '<unknown>',
      file: `${
        fileName && fileName.length ? fileName.substring(0, fileName.indexOf('?')) : '<unknown>'
      }:${lineNumber || 0}:${columnNumber || 0}`,
    });
  }

  return nativeObj;
}

export const setGlobalErrorHandler = once(nativeModule => {
  const originalHandler = ErrorUtils.getGlobalHandler();

  async function handler(error, fatal) {
    // TODO __DEV__ disabled (unless option specified to allow)
    if (!isError(error)) {
      await nativeModule.logPromise(`Unknown Error: ${error}`);
      originalHandler(error, fatal);
    } else {
      const stackFrames = await StackTrace.fromError(error, { offline: true });
      await nativeModule.recordError(createNativeErrorObj(error, stackFrames, false));
      originalHandler(error, fatal);
    }
  }

  ErrorUtils.setGlobalHandler(handler);
  return handler;
});

// TODO
export const setOnUnhandledPromiseRejectionHandler = once(nativeModule => {
  const tracking = require('promise/setimmediate/rejection-tracking');
  tracking.enable({
    allRejections: true,
    onUnhandled(id, error) {
      // TODO
    },
    onHandled() {},
  });
});
