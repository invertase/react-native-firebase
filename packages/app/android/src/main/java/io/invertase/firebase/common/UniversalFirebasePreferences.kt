package io.invertase.firebase.common

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

import android.content.Context
import android.content.SharedPreferences
import io.invertase.firebase.app.ReactNativeFirebaseApp

open class UniversalFirebasePreferences {
  private var preferences: SharedPreferences? = null

  open fun contains(key: String?): Boolean = getPreferences().contains(key)

  open fun setBooleanValue(
    key: String?,
    value: Boolean,
  ) {
    getPreferences().edit().putBoolean(key, value).apply()
  }

  open fun getBooleanValue(
    key: String?,
    defaultValue: Boolean,
  ): Boolean = getPreferences().getBoolean(key, defaultValue)

  open fun setIntValue(
    key: String?,
    value: Int,
  ) {
    getPreferences().edit().putInt(key, value).apply()
  }

  open fun getIntValue(
    key: String?,
    defaultValue: Int,
  ): Int = getPreferences().getInt(key, defaultValue)

  open fun setLongValue(
    key: String?,
    value: Long,
  ) {
    getPreferences().edit().putLong(key, value).apply()
  }

  open fun getLongValue(
    key: String?,
    defaultValue: Long,
  ): Long = getPreferences().getLong(key, defaultValue)

  open fun setStringValue(
    key: String?,
    value: String?,
  ) {
    getPreferences().edit().putString(key, value).apply()
  }

  open fun getStringValue(
    key: String?,
    defaultValue: String?,
  ): String? = getPreferences().getString(key, defaultValue)

  open fun clearAll() {
    getPreferences().edit().clear().apply()
  }

  // The caller is responsible for calling apply() or commit() on the returned editor.
  open fun remove(key: String?): SharedPreferences.Editor = getPreferences().edit().remove(key)

  private fun getPreferences(): SharedPreferences {
    if (preferences == null) {
      preferences =
        ReactNativeFirebaseApp
          .getApplicationContext()
          .getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE)
    }
    return preferences!!
  }

  companion object {
    private const val PREFERENCES_FILE = "io.invertase.firebase"
    private val sharedInstance = UniversalFirebasePreferences()

    @JvmStatic fun getSharedInstance(): UniversalFirebasePreferences = sharedInstance
  }
}
