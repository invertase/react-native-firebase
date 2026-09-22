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

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.invertase.firebase.BuildConfig
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.`when`
import java.lang.reflect.Modifier
import java.util.ArrayList
import java.util.LinkedHashMap

/**
 * Plain JUnit4 + Mockito (AndroidTest-AD-1). JSONObject and JSONArray are mocked where Android's
 * host-side stubs would otherwise be involved.
 */
class ReactNativeFirebaseJSONTest {
  private lateinit var json: ReactNativeFirebaseJSON
  private lateinit var jsonObjectField: java.lang.reflect.Field
  private var originalJsonObject: Any? = null

  @Before
  fun setUp() {
    json = ReactNativeFirebaseJSON.getSharedInstance()
    jsonObjectField = ReactNativeFirebaseJSON::class.java.getDeclaredField("jsonObject")
    jsonObjectField.isAccessible = true
    originalJsonObject = jsonObjectField.get(json)
  }

  @After
  fun tearDown() {
    jsonObjectField.set(json, originalJsonObject)
  }

  @Test
  fun javaVisibleApi_preservesSingletonAndExactMethodTypes() {
    val jsonClass = ReactNativeFirebaseJSON::class.java
    val sharedInstanceMethod = jsonClass.getMethod("getSharedInstance")

    assertTrue(Modifier.isStatic(sharedInstanceMethod.modifiers))
    assertEquals(jsonClass, sharedInstanceMethod.returnType)
    assertSame(json, ReactNativeFirebaseJSON.getSharedInstance())
    assertEquals(Boolean::class.javaPrimitiveType, jsonClass.getMethod("contains", String::class.java).returnType)
    assertEquals(
      Boolean::class.javaPrimitiveType,
      jsonClass
        .getMethod("getBooleanValue", String::class.java, Boolean::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Int::class.javaPrimitiveType,
      jsonClass.getMethod("getIntValue", String::class.java, Int::class.javaPrimitiveType).returnType,
    )
    assertEquals(
      Long::class.javaPrimitiveType,
      jsonClass
        .getMethod("getLongValue", String::class.java, Long::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      String::class.java,
      jsonClass.getMethod("getStringValue", String::class.java, String::class.java).returnType,
    )
    assertEquals(ArrayList::class.java, jsonClass.getMethod("getArrayValue", String::class.java).returnType)
    assertEquals(String::class.java, jsonClass.getMethod("getRawJSON").returnType)
    assertEquals(WritableMap::class.java, jsonClass.getMethod("getAll").returnType)
  }

  @Test
  fun scalarAccessors_returnDefaultsWhenJsonObjectIsNull() {
    jsonObjectField.set(json, null)

    assertFalse(json.contains("missing"))
    assertTrue(json.getBooleanValue("missing", true))
    assertEquals(17, json.getIntValue("missing", 17))
    assertEquals(23L, json.getLongValue("missing", 23L))
    assertEquals("fallback", json.getStringValue("missing", "fallback"))
  }

  @Test
  fun scalarAccessors_delegateToJsonObject() {
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.has("present")).thenReturn(true)
    `when`(jsonObject.optBoolean("boolean", false)).thenReturn(true)
    `when`(jsonObject.optInt("integer", 0)).thenReturn(42)
    `when`(jsonObject.optLong("long", 0L)).thenReturn(4_294_967_296L)
    `when`(jsonObject.optString("string", "fallback")).thenReturn("value")
    jsonObjectField.set(json, jsonObject)

    assertTrue(json.contains("present"))
    assertTrue(json.getBooleanValue("boolean", false))
    assertEquals(42, json.getIntValue("integer", 0))
    assertEquals(4_294_967_296L, json.getLongValue("long", 0L))
    assertEquals("value", json.getStringValue("string", "fallback"))
  }

  @Test
  fun getArrayValue_returnsMutableEmptyArrayListWhenJsonObjectIsNull() {
    jsonObjectField.set(json, null)

    val result = json.getArrayValue("missing")
    result.add("later")

    assertEquals(arrayListOf("later"), result)
  }

  @Test
  fun getArrayValue_returnsMutableEmptyArrayListWhenValueIsNotAnArray() {
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.optJSONArray("missing")).thenReturn(null)
    jsonObjectField.set(json, jsonObject)

    val result = json.getArrayValue("missing")
    result.add("later")

    assertEquals(arrayListOf("later"), result)
  }

