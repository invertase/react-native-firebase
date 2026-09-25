package io.invertase.firebase.messaging

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
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

/**
 * Bidirectional conversion between React Native bridge maps/arrays and org.json structures.
 *
 * Historical Java shape was an abstract class of static helpers. Kotlin [object] + `@JvmStatic`
 * keeps `import static …JsonConvert.reactToJSON` / `jsonToReact` working for Java callers
 * without an unreachable abstract-class constructor.
 */
object JsonConvert {
  @JvmStatic
  @Throws(JSONException::class)
  fun reactToJSON(readableMap: ReadableMap): JSONObject {
    val jsonObject = JSONObject()
    val iterator = readableMap.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      when (readableMap.getType(key)) {
        ReadableType.Null -> jsonObject.put(key, JSONObject.NULL)
        ReadableType.Boolean -> jsonObject.put(key, readableMap.getBoolean(key))
        ReadableType.Number -> jsonObject.put(key, readableMap.getDouble(key))
        ReadableType.String -> jsonObject.put(key, readableMap.getString(key))
        ReadableType.Map -> jsonObject.put(key, reactToJSON(readableMap.getMap(key)!!))
        ReadableType.Array -> jsonObject.put(key, reactToJSON(readableMap.getArray(key)!!))
      }
    }
    return jsonObject
  }

  @JvmStatic
  @Throws(JSONException::class)
  fun reactToJSON(readableArray: ReadableArray): JSONArray {
    val jsonArray = JSONArray()
    for (i in 0 until readableArray.size()) {
      when (readableArray.getType(i)) {
        ReadableType.Null -> jsonArray.put(JSONObject.NULL)
        ReadableType.Boolean -> jsonArray.put(readableArray.getBoolean(i))
        ReadableType.Number -> jsonArray.put(readableArray.getDouble(i))
        ReadableType.String -> jsonArray.put(readableArray.getString(i))
        ReadableType.Map -> jsonArray.put(reactToJSON(readableArray.getMap(i)!!))
        ReadableType.Array -> jsonArray.put(reactToJSON(readableArray.getArray(i)!!))
      }
    }
    return jsonArray
  }

  @JvmStatic
  @Throws(JSONException::class)
  fun jsonToReact(jsonObject: JSONObject): WritableMap {
    val writableMap = Arguments.createMap()
    val iterator = jsonObject.keys()
    while (iterator.hasNext()) {
      val key = iterator.next()
      val value = jsonObject.get(key)
      when {
        value is Boolean -> writableMap.putBoolean(key, jsonObject.getBoolean(key))
        value is Number -> writableMap.putDouble(key, jsonObject.getDouble(key))
        value is String -> writableMap.putString(key, jsonObject.getString(key))
        value is JSONObject -> writableMap.putMap(key, jsonToReact(jsonObject.getJSONObject(key)))
        value is JSONArray -> writableMap.putArray(key, jsonToReact(jsonObject.getJSONArray(key)))
        value === JSONObject.NULL -> writableMap.putNull(key)
      }
    }
    return writableMap
  }

  @JvmStatic
  @Throws(JSONException::class)
  fun jsonToReact(jsonArray: JSONArray): WritableArray {
    val writableArray = Arguments.createArray()
    for (i in 0 until jsonArray.length()) {
      val value = jsonArray.get(i)
      when {
        value is Boolean -> writableArray.pushBoolean(jsonArray.getBoolean(i))
        value is Number -> writableArray.pushDouble(jsonArray.getDouble(i))
        value is String -> writableArray.pushString(jsonArray.getString(i))
        value is JSONObject -> writableArray.pushMap(jsonToReact(jsonArray.getJSONObject(i)))
        value is JSONArray -> writableArray.pushArray(jsonToReact(jsonArray.getJSONArray(i)))
        value === JSONObject.NULL -> writableArray.pushNull()
      }
    }
    return writableArray
  }
}
