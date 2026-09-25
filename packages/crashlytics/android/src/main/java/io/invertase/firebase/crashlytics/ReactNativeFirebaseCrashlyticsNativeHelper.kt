package io.invertase.firebase.crashlytics

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

import com.google.firebase.crashlytics.FirebaseCrashlytics

/**
 * Public static helpers for native/Android callers that need Crashlytics without going through the
 * TurboModule. Historical Java shape was a class of static methods; Kotlin [object] + `@JvmStatic`
 * keeps `ReactNativeFirebaseCrashlyticsNativeHelper.recordNativeException(...)` working for Java.
 */
object ReactNativeFirebaseCrashlyticsNativeHelper {
  @JvmStatic
  fun recordNativeException(throwable: Throwable) {
    FirebaseCrashlytics.getInstance().recordException(throwable)
  }

  @JvmStatic
  fun log(message: String) {
    FirebaseCrashlytics.getInstance().log(message)
  }

  @JvmStatic
  fun setCustomKey(
    key: String,
    value: String,
  ) {
    FirebaseCrashlytics.getInstance().setCustomKey(key, value)
  }
}
