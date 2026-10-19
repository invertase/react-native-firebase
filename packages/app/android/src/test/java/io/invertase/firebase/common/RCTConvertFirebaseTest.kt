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
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.robolectric.RobolectricTestRunner
import java.util.ArrayList
import java.util.HashMap

@org.junit.runner.RunWith(RobolectricTestRunner::class)
class RCTConvertFirebaseTest {
  private val touchedAuthDomains = mutableMapOf<String, String?>()

  @After
  fun tearDown() {
    touchedAuthDomains.forEach { (name, original) ->
      if (original == null) {
        NativeRNFBTurboApp.authDomains.remove(name)
      } else {
        NativeRNFBTurboApp.authDomains[name] = original
      }
    }
  }

  @Test
  fun firebaseAppToMap_returnsExactMutableStructureWithOptionalAuthDomain() {
    val firebaseApp = mock(FirebaseApp::class.java)
    val options = mock(FirebaseOptions::class.java)
    `when`(firebaseApp.name).thenReturn("secondary")
    `when`(firebaseApp.options).thenReturn(options)
    `when`(firebaseApp.isDataCollectionDefaultEnabled).thenReturn(false)
    `when`(options.apiKey).thenReturn("api-key")
    `when`(options.applicationId).thenReturn("app-id")
    `when`(options.projectId).thenReturn("project-id")
    `when`(options.databaseUrl).thenReturn("database-url")
    `when`(options.gaTrackingId).thenReturn("measurement-id")
    `when`(options.gcmSenderId).thenReturn("sender-id")
    `when`(options.storageBucket).thenReturn("storage-bucket")
    rememberAuthDomain("secondary")
    NativeRNFBTurboApp.authDomains["secondary"] = "auth.example"

    val result = RCTConvertFirebase.firebaseAppToMap(firebaseApp)

    assertTrue(result is HashMap)
    val appConfig = result["appConfig"] as Map<*, *>
    val convertedOptions = result["options"] as Map<*, *>
    assertTrue(appConfig is HashMap)
    assertTrue(convertedOptions is HashMap)
    assertEquals(
      mapOf("name" to "secondary", "automaticDataCollectionEnabled" to false),
      appConfig,
    )
    assertEquals(
      mapOf(
        "apiKey" to "api-key",
        "appId" to "app-id",
        "projectId" to "project-id",
        "databaseURL" to "database-url",
        "measurementId" to "measurement-id",
        "messagingSenderId" to "sender-id",
        "storageBucket" to "storage-bucket",
        "authDomain" to "auth.example",
      ),
      convertedOptions,
    )
    (result as MutableMap)["later"] = true
    (appConfig as MutableMap<String, Any>)["later"] = true
    (convertedOptions as MutableMap<String, Any>)["later"] = true
  }

  @Test
  fun firebaseAppToMap_omitsMissingAuthDomainAndWritableConversionUsesSameMap() {
    val firebaseApp = mock(FirebaseApp::class.java)
    val options = mock(FirebaseOptions::class.java)
    `when`(firebaseApp.name).thenReturn("[DEFAULT]")
    `when`(firebaseApp.options).thenReturn(options)
    rememberAuthDomain("[DEFAULT]")
    NativeRNFBTurboApp.authDomains.remove("[DEFAULT]")

    val converted = RCTConvertFirebase.firebaseAppToMap(firebaseApp)

    assertFalse((converted["options"] as Map<*, *>).containsKey("authDomain"))
    mockStatic(Arguments::class.java).use { arguments ->
      assertNull(RCTConvertFirebase.firebaseAppToWritableMap(firebaseApp))
      arguments.verify {
        Arguments.makeNativeMap(org.mockito.ArgumentMatchers.anyMap<String, Any?>())
      }
    }
  }

