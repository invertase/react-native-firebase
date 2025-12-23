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

/**
 * Minimal module augmentation for analytics to support optional usage in crashlytics handlers.
 * This allows firebase.app().analytics() to be called when analytics is available,
 * without requiring the full analytics package types to be included.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    interface FirebaseApp {
      /**
       * Returns the Analytics instance for this app.
       * Note: This method is only available if @react-native-firebase/analytics is installed.
       */
      analytics(): {
        logEvent(eventName: string, eventParams?: { [key: string]: any }): Promise<void>;
      };
    }
  }
}
