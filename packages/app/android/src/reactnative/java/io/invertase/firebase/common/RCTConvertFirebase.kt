package io.invertase.firebase.common

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import io.invertase.firebase.app.NativeRNFBTurboApp
import java.util.HashMap

/** Utilities to convert to and from React Native bridge formats. */
open class RCTConvertFirebase {
  companion object {
    private const val TAG = "RCTConvertFirebase"

    @JvmStatic
    fun firebaseAppToMap(firebaseApp: FirebaseApp?): Map<String, Any?> {
      val name = firebaseApp!!.name
      val appOptions = firebaseApp.options

      val root = HashMap<String, Any?>()
      val options = HashMap<String, Any?>()
      val appConfig = HashMap<String, Any?>()

      appConfig["name"] = name
      appConfig["automaticDataCollectionEnabled"] =
        firebaseApp.isDataCollectionDefaultEnabled

      // TODO: Salakar: Firebase SDK does not support reading this value
      // appConfig["automaticResourceManagement"] = false

      options["apiKey"] = appOptions.apiKey
      options["appId"] = appOptions.applicationId
      options["projectId"] = appOptions.projectId
      options["databaseURL"] = appOptions.databaseUrl
      options["measurementId"] = appOptions.gaTrackingId
      options["messagingSenderId"] = appOptions.gcmSenderId
      options["storageBucket"] = appOptions.storageBucket

      NativeRNFBTurboApp.authDomains[name]?.let { options["authDomain"] = it }

      root["options"] = options
      root["appConfig"] = appConfig

      return root
    }

    @JvmStatic
    fun firebaseAppToWritableMap(firebaseApp: FirebaseApp?): WritableMap? = Arguments.makeNativeMap(firebaseAppToMap(firebaseApp))

    @JvmStatic
    fun readableMapToFirebaseApp(
      options: ReadableMap?,
      appConfig: ReadableMap?,
      context: Context?,
    ): FirebaseApp? {
      val builder = FirebaseOptions.Builder()
      val name = appConfig!!.getString("name")

      builder.setApiKey(options!!.getString("apiKey")!!)
      builder.setApplicationId(options.getString("appId")!!)
      builder.setProjectId(options.getString("projectId"))
      builder.setDatabaseUrl(options.getString("databaseURL"))

      if (options.hasKey("measurementId")) {
        builder.setGaTrackingId(options.getString("measurementId"))
      }

      builder.setStorageBucket(options.getString("storageBucket"))
      builder.setGcmSenderId(options.getString("messagingSenderId"))

      val firebaseApp =
        if (name!!.equals("[DEFAULT]")) {
          FirebaseApp.initializeApp(context!!, builder.build())
        } else {
          FirebaseApp.initializeApp(context!!, builder.build(), name)
        }

      if (appConfig.hasKey("automaticDataCollectionEnabled")) {
        firebaseApp!!.setDataCollectionDefaultEnabled(
          appConfig.getBoolean("automaticDataCollectionEnabled"),
        )
      }

      if (appConfig.hasKey("automaticResourceManagement")) {
        // https://developers.google.com/android/reference/com/google/firebase/FirebaseApp.html#setAutomaticResourceManagementEnabled(boolean)
        firebaseApp!!.setAutomaticResourceManagementEnabled(
          appConfig.getBoolean("automaticResourceManagement"),
        )
      }

      return firebaseApp
    }

    /**
     * Takes a value and calls the appropriate setter for its type on the target map + key.
     *
     * @param key String key to set on target map
     * @param value Object value to set on target map
     * @param map WritableMap target map to write the value to
     */
    @JvmStatic
    @Suppress("UNCHECKED_CAST")
    fun mapPutValue(
      key: String?,
      value: Any?,
      map: WritableMap?,
    ): WritableMap? {
      val target = map!!
      if (value == null) {
        target.putNull(key!!)
        return map
      }

      val type = value.javaClass.name
      val targetKey = key!!

      when (type) {
        "java.lang.Boolean" -> target.putBoolean(targetKey, value as Boolean)
        "java.lang.Long" -> target.putDouble(targetKey, (value as Long).toDouble())
        "java.lang.Float" -> target.putDouble(targetKey, (value as Float).toDouble())
        "java.lang.Double" -> target.putDouble(targetKey, value as Double)
        "java.lang.Integer" -> target.putInt(targetKey, value as Int)
        "java.lang.String" -> target.putString(targetKey, value as String)
        "org.json.JSONObject\$1" -> target.putString(targetKey, value.toString())
        else ->
          when (value) {
            is List<*> ->
              target.putArray(targetKey, Arguments.makeNativeArray(value as List<Any?>))
            is Map<*, *> -> {
              val childMap = Arguments.createMap()
              for ((childKey, childValue) in value as Map<String, Any?>) {
                mapPutValue(childKey, childValue, childMap)
              }
              target.putMap(targetKey, childMap)
            }
            else -> {
              Log.d(TAG, "utils:mapPutValue:unknownType:$type")
              target.putNull(targetKey)
            }
          }
      }

      return map
    }

    // TODO Remove me - also in SharedUtils
    @JvmStatic
    fun readableMapToWritableMap(map: ReadableMap?): WritableMap? {
      val writableMap = Arguments.createMap()
      // https://github.com/facebook/react-native/blob/main/ReactAndroid/src/main/java/com/facebook/react/bridge/WritableNativeMap.java#L54
      writableMap.merge(map!!)
      return writableMap
    }

    @JvmStatic
    fun toHashMap(readableMap: ReadableMap?): Map<String, Any?>? =
      // https://github.com/facebook/react-native/blob/main/ReactAndroid/src/main/java/com/facebook/react/bridge/ReadableNativeMap.java#L216
      readableMap!!.toHashMap()

    @JvmStatic
    fun toArrayList(readableArray: ReadableArray?): List<Any?>? =
      // https://github.com/facebook/react-native/blob/main/ReactAndroid/src/main/java/com/facebook/react/bridge/ReadableNativeArray.java#L175
      readableArray!!.toArrayList()
  }
}