  @Test
  fun readableMapToFirebaseApp_buildsDefaultAppAndAppliesOptionalConfiguration() {
    val options = completeOptions("measurement-id")
    val appConfig = mock(ReadableMap::class.java)
    val context = mock(Context::class.java)
    val firebaseApp = mock(FirebaseApp::class.java)
    `when`(appConfig.getString("name")).thenReturn("[DEFAULT]")
    `when`(appConfig.hasKey("automaticDataCollectionEnabled")).thenReturn(true)
    `when`(appConfig.getBoolean("automaticDataCollectionEnabled")).thenReturn(false)
    `when`(appConfig.hasKey("automaticResourceManagement")).thenReturn(true)
    `when`(appConfig.getBoolean("automaticResourceManagement")).thenReturn(true)

    mockStatic(FirebaseApp::class.java).use { firebaseApps ->
      firebaseApps
        .`when`<FirebaseApp> {
          FirebaseApp.initializeApp(
            org.mockito.ArgumentMatchers.eq(context),
            org.mockito.ArgumentMatchers.any(FirebaseOptions::class.java),
          )
        }.thenReturn(firebaseApp)

      assertSame(firebaseApp, RCTConvertFirebase.readableMapToFirebaseApp(options, appConfig, context))

      val captor = ArgumentCaptor.forClass(FirebaseOptions::class.java)
      firebaseApps.verify { FirebaseApp.initializeApp(org.mockito.ArgumentMatchers.eq(context), captor.capture()) }
      assertOptions(captor.value, "measurement-id")
      verify(firebaseApp).setDataCollectionDefaultEnabled(false)
      verify(firebaseApp).setAutomaticResourceManagementEnabled(true)
    }
  }

  @Test
  fun readableMapToFirebaseApp_buildsNamedAppWithoutAbsentOptionalConfiguration() {
    val options = completeOptions(null)
    val appConfig = mock(ReadableMap::class.java)
    val context = mock(Context::class.java)
    val firebaseApp = mock(FirebaseApp::class.java)
    `when`(appConfig.getString("name")).thenReturn("secondary")

    mockStatic(FirebaseApp::class.java).use { firebaseApps ->
      firebaseApps
        .`when`<FirebaseApp> {
          FirebaseApp.initializeApp(
            org.mockito.ArgumentMatchers.eq(context),
            org.mockito.ArgumentMatchers.any(FirebaseOptions::class.java),
            org.mockito.ArgumentMatchers.eq("secondary"),
          )
        }.thenReturn(firebaseApp)

      assertSame(firebaseApp, RCTConvertFirebase.readableMapToFirebaseApp(options, appConfig, context))

      val captor = ArgumentCaptor.forClass(FirebaseOptions::class.java)
      firebaseApps.verify {
        FirebaseApp.initializeApp(
          org.mockito.ArgumentMatchers.eq(context),
          captor.capture(),
          org.mockito.ArgumentMatchers.eq("secondary"),
        )
      }
      assertOptions(captor.value, null)
      assertFalse(
        org.mockito.Mockito
          .mockingDetails(firebaseApp)
          .invocations
          .any { it.method.name == "setDataCollectionDefaultEnabled" },
      )
      verify(firebaseApp, never())
        .setAutomaticResourceManagementEnabled(org.mockito.ArgumentMatchers.anyBoolean())
    }
  }

