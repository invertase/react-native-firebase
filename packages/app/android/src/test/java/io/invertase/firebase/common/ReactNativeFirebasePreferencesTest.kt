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

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.invertase.firebase.app.ReactNativeFirebaseApp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoMoreInteractions
import org.mockito.Mockito.`when`
import java.lang.reflect.Modifier
import java.util.LinkedHashMap

/** Plain JUnit4 + Mockito coverage for the preferences bridge (AndroidTest-AD-1). */
class ReactNativeFirebasePreferencesTest {
  @Test
  fun javaVisibleApiPreservesConstructorSingletonAndExactMethodTypes() {
    val preferencesClass = ReactNativeFirebasePreferences::class.java
    val constructor = preferencesClass.getConstructor()
    val sharedInstanceMethod = preferencesClass.getMethod("getSharedInstance")

    assertTrue(Modifier.isPublic(constructor.modifiers))
    assertFalse(Modifier.isFinal(preferencesClass.modifiers))
    assertTrue(Modifier.isStatic(sharedInstanceMethod.modifiers))
    assertEquals(preferencesClass, sharedInstanceMethod.returnType)
    assertSame(
      ReactNativeFirebasePreferences.getSharedInstance(),
      ReactNativeFirebasePreferences.getSharedInstance(),
    )
    assertEquals(
      Boolean::class.javaPrimitiveType,
      preferencesClass.getMethod("contains", String::class.java).returnType,
    )
    assertEquals(
      Void.TYPE,
      preferencesClass
        .getMethod("setBooleanValue", String::class.java, Boolean::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Boolean::class.javaPrimitiveType,
      preferencesClass
        .getMethod("getBooleanValue", String::class.java, Boolean::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Void.TYPE,
      preferencesClass
        .getMethod("setIntValue", String::class.java, Int::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Int::class.javaPrimitiveType,
      preferencesClass
        .getMethod("getIntValue", String::class.java, Int::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Void.TYPE,
      preferencesClass
        .getMethod("setLongValue", String::class.java, Long::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Long::class.javaPrimitiveType,
      preferencesClass
        .getMethod("getLongValue", String::class.java, Long::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      Void.TYPE,
      preferencesClass
        .getMethod("setStringValue", String::class.java, String::class.java)
        .returnType,
    )
    assertEquals(
      String::class.java,
      preferencesClass
        .getMethod("getStringValue", String::class.java, String::class.java)
        .returnType,
    )
    assertEquals(WritableMap::class.java, preferencesClass.getMethod("getAll").returnType)
    assertEquals(Void.TYPE, preferencesClass.getMethod("clearAll").returnType)
    preferencesClass.declaredMethods
      .filterNot { Modifier.isStatic(it.modifiers) || Modifier.isPrivate(it.modifiers) }
      .forEach { method -> assertFalse("${method.name} must remain overridable", Modifier.isFinal(method.modifiers)) }
  }

  @Test
  fun lazyPreferencesUseApplicationContextFileAndModeOnce() {
    val preferences = mock(SharedPreferences::class.java)
    val applicationContext = mock(Context::class.java)
    `when`(
      applicationContext.getSharedPreferences("io.invertase.firebase", Context.MODE_PRIVATE),
    ).thenReturn(preferences)
    `when`(preferences.contains("present")).thenReturn(true)

    val previous: Context? = ReactNativeFirebaseApp.getApplicationContext()
    mockStatic(Log::class.java).use {
      ReactNativeFirebaseApp.setApplicationContext(applicationContext)
    }
    try {
      val subject = ReactNativeFirebasePreferences()

      assertTrue(subject.contains("present"))
      assertTrue(subject.contains("present"))

      verify(applicationContext, times(1))
        .getSharedPreferences("io.invertase.firebase", Context.MODE_PRIVATE)
      verify(preferences, times(2)).contains("present")
    } finally {
      mockStatic(Log::class.java).use {
        ReactNativeFirebaseApp.setApplicationContext(previous)
      }
    }
  }

  @Test
  fun scalarGettersDelegateAndReturnStoredValues() {
    val preferences = mock(SharedPreferences::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.contains("present")).thenReturn(true)
    `when`(preferences.getBoolean("boolean", false)).thenReturn(true)
    `when`(preferences.getInt("integer", 0)).thenReturn(42)
    `when`(preferences.getLong("long", 0L)).thenReturn(4_294_967_296L)
    `when`(preferences.getString("string", "fallback")).thenReturn("value")

    assertTrue(subject.contains("present"))
    assertTrue(subject.getBooleanValue("boolean", false))
    assertEquals(42, subject.getIntValue("integer", 0))
    assertEquals(4_294_967_296L, subject.getLongValue("long", 0L))
    assertEquals("value", subject.getStringValue("string", "fallback"))
  }

  @Test
  fun scalarSettersApplyAsynchronously() {
    val preferences = mock(SharedPreferences::class.java)
    val editor = mock(SharedPreferences.Editor::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.edit()).thenReturn(editor)
    `when`(editor.putBoolean("boolean", true)).thenReturn(editor)
    `when`(editor.putInt("integer", 42)).thenReturn(editor)
    `when`(editor.putLong("long", 4_294_967_296L)).thenReturn(editor)
    `when`(editor.putString("string", "value")).thenReturn(editor)

    subject.setBooleanValue("boolean", true)
    subject.setIntValue("integer", 42)
    subject.setLongValue("long", 4_294_967_296L)
    subject.setStringValue("string", "value")

    verify(editor).putBoolean("boolean", true)
    verify(editor).putInt("integer", 42)
    verify(editor).putLong("long", 4_294_967_296L)
    verify(editor).putString("string", "value")
    verify(editor, times(4)).apply()
    verifyNoMoreInteractions(editor)
  }

  @Test
  fun getAllConvertsEveryEntryThroughSharedUtils() {
    val preferences = mock(SharedPreferences::class.java)
    val writableMap = mock(WritableMap::class.java)
    val values =
      LinkedHashMap<String, Any?>().apply {
        put("boolean", true)
        put("integer", 42)
        put("long", 4_294_967_296L)
        put("string", "value")
        put("null", null)
      }
    val subject = subjectWith(preferences)
    `when`(preferences.all).thenReturn(values)

    mockStatic(Arguments::class.java).use { arguments ->
      mockStatic(SharedUtils::class.java).use { sharedUtils ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        assertSame(writableMap, subject.getAll())

        values.forEach { (key, value) ->
          sharedUtils.verify { SharedUtils.mapPutValue(key, value, writableMap) }
        }
      }
    }
  }

  @Test
  fun getAllReturnsCreatedMapWhenPreferencesAreEmpty() {
    val preferences = mock(SharedPreferences::class.java)
    val writableMap = mock(WritableMap::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.all).thenReturn(emptyMap())

    mockStatic(Arguments::class.java).use { arguments ->
      mockStatic(SharedUtils::class.java).use { sharedUtils ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        assertSame(writableMap, subject.getAll())

        sharedUtils.verifyNoInteractions()
      }
    }
  }

  @Test
  fun clearAllClearsAndAppliesAsynchronously() {
    val preferences = mock(SharedPreferences::class.java)
    val editor = mock(SharedPreferences.Editor::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.edit()).thenReturn(editor)
    `when`(editor.clear()).thenReturn(editor)

    subject.clearAll()

    verify(editor).clear()
    verify(editor).apply()
    verifyNoMoreInteractions(editor)
    verify(preferences).edit()
  }

  @Test
  fun containsReturnsUnderlyingFalseValue() {
    val preferences = mock(SharedPreferences::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.contains("missing")).thenReturn(false)

    assertFalse(subject.contains("missing"))
  }

  private fun subjectWith(preferences: SharedPreferences): ReactNativeFirebasePreferences {
    val subject = ReactNativeFirebasePreferences()
    val field = ReactNativeFirebasePreferences::class.java.getDeclaredField("preferences")
    field.isAccessible = true
    field.set(subject, preferences)
    return subject
  }
}
