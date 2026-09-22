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
import io.invertase.firebase.app.ReactNativeFirebaseApp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoMoreInteractions
import org.mockito.Mockito.`when`
import java.lang.reflect.Modifier

/** Plain JUnit4 + Mockito coverage for universal preferences (AndroidTest-AD-1). */
class UniversalFirebasePreferencesTest {
  @Test
  fun javaVisibleApiPreservesConstructorSingletonAndExactMethodTypes() {
    val preferencesClass = UniversalFirebasePreferences::class.java
    val constructor = preferencesClass.getConstructor()
    val sharedInstanceMethod = preferencesClass.getMethod("getSharedInstance")

    assertTrue(Modifier.isPublic(constructor.modifiers))
    assertFalse(Modifier.isFinal(preferencesClass.modifiers))
    assertTrue(Modifier.isStatic(sharedInstanceMethod.modifiers))
    assertEquals(preferencesClass, sharedInstanceMethod.returnType)
    assertSame(
      UniversalFirebasePreferences.getSharedInstance(),
      UniversalFirebasePreferences.getSharedInstance(),
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
    assertEquals(Void.TYPE, preferencesClass.getMethod("clearAll").returnType)
    assertEquals(
      SharedPreferences.Editor::class.java,
      preferencesClass.getMethod("remove", String::class.java).returnType,
    )
    preferencesClass.declaredMethods
      .filterNot { Modifier.isStatic(it.modifiers) || Modifier.isPrivate(it.modifiers) }
      .forEach { method ->
        assertFalse("${method.name} must remain overridable", Modifier.isFinal(method.modifiers))
      }
  }

  @Test
  fun lazyPreferencesUseApplicationContextFileAndModeOnce() {
    val preferences = mock(SharedPreferences::class.java)
    val applicationContext = mock(Context::class.java)
    `when`(
      applicationContext.getSharedPreferences("io.invertase.firebase", Context.MODE_PRIVATE),
    ).thenReturn(preferences)
    `when`(preferences.contains("present")).thenReturn(true)

    mockStatic(ReactNativeFirebaseApp::class.java).use { firebaseApp ->
      firebaseApp
        .`when`<Context>(ReactNativeFirebaseApp::getApplicationContext)
        .thenReturn(applicationContext)
      val subject = UniversalFirebasePreferences()

      assertTrue(subject.contains("present"))
      assertTrue(subject.contains("present"))

      firebaseApp.verify(ReactNativeFirebaseApp::getApplicationContext, times(1))
      verify(applicationContext, times(1))
        .getSharedPreferences("io.invertase.firebase", Context.MODE_PRIVATE)
      verify(preferences, times(2)).contains("present")
    }
  }

  @Test
  fun scalarGettersDelegateAndReturnStoredValues() {
    val preferences = mock(SharedPreferences::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.contains("present")).thenReturn(true)
    `when`(preferences.contains("missing")).thenReturn(false)
    `when`(preferences.getBoolean("boolean", false)).thenReturn(true)
    `when`(preferences.getInt("integer", 0)).thenReturn(42)
    `when`(preferences.getLong("long", 0L)).thenReturn(4_294_967_296L)
    `when`(preferences.getString("string", "fallback")).thenReturn("value")

    assertTrue(subject.contains("present"))
    assertFalse(subject.contains("missing"))
    assertTrue(subject.getBooleanValue("boolean", false))
    assertEquals(42, subject.getIntValue("integer", 0))
    assertEquals(4_294_967_296L, subject.getLongValue("long", 0L))
    assertEquals("value", subject.getStringValue("string", "fallback"))
  }

  @Test
  fun scalarSettersAndClearApplyAsynchronously() {
    val preferences = mock(SharedPreferences::class.java)
    val editor = mock(SharedPreferences.Editor::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.edit()).thenReturn(editor)
    `when`(editor.putBoolean("boolean", true)).thenReturn(editor)
    `when`(editor.putInt("integer", 42)).thenReturn(editor)
    `when`(editor.putLong("long", 4_294_967_296L)).thenReturn(editor)
    `when`(editor.putString("string", "value")).thenReturn(editor)
    `when`(editor.clear()).thenReturn(editor)

    subject.setBooleanValue("boolean", true)
    subject.setIntValue("integer", 42)
    subject.setLongValue("long", 4_294_967_296L)
    subject.setStringValue("string", "value")
    subject.clearAll()

    verify(editor).putBoolean("boolean", true)
    verify(editor).putInt("integer", 42)
    verify(editor).putLong("long", 4_294_967_296L)
    verify(editor).putString("string", "value")
    verify(editor).clear()
    verify(editor, times(5)).apply()
    verify(editor, never()).commit()
    verifyNoMoreInteractions(editor)
  }

  @Test
  fun removeReturnsEditorWithoutApplyingOrCommitting() {
    val preferences = mock(SharedPreferences::class.java)
    val editor = mock(SharedPreferences.Editor::class.java)
    val subject = subjectWith(preferences)
    `when`(preferences.edit()).thenReturn(editor)
    `when`(editor.remove("obsolete")).thenReturn(editor)

    assertSame(editor, subject.remove("obsolete"))

    verify(preferences).edit()
    verify(editor).remove("obsolete")
    verify(editor, never()).apply()
    verify(editor, never()).commit()
    verifyNoMoreInteractions(editor)
  }

  private fun subjectWith(preferences: SharedPreferences): UniversalFirebasePreferences {
    val subject = UniversalFirebasePreferences()
    val field = UniversalFirebasePreferences::class.java.getDeclaredField("preferences")
    field.isAccessible = true
    field.set(subject, preferences)
    return subject
  }
}
