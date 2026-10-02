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
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Bundle
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
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.verifyNoMoreInteractions
import org.mockito.Mockito.`when`
import java.lang.reflect.Modifier

/** Plain JUnit4 + Mockito coverage for manifest metadata lookup (AndroidTest-AD-1). */
class ReactNativeFirebaseMetaTest {
  @Test
  fun javaVisibleApiPreservesConstructorSingletonAndExactMethodTypes() {
    val metaClass = ReactNativeFirebaseMeta::class.java
    val constructor = metaClass.getConstructor()
    val sharedInstanceMethod = metaClass.getMethod("getSharedInstance")

    assertTrue(Modifier.isPublic(constructor.modifiers))
    assertFalse(Modifier.isFinal(metaClass.modifiers))
    assertTrue(Modifier.isStatic(sharedInstanceMethod.modifiers))
    assertEquals(metaClass, sharedInstanceMethod.returnType)
    assertSame(
      ReactNativeFirebaseMeta.getSharedInstance(),
      ReactNativeFirebaseMeta.getSharedInstance(),
    )
    assertEquals(
      Boolean::class.javaPrimitiveType,
      metaClass.getMethod("contains", String::class.java).returnType,
    )
    assertEquals(
      Boolean::class.javaPrimitiveType,
      metaClass
        .getMethod("getBooleanValue", String::class.java, Boolean::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(
      String::class.java,
      metaClass.getMethod("getStringValue", String::class.java, String::class.java).returnType,
    )
    assertEquals(
      Int::class.javaPrimitiveType,
      metaClass
        .getMethod("getIntValue", String::class.java, Int::class.javaPrimitiveType)
        .returnType,
    )
    assertEquals(WritableMap::class.java, metaClass.getMethod("getAll").returnType)
    metaClass.declaredMethods
      .filterNot { Modifier.isStatic(it.modifiers) || Modifier.isPrivate(it.modifiers) }
      .forEach { method ->
        assertFalse("${method.name} must remain overridable", Modifier.isFinal(method.modifiers))
      }
  }

  @Test
  fun scalarAccessorsReturnDefaultsWhenPackageManagerIsNull() {
    val context = mock(Context::class.java)
    `when`(context.packageManager).thenReturn(null)

    withApplicationContext(context) {
      val subject = ReactNativeFirebaseMeta()

      assertFalse(subject.contains("missing"))
      assertTrue(subject.getBooleanValue("missing", true))
      assertEquals("fallback", subject.getStringValue("missing", "fallback"))
      assertEquals(17, subject.getIntValue("missing", 17))
    }
  }

  @Test
  fun scalarAccessorsUsePrefixedKeysIncludingNullAndDelegateDefaults() {
    val metaData = mock(Bundle::class.java)
    val context = contextWithMetaData(metaData)
    `when`(metaData.containsKey("rnfirebase_present")).thenReturn(true)
    `when`(metaData.getBoolean("rnfirebase_boolean", false)).thenReturn(true)
    `when`(metaData.getString("rnfirebase_string", null)).thenReturn("value")
    `when`(metaData.getInt("rnfirebase_integer", 0)).thenReturn(42)
    `when`(metaData.containsKey("rnfirebase_null")).thenReturn(true)

    withApplicationContext(context) {
      val subject = ReactNativeFirebaseMeta()

      assertTrue(subject.contains("present"))
      assertTrue(subject.getBooleanValue("boolean", false))
      assertEquals("value", subject.getStringValue("string", null))
      assertEquals(42, subject.getIntValue("integer", 0))
      assertTrue(subject.contains(null))
    }
  }

  @Test
  fun metadataLookupUsesPackageNameAndGetMetaDataFlag() {
    val context = mock(Context::class.java)
    val packageManager = mock(PackageManager::class.java)
    val applicationInfo = mock(ApplicationInfo::class.java)
    val metaData = mock(Bundle::class.java)
    applicationInfo.metaData = metaData
    `when`(context.packageManager).thenReturn(packageManager)
    `when`(context.packageName).thenReturn("com.example.test")
    `when`(
      packageManager.getApplicationInfo("com.example.test", PackageManager.GET_META_DATA),
    ).thenReturn(applicationInfo)
    `when`(metaData.containsKey("rnfirebase_present")).thenReturn(true)

    withApplicationContext(context) {
      assertTrue(ReactNativeFirebaseMeta().contains("present"))
    }

    verify(packageManager)
      .getApplicationInfo("com.example.test", PackageManager.GET_META_DATA)
  }

  @Test
  fun metadataLookupFallsBackForNullApplicationInfoNullMetadataAndMissingPackage() {
    val context = mock(Context::class.java)
    val packageManager = mock(PackageManager::class.java)
    val applicationInfo = mock(ApplicationInfo::class.java)
    `when`(context.packageManager).thenReturn(packageManager)
    `when`(context.packageName).thenReturn("com.example.test")
    `when`(
      packageManager.getApplicationInfo("com.example.test", PackageManager.GET_META_DATA),
    ).thenReturn(null, applicationInfo)
      .thenThrow(PackageManager.NameNotFoundException("missing"))

    withApplicationContext(context) {
      val subject = ReactNativeFirebaseMeta()

      assertFalse(subject.contains("first"))
      assertFalse(subject.contains("second"))
      assertFalse(subject.contains("third"))
    }
  }

  @Test
  fun getAllCreatesAndReturnsEmptyMapWhenMetadataIsUnavailable() {
    val context = mock(Context::class.java)
    val emptyMap = mock(WritableMap::class.java)
    `when`(context.packageManager).thenReturn(null)

    withApplicationContext(context) {
      mockStatic(Arguments::class.java).use { arguments ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(emptyMap)

        assertSame(emptyMap, ReactNativeFirebaseMeta().getAll())
        verifyNoInteractions(emptyMap)
      }
    }
  }

  @Test
  fun getAllKeepsPrefixedSupportedValuesAndIgnoresEverythingElse() {
    val metaData = mock(Bundle::class.java)
    val writableMap = mock(WritableMap::class.java)
    val context = contextWithMetaData(metaData)
    val keys =
      linkedSetOf(
        "unrelated",
        "rnfirebase_null",
        "rnfirebase_string",
        "rnfirebase_boolean",
        "rnfirebase_integer",
        "rnfirebase_unsupported",
      )
    `when`(metaData.keySet()).thenReturn(keys)
    `when`(metaData.get("rnfirebase_null")).thenReturn(null)
    `when`(metaData.get("rnfirebase_string")).thenReturn("value")
    `when`(metaData.get("rnfirebase_boolean")).thenReturn(true)
    `when`(metaData.get("rnfirebase_integer")).thenReturn(42)
    `when`(metaData.get("rnfirebase_unsupported")).thenReturn(42L)

    withApplicationContext(context) {
      mockStatic(Arguments::class.java).use { arguments ->
        arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(writableMap)

        assertSame(writableMap, ReactNativeFirebaseMeta().getAll())
      }
    }

    verify(metaData, never()).get("unrelated")
    verify(writableMap).putNull("rnfirebase_null")
    verify(writableMap).putString("rnfirebase_string", "value")
    verify(writableMap).putBoolean("rnfirebase_boolean", true)
    verify(writableMap).putInt("rnfirebase_integer", 42)
    verifyNoMoreInteractions(writableMap)
  }

  private fun contextWithMetaData(metaData: Bundle): Context {
    val context = mock(Context::class.java)
    val packageManager = mock(PackageManager::class.java)
    val applicationInfo = mock(ApplicationInfo::class.java)
    applicationInfo.metaData = metaData
    `when`(context.packageManager).thenReturn(packageManager)
    `when`(context.packageName).thenReturn("com.example.test")
    `when`(
      packageManager.getApplicationInfo("com.example.test", PackageManager.GET_META_DATA),
    ).thenReturn(applicationInfo)
    return context
  }

  private fun withApplicationContext(
    context: Context,
    block: () -> Unit,
  ) {
    val previous: Context? = ReactNativeFirebaseApp.getApplicationContext()
    mockStatic(Log::class.java).use {
      ReactNativeFirebaseApp.setApplicationContext(context)
    }
    try {
      block()
    } finally {
      mockStatic(Log::class.java).use {
        ReactNativeFirebaseApp.setApplicationContext(previous)
      }
    }
  }
}
