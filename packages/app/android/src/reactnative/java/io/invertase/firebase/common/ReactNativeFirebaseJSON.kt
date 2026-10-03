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

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.invertase.firebase.BuildConfig
import org.json.JSONException
import org.json.JSONObject
import java.util.ArrayList

class ReactNativeFirebaseJSON private constructor() {
  private var jsonObject: JSONObject? = JSONObject(BuildConfig.FIREBASE_JSON_RAW)

  fun contains(key: String?): Boolean = jsonObject?.has(key) ?: false

  fun getBooleanValue(
    key: String?,
    defaultValue: Boolean,
  ): Boolean = jsonObject?.optBoolean(key, defaultValue) ?: defaultValue

  fun getIntValue(
    key: String?,
    defaultValue: Int,
  ): Int = jsonObject?.optInt(key, defaultValue) ?: defaultValue

  fun getLongValue(
    key: String?,
    defaultValue: Long,
  ): Long = jsonObject?.optLong(key, defaultValue) ?: defaultValue

  fun getStringValue(
    key: String?,
    defaultValue: String?,
  ): String? {
    val source = jsonObject ?: return defaultValue
    return source.optString(key, defaultValue)
  }

  fun getArrayValue(key: String?): ArrayList<String> {
    val result = ArrayList<String>()
    val source = jsonObject ?: return result

    try {
      val array = source.optJSONArray(key)
      if (array != null) {
        for (index in 0 until array.length()) {
          result.add(array.getString(index))
        }
      }
    } catch (_: JSONException) {
      // Do nothing.
    }

    return result
  }

  fun getRawJSON(): String = BuildConfig.FIREBASE_JSON_RAW

  fun getAll(): WritableMap {
    val writableMap = Arguments.createMap()
    val source = jsonObject ?: return writableMap

    val keys = source.keys()
    while (keys.hasNext()) {
      try {
        val key = keys.next()
        SharedUtils.mapPutValue(key, source.get(key), writableMap)
      } catch (_: JSONException) {
        // Ignore malformed entries and continue converting the remaining values.
      }
    }

    return writableMap
  }

  companion object {
    private val sharedInstance = ReactNativeFirebaseJSON()

    @JvmStatic fun getSharedInstance(): ReactNativeFirebaseJSON = sharedInstance
  }
}
