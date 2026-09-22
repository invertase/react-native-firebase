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

import android.app.ActivityManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.res.Resources
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
import org.junit.After
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.`when`
import org.robolectric.RobolectricTestRunner
import org.robolectric.util.ReflectionHelpers
import java.io.File
import java.util.Date

@RunWith(RobolectricTestRunner::class)
class SharedUtilsTest {
  private lateinit var json: ReactNativeFirebaseJSON
  private lateinit var jsonObjectField: java.lang.reflect.Field
  private var originalJsonObject: Any? = null

  @Before
  fun setUp() {
    json = ReactNativeFirebaseJSON.getSharedInstance()
    jsonObjectField = ReactNativeFirebaseJSON::class.java.getDeclaredField("jsonObject")
    jsonObjectField.isAccessible = true
    originalJsonObject = jsonObjectField.get(json)
    jsonObjectField.set(json, JSONObject())
  }

  @After
  fun tearDown() {
    jsonObjectField.set(json, originalJsonObject)
  }

  @Test
  fun geometryConversionsPreserveEmptyCoordinatesAndNullElements() {
    assertArrayEquals(intArrayOf(), SharedUtils.rectToIntArray(null))
    assertArrayEquals(intArrayOf(), SharedUtils.rectToIntArray(Rect(0, 0, 0, 0)))
    assertArrayEquals(intArrayOf(1, 2, 4, 8), SharedUtils.rectToIntArray(Rect(1, 2, 4, 8)))
    assertArrayEquals(intArrayOf(), SharedUtils.pointToIntArray(null))
    assertArrayEquals(intArrayOf(-3, 7), SharedUtils.pointToIntArray(Point(-3, 7)))

    assertTrue(SharedUtils.pointsToIntsList(null).isEmpty())
    val converted = SharedUtils.pointsToIntsList(arrayOf(Point(1, 2), null, Point(3, 4)))
    assertArrayEquals(intArrayOf(1, 2), converted[0])
    assertArrayEquals(intArrayOf(), converted[1])
    assertArrayEquals(intArrayOf(3, 4), converted[2])
  }

  @Test
  fun uriConversionPreservesSchemesAndDefaultsPlainPathsToFiles() {
    assertEquals("https", SharedUtils.getUri("https://example.test/path").scheme)
    assertEquals("content", SharedUtils.getUri("content://authority/path").scheme)

    val file = SharedUtils.getUri("/tmp/file name.txt")
    assertEquals("file", file.scheme)
    assertEquals("/tmp/file name.txt", file.path)
    assertThrows(NullPointerException::class.java) { SharedUtils.getUri(null) }
  }

  @Test
  fun uriConversionTreatsAnExplicitEmptySchemeAsAFile() {
    val parsed = mock(Uri::class.java)
    val fileUri = mock(Uri::class.java)
    `when`(parsed.scheme).thenReturn("")
    mockStatic(Uri::class.java).use { uri ->
      uri.`when`<Uri> { Uri.parse("empty") }.thenReturn(parsed)
      uri.`when`<Uri> { Uri.fromFile(File("empty")) }.thenReturn(fileUri)

      assertSame(fileUri, SharedUtils.getUri("empty"))
    }
  }

  @Test
  fun exceptionMapPreservesNullableMessageAndKeyOrder() {
    val writableMap = mock(WritableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

      assertSame(writableMap, SharedUtils.getExceptionMap(Exception()))

      val order = inOrder(writableMap)
      order.verify(writableMap).putString("code", "unknown")
      order.verify(writableMap).putString("nativeErrorCode", "unknown")
      order.verify(writableMap).putString("message", null)
      order.verify(writableMap).putString("nativeErrorMessage", null)
    }
  }

