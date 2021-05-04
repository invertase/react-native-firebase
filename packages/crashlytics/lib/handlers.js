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

import { firebase } from '@react-native-firebase/app';
import { isError, once } from '@react-native-firebase/app/lib/common';
import tracking from 'promise/setimmediate/rejection-tracking';
import StackTrace from 'stacktrace-js';

export const FATAL_FLAG = 'com.firebase.crashlytics.reactnative.fatal';

export function createNativeErrorObj(error, stackFrames, isUnhandledRejection, jsErrorName) {
  const nativeObj = {};

  nativeObj.message = `${error.message}`;
  nativeObj.isUnhandledRejection = isUnhandledRejection;

  nativeObj.frames = [];

  if (jsErrorName) {
    // Option to fix crashlytics display and alerting. You can add an error name to the recordError function
    nativeObj.frames.push({
      src: '<unknown>',
      line: 0,
      col: 0,
      fn: '<unknown>',
      file: jsErrorName,
    });
  }

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
    // If collection is disabled, just forward to the original handler
    if (!nativeModule.isCrashlyticsCollectionEnabled) {
      return originalHandler(error, fatal);
    }

    if (!isError(error)) {
      await nativeModule.logPromise(`Unknown Error: ${error}`);
      return originalHandler(error, fatal);
    }

    // If we are supposed to log javascript-level stack traces, convert this error and log it
    if (nativeModule.isErrorGenerationOnJSCrashEnabled) {
      try {
        const stackFrames = await StackTrace.fromError(error, { offline: true });
        // The backend conversion scan converts the closest event to this timestamp without going over
        // from the timestamp here. So the timestamp *must* be greater then the event log time.
        //
        // For that reason we always round up (`.ceil`) and add a second in case of latency
        //
        // Time is specified as seconds since start of Unix epoch as a baseline, as a string
        const fatalTime = Math.ceil(new Date() / 1000) + 1 + '';

        // Flag the Crashlytics backend that we have a fatal error, they will transform it
        await nativeModule.setAttribute(FATAL_FLAG, fatalTime);

        // Notify analytics, if it exists - throws error if not
        try {
          await firebase.app().analytics().logEvent(
            'app_exception', // 'app_exception' is reserved but we make an exception for JS->fatal transforms
            {
              fatal: 1, // as in firebase-android-sdk
              timestamp: fatalTime,
            },
          );
        } catch (e) {
          // This just means analytics was not present, so we could not log the analytics event
          // console.log('error logging analytics app_exception: ' + e);
        }

        // If we are chaining to other handlers, just record the error, otherwise we need to crash with it
        if (nativeModule.isCrashlyticsJavascriptExceptionHandlerChainingEnabled) {
          await nativeModule.recordErrorPromise(createNativeErrorObj(error, stackFrames, false));
        } else {
          await nativeModule.crashWithStackPromise(createNativeErrorObj(error, stackFrames, false));
        }
      } catch (e) {
        // do nothing
        // console.log('error logging handling the exception: ' + e);
      }
    }

    // If we are configured to chain exception handlers, do so. It could result in duplicate errors though.
    if (nativeModule.isCrashlyticsJavascriptExceptionHandlerChainingEnabled) {
      return originalHandler(error, fatal);
    }
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