  @Test
  fun getArrayValue_preservesElementOrder() {
    val jsonObject = mock(JSONObject::class.java)
    val jsonArray = mock(JSONArray::class.java)
    `when`(jsonObject.optJSONArray("items")).thenReturn(jsonArray)
    `when`(jsonArray.length()).thenReturn(3)
    `when`(jsonArray.getString(0)).thenReturn("first")
    `when`(jsonArray.getString(1)).thenReturn("second")
    `when`(jsonArray.getString(2)).thenReturn("third")
    jsonObjectField.set(json, jsonObject)

    assertEquals(arrayListOf("first", "second", "third"), json.getArrayValue("items"))
  }

  @Test
  fun getArrayValue_returnsValuesCollectedBeforeJsonException() {
    val jsonObject = mock(JSONObject::class.java)
    val jsonArray = mock(JSONArray::class.java)
    `when`(jsonObject.optJSONArray("items")).thenReturn(jsonArray)
    `when`(jsonArray.length()).thenReturn(3)
    `when`(jsonArray.getString(0)).thenReturn("first")
    `when`(jsonArray.getString(1)).thenThrow(JSONException("malformed"))
    jsonObjectField.set(json, jsonObject)

    assertEquals(arrayListOf("first"), json.getArrayValue("items"))
  }

  @Test
  fun getRawJson_returnsGeneratedBuildConfigValue() {
    assertEquals(BuildConfig.FIREBASE_JSON_RAW, json.getRawJSON())
  }

  @Test
  fun getAllReturnsEmptyMapWhenJsonObjectIsNull() {
    val emptyMap = mock(WritableMap::class.java)
    jsonObjectField.set(json, null)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(emptyMap)

      assertSame(emptyMap, json.getAll())
      verifyNoInteractions(emptyMap)
    }
  }

  @Test
  fun getAllReturnsEmptyMapForEmptyJsonObject() {
    val emptyMap = mock(WritableMap::class.java)
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.keys()).thenReturn(emptyList<String>().iterator())
    jsonObjectField.set(json, jsonObject)

    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(emptyMap)

      assertSame(emptyMap, json.getAll())
      verifyNoInteractions(emptyMap)
    }
  }

  @Test
  fun getAllForwardsEverySupportedValueShapeToRecursiveBridgeConversion() {
    val writableMap = mock(WritableMap::class.java)
    val jsonObject = mock(JSONObject::class.java)
    val nestedObject = mock(JSONObject::class.java)
    val nestedArray = mock(JSONArray::class.java)
    val nestedList = listOf<Any>("nested")
    val nestedMap = LinkedHashMap<String, Any>().apply { put("nested", true) }
    val values =
      linkedMapOf<String, Any>(
        "boolean" to true,
        "integer" to 42,
        "long" to 4_294_967_296L,
        "float" to 1.5F,
        "double" to 2.5,
        "string" to "value",
        "jsonNull" to JSONObject.NULL,
        "jsonObject" to nestedObject,
        "jsonArray" to nestedArray,
        "list" to nestedList,
        "map" to nestedMap,
      )
    `when`(jsonObject.keys()).thenReturn(values.keys.iterator())
    values.forEach { (key, value) -> `when`(jsonObject.get(key)).thenReturn(value) }
    jsonObjectField.set(json, jsonObject)

    mockStatic(Arguments::class.java).use { arguments ->
      mockStatic(SharedUtils::class.java).use { sharedUtils ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        assertSame(writableMap, json.getAll())

        values.forEach { (key, value) ->
          sharedUtils.verify { SharedUtils.mapPutValue(key, value, writableMap) }
        }
      }
    }
  }

  @Test
  fun getAllPreservesKeyOrder() {
    val writableMap = mock(WritableMap::class.java)
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.keys()).thenReturn(listOf("first", "second").iterator())
    `when`(jsonObject.get("first")).thenReturn(1)
    `when`(jsonObject.get("second")).thenReturn(2)
    jsonObjectField.set(json, jsonObject)

    mockStatic(Arguments::class.java).use { arguments ->
      mockStatic(SharedUtils::class.java).use {
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        json.getAll()

        val order = inOrder(jsonObject)
        order.verify(jsonObject).get("first")
        order.verify(jsonObject).get("second")
      }
    }
  }

  @Test
  fun getAllSkipsJsonExceptionAndContinuesWithRemainingEntries() {
    val writableMap = mock(WritableMap::class.java)
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.keys()).thenReturn(listOf("bad", "good").iterator())
    `when`(jsonObject.get("bad")).thenThrow(JSONException("malformed"))
    `when`(jsonObject.get("good")).thenReturn(false)
    jsonObjectField.set(json, jsonObject)

    mockStatic(Arguments::class.java).use { arguments ->
      mockStatic(SharedUtils::class.java).use { sharedUtils ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        assertSame(writableMap, json.getAll())

        sharedUtils.verify { SharedUtils.mapPutValue("good", false, writableMap) }
      }
    }
  }
}
