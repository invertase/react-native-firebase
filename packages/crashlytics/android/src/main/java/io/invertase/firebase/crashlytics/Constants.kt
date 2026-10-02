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

/**
 * Preference / meta / JSON keys for Crashlytics init. Historical Java shape was a
 * package-private class of `static final String` fields; Kotlin [object] + `@JvmField`
 * keeps `import static …Constants.*` and `Constants.KEY_…` working for same-module Java.
 */
internal object Constants {
  @JvmField
  val KEY_CRASHLYTICS_NDK_ENABLED: String = "crashlytics_ndk_enabled"

  @JvmField
  val KEY_CRASHLYTICS_DEBUG_ENABLED: String = "crashlytics_debug_enabled"

  @JvmField
  val KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED: String = "crashlytics_auto_collection_enabled"

  @JvmField
  val KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED: String =
    "crashlytics_is_error_generation_on_js_crash_enabled"

  @JvmField
  val KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED: String =
    "crashlytics_javascript_exception_handler_chaining_enabled"
}
