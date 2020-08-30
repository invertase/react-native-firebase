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

import { isError, once } from '@react-native-firebase/app/lib/common';
import tracking from 'promise/setimmediate/rejection-tracking';
import StackTrace from 'stacktrace-js';

export function createNativeErrorObj(error, stackFrames, isUnhandledRejection) {
  const nativeObj = {};

  nativeObj.message = `${error.message}`;
  nativeObj.isUnhandledRejection = isUnhandledRejection;

  nativeObj.frames = [];
  for (let i = 0; i < stackFrames.length; i++) {
    const { columnNumber, lineNumber, fileName, functionName, source } = stackFrames[i];
    let fileNameParsed = '<unknown>';
    if (fileName) {
      const subStrLen = fileName.indexOf('?');
      if (subStrLen < 0) {
        fileNameParsed = fileName;
      } else if (subStrLen > 0) {
        fileNameParsed = fileName.substring(0, subStrLen);
      }
    }

    nativeObj.frames.push({
      src: source,
      line: lineNumber || 0,
      col: columnNumber || 0,
      fn: functionName || '<unknown>',
      file: `${fileNameParsed}:${lineNumber || 0}:${columnNumber || 0}`,
    });
  }

  return nativeObj;
}

export const setGlobalErrorHandler = once(nativeModule => {
  const originalHandler = ErrorUtils.getGlobalHandler();

  async function handler(error, fatal) {
    if (__DEV__) {
      return originalHandler(error, fatal);
    }

    if (!isError(error)) {
      await nativeModule.logPromise(`Unknown Error: ${error}`);
      return originalHandler(error, fatal);
    }

    try {
      const stackFrames = await StackTrace.fromError(error, { offline: true });
      await nativeModule.recordErrorPromise(createNativeErrorObj(error, stackFrames, false));
    } catch (_) {
      // do nothing
    }
    return originalHandler(error, fatal);
  }

  ErrorUtils.setGlobalHandler(handler);
  return handler;
});

export const setOnUnhandledPromiseRejectionHandler = once(nativeModule => {
  async function onUnhandled(id, error) {
    if (!__DEV__) {
      // TODO(salakar): Option to disable
      try {
        const stackFrames = await StackTrace.fromError(error, { offline: true });
        await nativeModule.recordErrorPromise(createNativeErrorObj(error, stackFrames, true));
      } catch (_) {
        // do nothing
      }
    }
  }
  tracking.enable({
    allRejections: true,
    onUnhandled,
  });

  return onUnhandled;
});
