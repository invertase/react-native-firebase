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
 */

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.content.Context
import android.graphics.Point
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import javax.annotation.Nullable

@Suppress("unused", "KDocUnresolvedReference", "MemberVisibilityCanBePrivate", "PLATFORM_CLASS_MAPPED_TO_KOTLIN")
@SuppressLint("KotlinNullnessAnnotation")
open class SharedUtils {
  companion object {
    private const val TAG = "Utils"
    private const val RN_DEVSUPPORT_CLASS = "DevSupportManagerImpl"
    private const val RN_DEVSUPPORT_PACKAGE = "com.facebook.react.devsupport"

    private const val EXPO_REGISTRY_CLASS = "ModuleRegistry"
    private const val EXPO_CORE_PACKAGE = "expo.core"

    private const val FLUTTER_REGISTRY_CLASS = "PluginRegistry"
    private const val FLUTTER_CORE_PACKAGE = "io.flutter.plugin.common"

    private const val REACT_NATIVE_REGISTRY_CLASS = "NativeModuleRegistry"
    private const val REACT_NATIVE_CORE_PACKAGE = "com.facebook.react.bridge"

    @JvmStatic
    fun rectToIntArray(
      @Nullable rect: Rect?,
    ): IntArray {
      if (rect == null || rect.isEmpty) return intArrayOf()
      return intArrayOf(rect.left, rect.top, rect.right, rect.bottom)
    }

    @JvmStatic
    fun pointToIntArray(
      @Nullable point: Point?,
    ): IntArray {
      if (point == null) return intArrayOf()
      return intArrayOf(point.x, point.y)
    }

    @JvmStatic
    fun pointsToIntsList(
      @Nullable points: Array<Point?>?,
    ): List<IntArray> {
      if (points == null) return ArrayList()

      val pointsList = ArrayList<IntArray>(points.size)
      for (point in points) {
        pointsList.add(pointToIntArray(point))
      }

      return pointsList
    }

    /** Create a Uri from the path, defaulting to file when there is no supplied scheme. */
    @JvmStatic
    fun getUri(uri: String?): Uri {
      val parsed = Uri.parse(uri)

      if (parsed.scheme == null || platform(parsed.scheme).isEmpty()) {
        return Uri.fromFile(File(platform(uri)))
      }

      return parsed
    }

    @JvmStatic
    fun getExceptionMap(exception: Exception?): WritableMap {
      val source: Exception = platform(exception)
      val exceptionMap = Arguments.createMap()
      val code = "unknown"
      val message = source.message
      exceptionMap.putString("code", code)
      exceptionMap.putString("nativeErrorCode", code)
      exceptionMap.putString("message", message)
      exceptionMap.putString("nativeErrorMessage", message)
      return exceptionMap
    }

    @JvmStatic
    fun timestampToUTC(timestamp: Long): String {
      val millisTimestamp = timestamp * 1000
      val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.ROOT)
      format.timeZone = TimeZone.getTimeZone("UTC")
      return format.format(millisTimestamp)
    }

    /** Send a JS event. */
    @JvmStatic
    fun sendEvent(
      context: ReactContext?,
      eventName: String?,
      body: Any?,
    ) {
      if (context != null) {
        context
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(platform(eventName), body)
      } else {
        Log.d(TAG, "Missing context - cannot send event!")
      }
    }