  @Test
  fun mapPutValue_writesEveryScalarAndJsonNullAndReturnsTargetIdentity() {
    val map = mock(WritableMap::class.java)

    assertSame(map, RCTConvertFirebase.mapPutValue("null", null, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("boolean", true, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("long", 4_294_967_296L, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("float", 1.25F, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("double", 2.5, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("integer", 42, map))
    assertSame(map, RCTConvertFirebase.mapPutValue("string", "value", map))
    assertSame(map, RCTConvertFirebase.mapPutValue("jsonNull", JSONObject.NULL, map))

    verify(map).putNull("null")
    verify(map).putBoolean("boolean", true)
    verify(map).putDouble("long", 4_294_967_296.0)
    verify(map).putDouble("float", 1.25)
    verify(map).putDouble("double", 2.5)
    verify(map).putInt("integer", 42)
    verify(map).putString("string", "value")
    verify(map).putString("jsonNull", "null")
  }

  @Test
  fun mapPutValue_writesListsAndRecursiveMapsWithoutChangingInputs() {
    val map = mock(WritableMap::class.java)
    val childMap = mock(WritableMap::class.java)
    val list = arrayListOf<Any>("item")
    val nested = linkedMapOf<String, Any?>("boolean" to true, "null" to null)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(childMap)

      assertSame(map, RCTConvertFirebase.mapPutValue("list", list, map))
      assertSame(map, RCTConvertFirebase.mapPutValue("map", nested, map))
      arguments.verify { Arguments.makeNativeArray(list) }
    }

    verify(map).putArray("list", null)
    verify(childMap).putBoolean("boolean", true)
    verify(childMap).putNull("null")
    verify(map).putMap("map", childMap)
    assertEquals(arrayListOf<Any>("item"), list)
    assertEquals(linkedMapOf<String, Any?>("boolean" to true, "null" to null), nested)
  }

  @Test
  fun mapPutValue_logsUnknownTypeAndWritesNull() {
    val map = mock(WritableMap::class.java)
    val unknown = Any()

    mockStatic(Log::class.java).use { log ->
      assertSame(map, RCTConvertFirebase.mapPutValue("unknown", unknown, map))
      log.verify {
        Log.d(
          "RCTConvertFirebase",
          "utils:mapPutValue:unknownType:${unknown.javaClass.name}",
        )
      }
    }
    verify(map).putNull("unknown")
  }

  @Test
  fun readableDelegates_preserveReturnedMutableCollectionIdentity() {
    val readableMap = mock(ReadableMap::class.java)
    val writableMap = mock(WritableMap::class.java)
    val hashMap = HashMap<String, Any?>()
    val readableArray = mock(ReadableArray::class.java)
    val arrayList = ArrayList<Any?>()
    `when`(readableMap.toHashMap()).thenReturn(hashMap)
    `when`(readableArray.toArrayList()).thenReturn(arrayList)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)
      assertSame(writableMap, RCTConvertFirebase.readableMapToWritableMap(readableMap))
    }
    verify(writableMap).merge(readableMap)
    assertSame(hashMap, RCTConvertFirebase.toHashMap(readableMap))
    assertSame(arrayList, RCTConvertFirebase.toArrayList(readableArray))
    hashMap["later"] = true
    arrayList.add("later")
  }

  private fun completeOptions(measurementId: String?): ReadableMap {
    val options = mock(ReadableMap::class.java)
    val values =
      mapOf(
        "apiKey" to "api-key",
        "appId" to "app-id",
        "projectId" to "project-id",
        "databaseURL" to "database-url",
        "storageBucket" to "storage-bucket",
        "messagingSenderId" to "sender-id",
      )
    values.forEach { (key, value) -> `when`(options.getString(key)).thenReturn(value) }
    `when`(options.hasKey("measurementId")).thenReturn(measurementId != null)
    if (measurementId != null) {
      `when`(options.getString("measurementId")).thenReturn(measurementId)
    }
    return options
  }

  private fun assertOptions(
    options: FirebaseOptions,
    measurementId: String?,
  ) {
    assertEquals("api-key", options.apiKey)
    assertEquals("app-id", options.applicationId)
    assertEquals("project-id", options.projectId)
    assertEquals("database-url", options.databaseUrl)
    assertEquals(measurementId, options.gaTrackingId)
    assertEquals("storage-bucket", options.storageBucket)
    assertEquals("sender-id", options.gcmSenderId)
  }

  private fun rememberAuthDomain(name: String) {
    touchedAuthDomains.putIfAbsent(name, NativeRNFBTurboApp.authDomains[name])
  }
}