  @Test
  fun utcFormattingPreservesSecondConversionAndLongOverflow() {
    assertEquals("1970-01-01T00:00:00Z", SharedUtils.timestampToUTC(0))
    assertEquals("1969-12-31T23:59:59Z", SharedUtils.timestampToUTC(Long.MAX_VALUE))
    assertEquals(
      "2000-01-01T00:00:00Z",
      SharedUtils.timestampToUTC(Date(946_684_800_000L).time / 1000),
    )
  }

  @Test
  fun sendEventEmitsBodyOrLogsMissingContext() {
    val context = mock(ReactContext::class.java)
    val emitter = mock(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    val body = Any()
    `when`(
      context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java),
    ).thenReturn(emitter)

    SharedUtils.sendEvent(context, "event", body)

    verify(emitter).emit("event", body)

    mockStatic(Log::class.java).use { log ->
      SharedUtils.sendEvent(null, "event", body)
      log.verify { Log.d("Utils", "Missing context - cannot send event!") }
    }
  }

  @Test
  fun foregroundReturnsFalseWhenManagerOrProcessesAreMissing() {
    val context = mock(Context::class.java)
    `when`(context.getSystemService(Context.ACTIVITY_SERVICE)).thenReturn(null)
    assertFalse(SharedUtils.isAppInForeground(context))

    val manager = mock(ActivityManager::class.java)
    `when`(context.getSystemService(Context.ACTIVITY_SERVICE)).thenReturn(manager)
    `when`(manager.runningAppProcesses).thenReturn(null)
    assertFalse(SharedUtils.isAppInForeground(context))
  }