    /**
     * We need to check if app is in foreground otherwise the app will crash.
     * http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
     *
     * @param context Context
     * @return boolean
     */
    @JvmStatic
    fun isAppInForeground(context: Context?): Boolean {
      val sourceContext: Context = platform(context)
      val activityManager =
        sourceContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager?
          ?: return false

      val appProcesses = activityManager.runningAppProcesses ?: return false

      // Check if current activity is a background activity.
      val json = ReactNativeFirebaseJSON.getSharedInstance()
      if (json.contains("android_background_activity_names")) {
        val backgroundActivities = json.getArrayValue("android_background_activity_names")

        if (backgroundActivities.size != 0) {
          var currentActivity = ""
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val taskInfo = activityManager.appTasks
            if (taskInfo.size > 0) {
              val task = taskInfo[0].taskInfo
              currentActivity =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                  if (task.baseActivity != null) platform(task.baseActivity).shortClassName else ""
                } else {
                  if (task.origActivity != null) {
                    platform(task.origActivity).shortClassName
                  } else {
                    platform(task.baseIntent.component).shortClassName
                  }
                }
            }
          } else {
            val taskInfo = activityManager.getRunningTasks(1)
            if (taskInfo.size > 0) {
              currentActivity = platform(taskInfo[0].topActivity).shortClassName
            }
          }

          if (currentActivity != "" && backgroundActivities.contains(currentActivity)) {
            return false
          }
        }
      }

      val packageName = sourceContext.packageName
      for (appProcess in appProcesses) {
        if (
          appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
          appProcess.processName.equals(packageName)
        ) {
          val reactContext: ReactContext

          try {
            reactContext = sourceContext as ReactContext
          } catch (_: ClassCastException) {
            // Not react context so default to true.
            return true
          }

          return reactContext.lifecycleState == LifecycleState.RESUMED
        }
      }

      return false
    }

    @SuppressLint("DiscouragedApi")
    @JvmStatic
    fun getResId(
      ctx: Context?,
      resName: String?,
    ): Int {
      val sourceContext: Context = platform(ctx)
      val resourceId =
        sourceContext.resources.getIdentifier(resName, "string", sourceContext.packageName)

      if (resourceId == 0) {
        Log.e(TAG, "resource $resName could not be found")
      }

      return resourceId
    }

    /**
     * Checks for dev support availability - so we can ignore in release builds for example.
     *
     * @return Boolean
     */
    @JvmStatic
    fun reactNativeHasDevSupport(): java.lang.Boolean = hasPackageClass(RN_DEVSUPPORT_PACKAGE, RN_DEVSUPPORT_CLASS)

    /**
     * Is the build platform Expo?
     *
     * @return Boolean
     */
    @JvmStatic
    fun isExpo(): java.lang.Boolean = hasPackageClass(EXPO_CORE_PACKAGE, EXPO_REGISTRY_CLASS)

    /**
     * Is the build platform Flutter?
     *
     * @return Boolean
     */
    @JvmStatic
    fun isFlutter(): java.lang.Boolean = hasPackageClass(FLUTTER_CORE_PACKAGE, FLUTTER_REGISTRY_CLASS)

    /**
     * Is the build platform React Native?
     *
     * @return Boolean
     */
    @JvmStatic
    fun isReactNative(): java.lang.Boolean =
      (
        java.lang.Boolean.valueOf(
          !isExpo().booleanValue() &&
            hasPackageClass(REACT_NATIVE_CORE_PACKAGE, REACT_NATIVE_REGISTRY_CLASS).booleanValue(),
        ) as java.lang.Boolean
      )

    /**
     * Returns true/false if a class for a package exists in the app class bundle.
     *
     * @param packageName
     * @param className
     * @return
     */
    @Suppress("ReplaceStringBuilderWithString")
    @JvmStatic
    fun hasPackageClass(
      packageName: String?,
      className: String?,
    ): java.lang.Boolean {
      // ProGuard is surprisingly smart in this case and will keep a class if it detects a call to
      // Class.forName() with a static string. Generate a quasi-dynamic string to confuse it.
      val fullName =
        java.lang
          .StringBuilder(platform(packageName))
          .append(".")
          .append(className)
          .toString()

      return try {
        Class.forName(fullName)
        java.lang.Boolean.TRUE as java.lang.Boolean
      } catch (_: Exception) {
        java.lang.Boolean.FALSE as java.lang.Boolean
      }
    }

    @Throws(JSONException::class)
    @JvmStatic
    fun jsonObjectToWritableMap(jsonObject: JSONObject?): WritableMap {
      val source: JSONObject = platform(jsonObject)
      val iterator = source.keys()
      val writableMap = Arguments.createMap()

      while (iterator.hasNext()) {
        val key = iterator.next()
        val value = source.get(key)
        when {
          value is Float || value is Double -> writableMap.putDouble(key, source.getDouble(key))
          value is Number -> writableMap.putInt(key, source.getInt(key))
          value is String -> writableMap.putString(key, source.getString(key))
          value is JSONObject -> writableMap.putMap(key, jsonObjectToWritableMap(source.getJSONObject(key)))
          value is JSONArray -> writableMap.putArray(key, jsonArrayToWritableArray(source.getJSONArray(key)))
          value === JSONObject.NULL -> writableMap.putNull(key)
        }
      }

      return writableMap
    }

    @Throws(JSONException::class)
    @JvmStatic
    fun jsonArrayToWritableArray(jsonArray: JSONArray?): WritableArray {
      val source: JSONArray = platform(jsonArray)
      val writableArray = Arguments.createArray()

      for (index in 0 until source.length()) {
        val value = source.get(index)
        when {
          value is Float || value is Double -> writableArray.pushDouble(source.getDouble(index))
          value is Number -> writableArray.pushInt(source.getInt(index))
          value is String -> writableArray.pushString(source.getString(index))
          value is JSONObject -> writableArray.pushMap(jsonObjectToWritableMap(source.getJSONObject(index)))
          value is JSONArray -> writableArray.pushArray(jsonArrayToWritableArray(source.getJSONArray(index)))
          value === JSONObject.NULL -> writableArray.pushNull()
        }
      }
      return writableArray
    }

    @JvmStatic
    fun mapToWritableMap(value: Map<String, @JvmSuppressWildcards Any?>?): WritableMap {
      val source: Map<String, @JvmSuppressWildcards Any?> = platform(value)
      val writableMap = Arguments.createMap()

      for ((key, entryValue) in source) {
        mapPutValue(key, entryValue, writableMap)
      }

      return writableMap
    }

    private fun listToWritableArray(objects: List<Any?>?): WritableArray {
      val source: List<Any?> = platform(objects)
      val writableArray = Arguments.createArray()
      for (value in source) {
        arrayPushValue(value, writableArray)
      }
      return writableArray
    }

    @Suppress("UNCHECKED_CAST")
    @JvmStatic
    fun arrayPushValue(
      @Nullable value: Any?,
      array: WritableArray?,
    ) {
      val target: WritableArray = platform(array)
      if (value == null || value === JSONObject.NULL) {
        target.pushNull()
        return
      }

      val type = value.javaClass.name
      when (type) {
        "java.lang.Boolean" -> target.pushBoolean(value as Boolean)
        "java.lang.Long" -> target.pushDouble((value as Long).toDouble())
        "java.lang.Float" -> target.pushDouble((value as Float).toDouble())
        "java.lang.Double" -> target.pushDouble(value as Double)
        "java.lang.Integer" -> target.pushInt(value as Int)
        "java.lang.String" -> target.pushString(value as String)
        else -> {
          if (List::class.java.isAssignableFrom(value.javaClass)) {
            target.pushArray(listToWritableArray(value as List<Any?>))
          } else if (Map::class.java.isAssignableFrom(value.javaClass)) {
            target.pushMap(mapToWritableMap(value as Map<String, Any?>))
          } else {
            Log.d(TAG, "utils:arrayPushValue:unknownType:$type")
            target.pushNull()
          }
        }
      }
    }

    @Suppress("UNCHECKED_CAST")
    @JvmStatic
    fun mapPutValue(
      key: String?,
      @Nullable value: Any?,
      map: WritableMap?,
    ) {
      val target: WritableMap = platform(map)
      val targetKey: String = platform(key)
      if (value == null || value === JSONObject.NULL) {
        target.putNull(targetKey)
        return
      }

      val type = value.javaClass.name
      when (type) {
        "java.lang.Boolean" -> target.putBoolean(targetKey, value as Boolean)
        "java.lang.Long" -> target.putDouble(targetKey, (value as Long).toDouble())
        "java.lang.Float" -> target.putDouble(targetKey, (value as Float).toDouble())
        "java.lang.Double" -> target.putDouble(targetKey, value as Double)
        "java.lang.Integer" -> target.putInt(targetKey, value as Int)
        "java.lang.String" -> target.putString(targetKey, value as String)
        else -> {
          if (List::class.java.isAssignableFrom(value.javaClass)) {
            target.putArray(targetKey, listToWritableArray(value as List<Any?>))
          } else if (Map::class.java.isAssignableFrom(value.javaClass)) {
            target.putMap(targetKey, mapToWritableMap(value as Map<String, Any?>))
          } else {
            Log.d(TAG, "utils:mapPutValue:unknownType:$type")
            target.putNull(targetKey)
          }
        }
      }
    }

    /**
     * Convert a ReadableMap to a WritableMap for the purposes of re-sending back to JS.
     *
     * @param map ReadableMap
     * @return WritableMap
     */
    @JvmStatic
    fun readableMapToWritableMap(map: ReadableMap?): WritableMap {
      val writableMap = Arguments.createMap()
      writableMap.merge(platform(map))
      return writableMap
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T> platform(value: T?): T = value as T
  }
}
