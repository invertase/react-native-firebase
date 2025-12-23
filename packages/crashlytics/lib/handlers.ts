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

import { firebase } from '.';
import { isError, once } from '@react-native-firebase/app/lib/common';
// @ts-ignore - No declaration file for promise/setimmediate/rejection-tracking
import tracking from 'promise/setimmediate/rejection-tracking';
import StackTrace from 'stacktrace-js';
// Import minimal analytics augmentation for type support
import './types/analytics-augmentation';
export const FATAL_FLAG = 'com.firebase.crashlytics.reactnative.fatal';

interface NativeErrorFrame {
  src: string;
  line: number;
  col: number;
  fn: string;
  file: string;
}

interface NativeErrorObj {
  message: string;
  isUnhandledRejection: boolean;
  frames: NativeErrorFrame[];
}

interface NativeModule {
  isCrashlyticsCollectionEnabled: boolean;
  isErrorGenerationOnJSCrashEnabled: boolean;
  isCrashlyticsJavascriptExceptionHandlerChainingEnabled: boolean;
  logPromise(message: string): Promise<void>;
  setAttribute(name: string, value: string): Promise<void>;
  recordErrorPromise(errorObj: NativeErrorObj): Promise<void>;
  crashWithStackPromise(errorObj: NativeErrorObj): Promise<void>;
}

export function createNativeErrorObj(
  error: Error,
  stackFrames: StackTrace.StackFrame[],
  isUnhandledRejection: boolean,
  jsErrorName?: string,
): NativeErrorObj {
  const nativeObj: NativeErrorObj = {
    message: `${error.message}`,
    isUnhandledRejection,
    frames: [],
  };

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
    const frame = stackFrames[i];
    if (!frame) continue;

    const { columnNumber, lineNumber, fileName, functionName, source } = frame;
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
      src: source || '<unknown>',
      line: lineNumber || 0,
      col: columnNumber || 0,
      fn: functionName || '<unknown>',
      file: `${fileNameParsed}:${lineNumber || 0}:${columnNumber || 0}`,
    });
  }

  return nativeObj;
}

export const setGlobalErrorHandler = once((nativeModule: NativeModule) => {
  const originalHandler = ErrorUtils.getGlobalHandler();

  async function handler(error: unknown, fatal?: boolean) {
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
        const fatalTime = Math.ceil(new Date().getTime() / 1000) + 1 + '';

        // Flag the Crashlytics backend that we have a fatal error, they will transform it
        await nativeModule.setAttribute(FATAL_FLAG, fatalTime);

        // remember our current deprecation warning state in case users
        // have set it to non-default
        const currentDeprecationWarningToggle =
          globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS;

        // Notify analytics, if it exists - throws error if not
        try {
          // FIXME - disable warnings and use the old namespaced style,
          // See https://github.com/invertase/react-native-firebase/issues/8381
          // Unfortunately, this fails completely when using modular!
          // Did not matter if I did named imports above or dynamic require here.
          // So temporarily reverting and silencing warnings instead
          globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
          await firebase.app().analytics().logEvent(
            'app_exception', // 'app_exception' is reserved but we make an exception for JS->fatal transforms
            {
              fatal: 1, // as in firebase-android-sdk
              timestamp: fatalTime,
            },
          );
        } catch (_) {
          // This just means analytics was not present, so we could not log the analytics event
          // console.log('error logging analytics app_exception: ' + e);
        } finally {
          globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = currentDeprecationWarningToggle;
        }

        // If we are chaining to other handlers, just record the error, otherwise we need to crash with it
        if (nativeModule.isCrashlyticsJavascriptExceptionHandlerChainingEnabled) {
          await nativeModule.recordErrorPromise(createNativeErrorObj(error, stackFrames, false));
        } else {
          await nativeModule.crashWithStackPromise(createNativeErrorObj(error, stackFrames, false));
        }
      } catch (_) {
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

export const setOnUnhandledPromiseRejectionHandler = once((nativeModule: NativeModule) => {
  async function onUnhandled(_id: number, error: Error) {
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