  @Test
  fun foregroundFiltersProcessesAndFallsBackForNonReactContexts() {
    val manager = mock(ActivityManager::class.java)
    val context = contextWith(manager, "app.package")
    val background = process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_BACKGROUND)
    val other = process("other.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)
    `when`(manager.runningAppProcesses).thenReturn(listOf(background, other))

    assertFalse(SharedUtils.isAppInForeground(context))

    `when`(manager.runningAppProcesses)
      .thenReturn(
        listOf(process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)),
      )
    assertTrue(SharedUtils.isAppInForeground(context))
  }

  @Test
  fun foregroundPreservesNullProcessNameFailureTiming() {
    val manager = mock(ActivityManager::class.java)
    val context = contextWith(manager, "app.package")
    val process =
      ActivityManager.RunningAppProcessInfo().apply {
        processName = null
        importance = ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
      }
    `when`(manager.runningAppProcesses).thenReturn(listOf(process))

    assertThrows(NullPointerException::class.java) {
      SharedUtils.isAppInForeground(context)
    }
  }

  @Test
  fun foregroundSkipsTaskLookupForConfiguredEmptyBackgroundList() {
    configureBackgroundActivities()
    val manager = mock(ActivityManager::class.java)
    val context = contextWith(manager, "app.package")
    `when`(manager.runningAppProcesses)
      .thenReturn(
        listOf(process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)),
      )

    assertTrue(SharedUtils.isAppInForeground(context))
    verify(manager, never()).appTasks
  }

  @Test
  fun foregroundUsesReactLifecycleForMatchingForegroundProcess() {
    val manager = mock(ActivityManager::class.java)
    val context = mock(ReactContext::class.java)
    `when`(context.getSystemService(Context.ACTIVITY_SERVICE)).thenReturn(manager)
    `when`(context.packageName).thenReturn("app.package")
    `when`(manager.runningAppProcesses)
      .thenReturn(
        listOf(process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)),
      )
    `when`(context.lifecycleState).thenReturn(LifecycleState.RESUMED, LifecycleState.BEFORE_CREATE)

    assertTrue(SharedUtils.isAppInForeground(context))
    assertFalse(SharedUtils.isAppInForeground(context))
  }

  @Test
  fun foregroundSdk23UsesBaseActivityAndHandlesMissingTasksAndBaseActivity() {
    withSdk(23) {
      configureBackgroundActivities(".Background")
      val manager = mock(ActivityManager::class.java)
      val context = contextWith(manager, "app.package")
      val foreground = process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)
      `when`(manager.runningAppProcesses).thenReturn(listOf(foreground))
      `when`(manager.appTasks).thenReturn(emptyList())

      assertTrue(SharedUtils.isAppInForeground(context))

      val task = ActivityManager.RecentTaskInfo()
      val appTask = mock(ActivityManager.AppTask::class.java)
      `when`(appTask.taskInfo).thenReturn(task)
      `when`(manager.appTasks).thenReturn(listOf(appTask))

      assertTrue(SharedUtils.isAppInForeground(context))

      task.baseActivity = ComponentName("app.package", "app.package.Foreground")
      assertTrue(SharedUtils.isAppInForeground(context))

      task.baseActivity = ComponentName("app.package", "app.package.Background")
      assertFalse(SharedUtils.isAppInForeground(context))
    }
  }

  @Test
  fun foregroundSdk21UsesOrigActivityThenBaseIntentComponent() {
    withSdk(21) {
      configureBackgroundActivities(".Background")
      val manager = mock(ActivityManager::class.java)
      val context = contextWith(manager, "app.package")
      `when`(manager.runningAppProcesses)
        .thenReturn(
          listOf(process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)),
        )
      val task = ActivityManager.RecentTaskInfo()
      val appTask = mock(ActivityManager.AppTask::class.java)
      `when`(appTask.taskInfo).thenReturn(task)
      `when`(manager.appTasks).thenReturn(listOf(appTask))

      task.origActivity = ComponentName("app.package", "app.package.Background")
      assertFalse(SharedUtils.isAppInForeground(context))

      task.origActivity = null
      task.baseIntent = Intent().setComponent(ComponentName("app.package", "app.package.Background"))
      assertFalse(SharedUtils.isAppInForeground(context))
    }
  }

  @Test
  fun foregroundPre21UsesDeprecatedRunningTasksBranch() {
    withSdk(19) {
      configureBackgroundActivities(".Background")
      val manager = mock(ActivityManager::class.java)
      val context = contextWith(manager, "app.package")
      `when`(manager.runningAppProcesses)
        .thenReturn(
          listOf(process("app.package", ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND)),
        )
      `when`(manager.getRunningTasks(1)).thenReturn(emptyList())

      assertTrue(SharedUtils.isAppInForeground(context))

      val task = ActivityManager.RunningTaskInfo()
      task.topActivity = ComponentName("app.package", "app.package.Background")
      `when`(manager.getRunningTasks(1)).thenReturn(listOf(task))

      assertFalse(SharedUtils.isAppInForeground(context))
      verify(manager, never()).appTasks
    }
  }

  @Test
  fun resourceLookupReturnsIdentifierAndLogsMissingNames() {
    val context = mock(Context::class.java)
    val resources = mock(Resources::class.java)
    `when`(context.resources).thenReturn(resources)
    `when`(context.packageName).thenReturn("app.package")
    `when`(resources.getIdentifier("present", "string", "app.package")).thenReturn(42)
    `when`(resources.getIdentifier("missing", "string", "app.package")).thenReturn(0)

    assertEquals(42, SharedUtils.getResId(context, "present"))

    mockStatic(Log::class.java).use { log ->
      assertEquals(0, SharedUtils.getResId(context, "missing"))
      log.verify { Log.e("Utils", "resource missing could not be found") }
    }
  }

  @Test
  fun dynamicClassLookupFindsClassesAndHandlesFailures() {
    assertTrue(SharedUtils.hasPackageClass("java.lang", "String").booleanValue())
    assertFalse(SharedUtils.hasPackageClass("missing.package", "Missing").booleanValue())
    assertFalse(SharedUtils.hasPackageClass("java.lang", null).booleanValue())

    assertFalse(SharedUtils.reactNativeHasDevSupport().booleanValue())
    assertTrue(SharedUtils.isExpo().booleanValue())
    assertFalse(SharedUtils.isFlutter().booleanValue())
    assertFalse(SharedUtils.isReactNative().booleanValue())
  }

  @Test
  fun jsonObjectConversionRecursesAndOmitsUnknownValues() {
    val writableMap = mock(WritableMap::class.java)
    val nestedMap = mock(WritableMap::class.java)
    val writableArray = mock(WritableArray::class.java)
    val nestedObject = JSONObject().put("nested", "value")
    val nestedArray = JSONArray().put(7)
    val source =
      JSONObject()
        .put("float", 1.25)
        .put("integer", 3)
        .put("string", "text")
        .put("object", nestedObject)
        .put("array", nestedArray)
        .put("null", JSONObject.NULL)
        .put("unknown", true)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap, nestedMap)
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(writableArray)

      assertSame(writableMap, SharedUtils.jsonObjectToWritableMap(source))

      verify(writableMap).putDouble("float", 1.25)
      verify(writableMap).putInt("integer", 3)
      verify(writableMap).putString("string", "text")
      verify(writableMap).putMap("object", nestedMap)
      verify(writableMap).putArray("array", writableArray)
      verify(writableMap).putNull("null")
      verify(writableMap, never()).putNull("unknown")
      verify(nestedMap).putString("nested", "value")
      verify(writableArray).pushInt(7)
    }
  }

  @Test
  fun jsonObjectConversionPropagatesJsonExceptions() {
    val source = mock(JSONObject::class.java)
    `when`(source.keys()).thenReturn(listOf("bad").iterator())
    `when`(source.get("bad")).thenThrow(JSONException("bad"))

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(mock(WritableMap::class.java))

      assertThrows(JSONException::class.java) {
        SharedUtils.jsonObjectToWritableMap(source)
      }
    }
  }

  @Test
  fun jsonObjectConversionWritesNothingForAnUnknownOnlyValue() {
    val source = mock(JSONObject::class.java)
    val writableMap = mock(WritableMap::class.java)
    `when`(source.keys()).thenReturn(listOf("unknown").iterator())
    `when`(source.get("unknown")).thenReturn(true)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

      assertSame(writableMap, SharedUtils.jsonObjectToWritableMap(source))
      verifyNoInteractions(writableMap)
    }
  }

  @Test
  fun jsonObjectConversionPreservesFloatDispatch() {
    val source = mock(JSONObject::class.java)
    val writableMap = mock(WritableMap::class.java)
    `when`(source.keys()).thenReturn(listOf("float").iterator())
    `when`(source.get("float")).thenReturn(1.25F)
    `when`(source.getDouble("float")).thenReturn(1.25)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

      SharedUtils.jsonObjectToWritableMap(source)

      verify(writableMap).putDouble("float", 1.25)
    }
  }

  @Test
  fun jsonArrayConversionRecursesAndOmitsUnknownValues() {
    val writableArray = mock(WritableArray::class.java)
    val nestedArray = mock(WritableArray::class.java)
    val writableMap = mock(WritableMap::class.java)
    val source =
      JSONArray()
        .put(1.5)
        .put(2)
        .put("text")
        .put(JSONObject().put("nested", 4))
        .put(JSONArray().put("inner"))
        .put(JSONObject.NULL)
        .put(true)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(writableArray, nestedArray)
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

      assertSame(writableArray, SharedUtils.jsonArrayToWritableArray(source))

      verify(writableArray).pushDouble(1.5)
      verify(writableArray).pushInt(2)
      verify(writableArray).pushString("text")
      verify(writableArray).pushMap(writableMap)
      verify(writableArray).pushArray(nestedArray)
      verify(writableArray).pushNull()
      verify(writableMap).putInt("nested", 4)
      verify(nestedArray).pushString("inner")
    }
  }

  @Test
  fun jsonArrayConversionPropagatesJsonExceptions() {
    val source = mock(JSONArray::class.java)
    `when`(source.length()).thenReturn(1)
    `when`(source.get(0)).thenThrow(JSONException("bad"))

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(mock(WritableArray::class.java))

      assertThrows(JSONException::class.java) {
        SharedUtils.jsonArrayToWritableArray(source)
      }
    }
  }

  @Test
  fun jsonArrayConversionWritesNothingForAnUnknownOnlyValue() {
    val source = mock(JSONArray::class.java)
    val writableArray = mock(WritableArray::class.java)
    `when`(source.length()).thenReturn(1)
    `when`(source.get(0)).thenReturn(true)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(writableArray)

      assertSame(writableArray, SharedUtils.jsonArrayToWritableArray(source))
      verifyNoInteractions(writableArray)
    }
  }

  @Test
  fun jsonArrayConversionPreservesFloatDispatch() {
    val source = mock(JSONArray::class.java)
    val writableArray = mock(WritableArray::class.java)
    `when`(source.length()).thenReturn(1)
    `when`(source.get(0)).thenReturn(1.25F)
    `when`(source.getDouble(0)).thenReturn(1.25)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(writableArray)

      SharedUtils.jsonArrayToWritableArray(source)

      verify(writableArray).pushDouble(1.25)
    }
  }

  @Test
  fun arrayPushValuePreservesEverySupportedWrapperConversion() {
    val array = mock(WritableArray::class.java)

    SharedUtils.arrayPushValue(null, array)
    SharedUtils.arrayPushValue(JSONObject.NULL, array)
    SharedUtils.arrayPushValue(true, array)
    SharedUtils.arrayPushValue(Long.MAX_VALUE, array)
    SharedUtils.arrayPushValue(1.25F, array)
    SharedUtils.arrayPushValue(2.5, array)
    SharedUtils.arrayPushValue(7, array)
    SharedUtils.arrayPushValue("text", array)

    verify(array, org.mockito.Mockito.times(2)).pushNull()
    verify(array).pushBoolean(true)
    verify(array).pushDouble(Long.MAX_VALUE.toDouble())
    verify(array).pushDouble(1.25)
    verify(array).pushDouble(2.5)
    verify(array).pushInt(7)
    verify(array).pushString("text")
  }

  @Test
  fun arrayPushValueRecursesListsAndMapsAndNullsUnknownTypes() {
    val array = mock(WritableArray::class.java)
    val nestedArray = mock(WritableArray::class.java)
    val nestedMap = mock(WritableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(nestedArray)
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(nestedMap)

      SharedUtils.arrayPushValue(listOf("nested"), array)
      SharedUtils.arrayPushValue(linkedMapOf("key" to 3), array)
      SharedUtils.arrayPushValue(JSONObject(), array)
      SharedUtils.arrayPushValue(1.toShort(), array)

      verify(array).pushArray(nestedArray)
      verify(array).pushMap(nestedMap)
      verify(array, org.mockito.Mockito.times(2)).pushNull()
      verify(nestedArray).pushString("nested")
      verify(nestedMap).putInt("key", 3)
    }
  }

  @Test
  fun mapPutValuePreservesEverySupportedWrapperConversion() {
    val map = mock(WritableMap::class.java)

    SharedUtils.mapPutValue("null", null, map)
    SharedUtils.mapPutValue("jsonNull", JSONObject.NULL, map)
    SharedUtils.mapPutValue("boolean", false, map)
    SharedUtils.mapPutValue("long", Long.MAX_VALUE, map)
    SharedUtils.mapPutValue("float", 1.25F, map)
    SharedUtils.mapPutValue("double", 2.5, map)
    SharedUtils.mapPutValue("integer", 7, map)
    SharedUtils.mapPutValue("string", "text", map)

    verify(map).putNull("null")
    verify(map).putNull("jsonNull")
    verify(map).putBoolean("boolean", false)
    verify(map).putDouble("long", Long.MAX_VALUE.toDouble())
    verify(map).putDouble("float", 1.25)
    verify(map).putDouble("double", 2.5)
    verify(map).putInt("integer", 7)
    verify(map).putString("string", "text")
  }

  @Test
  fun mapPutValueRecursesListsAndMapsAndNullsUnknownTypes() {
    val map = mock(WritableMap::class.java)
    val nestedArray = mock(WritableArray::class.java)
    val nestedMap = mock(WritableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(nestedArray)
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(nestedMap)

      SharedUtils.mapPutValue("list", listOf(false), map)
      SharedUtils.mapPutValue("map", linkedMapOf("key" to "value"), map)
      SharedUtils.mapPutValue("json", JSONArray(), map)
      SharedUtils.mapPutValue("unknown", Any(), map)

      verify(map).putArray("list", nestedArray)
      verify(map).putMap("map", nestedMap)
      verify(map).putNull("json")
      verify(map).putNull("unknown")
      verify(nestedArray).pushBoolean(false)
      verify(nestedMap).putString("key", "value")
    }
  }

  @Test
  fun mapConversionAndReadableMapMergeUseCreatedMap() {
    val writableMap = mock(WritableMap::class.java)
    val mergedMap = mock(WritableMap::class.java)
    val readableMap = mock(ReadableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap, mergedMap)

      assertSame(
        writableMap,
        SharedUtils.mapToWritableMap(linkedMapOf("first" to true, "second" to null)),
      )
      assertSame(mergedMap, SharedUtils.readableMapToWritableMap(readableMap))

      verify(writableMap).putBoolean("first", true)
      verify(writableMap).putNull("second")
      verify(mergedMap).merge(readableMap)
    }
  }

  @Test
  fun nullRequiredInputsFailAtOriginalDereferenceOrCallSites() {
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(mock(WritableMap::class.java))
      arguments.`when`<WritableArray>(Arguments::createArray).thenReturn(mock(WritableArray::class.java))
      assertThrows(NullPointerException::class.java) { SharedUtils.getExceptionMap(null) }
      assertThrows(NullPointerException::class.java) { SharedUtils.jsonArrayToWritableArray(null) }
      assertThrows(NullPointerException::class.java) { SharedUtils.mapToWritableMap(null) }
    }
    assertThrows(NullPointerException::class.java) { SharedUtils.isAppInForeground(null) }
    assertThrows(NullPointerException::class.java) { SharedUtils.getResId(null, "name") }
    assertThrows(NullPointerException::class.java) { SharedUtils.jsonObjectToWritableMap(null) }
    assertThrows(NullPointerException::class.java) {
      SharedUtils.arrayPushValue("value", null)
    }
    assertThrows(NullPointerException::class.java) {
      SharedUtils.mapPutValue("key", "value", null)
    }
  }

  private fun contextWith(
    manager: ActivityManager,
    packageName: String,
  ): Context {
    val context = mock(Context::class.java)
    `when`(context.getSystemService(Context.ACTIVITY_SERVICE)).thenReturn(manager)
    `when`(context.packageName).thenReturn(packageName)
    return context
  }

  private fun process(
    processName: String,
    importance: Int,
  ): ActivityManager.RunningAppProcessInfo =
    ActivityManager.RunningAppProcessInfo().apply {
      this.processName = processName
      this.importance = importance
    }

  private fun configureBackgroundActivities(vararg names: String) {
    val array = JSONArray()
    names.forEach(array::put)
    jsonObjectField.set(
      json,
      JSONObject().put("android_background_activity_names", array),
    )
  }

  private fun withSdk(
    sdk: Int,
    block: () -> Unit,
  ) {
    val original = Build.VERSION.SDK_INT
    ReflectionHelpers.setStaticField(Build.VERSION::class.java, "SDK_INT", sdk)
    try {
      block()
    } finally {
      ReflectionHelpers.setStaticField(Build.VERSION::class.java, "SDK_INT", original)
    }
  }
}
