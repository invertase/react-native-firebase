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

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.invertase.firebase.app.ReactNativeFirebaseApp

open class ReactNativeFirebaseMeta {
  private fun getMetaData(): Bundle? {
    try {
      val context = ReactNativeFirebaseApp.getApplicationContext()
      val packageManager = context.packageManager ?: return null
      val applicationInfo: ApplicationInfo? =
        packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)
      return applicationInfo?.metaData
    } catch (_: PackageManager.NameNotFoundException) {
      // Do nothing.
    }

    return null
  }

  open fun contains(key: String?): Boolean {
    val metaData = getMetaData() ?: return false
    return metaData.containsKey(META_PREFIX + key)
  }

  open fun getBooleanValue(
    key: String?,
    defaultValue: Boolean,
  ): Boolean {
    val metaData = getMetaData() ?: return defaultValue
    return metaData.getBoolean(META_PREFIX + key, defaultValue)
  }

  open fun getStringValue(
    key: String?,
    defaultValue: String?,
  ): String? {
    val metaData = getMetaData() ?: return defaultValue
    return metaData.getString(META_PREFIX + key, defaultValue)
  }

  open fun getIntValue(
    key: String?,
    defaultValue: Int,
  ): Int {
    val metaData = getMetaData() ?: return defaultValue
    return metaData.getInt(META_PREFIX + key, defaultValue)
  }

  open fun getAll(): WritableMap {
    val metaData = getMetaData()
    val map = Arguments.createMap()
    if (metaData == null) return map

    for (key in metaData.keySet()) {
      if (key.startsWith(META_PREFIX)) {
        when (val value = metaData.get(key)) {
          null -> map.putNull(key)
          is String -> map.putString(key, value)
          is Boolean -> map.putBoolean(key, value)
          is Int -> map.putInt(key, value)
        }
      }
    }

    return map
  }

  companion object {
    private const val META_PREFIX = "rnfirebase_"
    private val sharedInstance = ReactNativeFirebaseMeta()

    @JvmStatic fun getSharedInstance(): ReactNativeFirebaseMeta = sharedInstance
  }
}
