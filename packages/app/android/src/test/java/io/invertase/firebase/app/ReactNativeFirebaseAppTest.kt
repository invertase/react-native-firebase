package io.invertase.firebase.app

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
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.times
import java.lang.reflect.Modifier

class ReactNativeFirebaseAppTest {
  @After
  fun resetApplicationContext() {
    mockStatic(Log::class.java).use {
      ReactNativeFirebaseApp.setApplicationContext(null)
    }
  }

  @Test
  fun javaVisibleApiPreservesClassConstructorAndStaticDescriptors() {
    val appClass = ReactNativeFirebaseApp::class.java
    val constructor = appClass.getConstructor()

    assertTrue(Modifier.isPublic(constructor.modifiers))
    assertFalse(Modifier.isFinal(appClass.modifiers))
    assertEquals(
      4,
      appClass.declaredMethods.count {
        Modifier.isPublic(it.modifiers) &&
          Modifier.isStatic(it.modifiers) &&
          !it.isSynthetic
      },
    )
    assertStaticMethod(appClass, "getApplicationContext", Context::class.java)
    assertStaticMethod(
      appClass,
      "setApplicationContext",
      Void.TYPE,
      Context::class.java,
    )
    assertStaticMethod(
      appClass,
      "initializeSecondaryApp",
      Void.TYPE,
      String::class.java,
    )
    assertStaticMethod(
      appClass,
      "initializeSecondaryApp",
      Void.TYPE,
      String::class.java,
      Context::class.java,
    )
  }

  @Test
  fun applicationContextStoresExactValueIncludingNullAndLogsExactly() {
    val context = mock(Context::class.java)

    mockStatic(Log::class.java).use { log ->
      ReactNativeFirebaseApp.setApplicationContext(context)
      assertSame(context, ReactNativeFirebaseApp.getApplicationContext())

      ReactNativeFirebaseApp.setApplicationContext(null)
      assertNull(ReactNativeFirebaseApp.getApplicationContext())

      log.verify(
        { Log.d("ReactNativeFirebaseApp", "received application context.") },
        times(2),
      )
      log.verifyNoMoreInteractions()
    }
  }

  @Test
  fun initializeSecondaryAppUsesStoredNullableContextAndName() {
    val context = mock(Context::class.java)
    val options = mock(FirebaseOptions::class.java)
    val initializedApp = mock(FirebaseApp::class.java)

    mockStatic(Log::class.java).use {
      ReactNativeFirebaseApp.setApplicationContext(context)
    }
    mockStatic(FirebaseOptions::class.java).use { firebaseOptions ->
      mockStatic(FirebaseApp::class.java).use { firebaseApps ->
        firebaseOptions
          .`when`<FirebaseOptions> { FirebaseOptions.fromResource(context) }
          .thenReturn(options)
        firebaseApps
          .`when`<FirebaseApp> {
            FirebaseApp.initializeApp(context, options, nullAsPlatformType())
          }.thenReturn(initializedApp)

        ReactNativeFirebaseApp.initializeSecondaryApp(null)

        firebaseOptions.verify { FirebaseOptions.fromResource(context) }
        firebaseApps.verify {
          FirebaseApp.initializeApp(context, options, nullAsPlatformType())
        }
      }
    }
  }

  @Test
  fun explicitContextOverloadIgnoresStoredContextAndAcceptsNull() {
    val storedContext = mock(Context::class.java)
    val options = mock(FirebaseOptions::class.java)

    mockStatic(Log::class.java).use {
      ReactNativeFirebaseApp.setApplicationContext(storedContext)
    }
    mockStatic(FirebaseOptions::class.java).use { firebaseOptions ->
      mockStatic(FirebaseApp::class.java).use { firebaseApps ->
        firebaseOptions
          .`when`<FirebaseOptions> { FirebaseOptions.fromResource(nullAsPlatformType()) }
          .thenReturn(options)

        ReactNativeFirebaseApp.initializeSecondaryApp("secondary", null)

        firebaseOptions.verify { FirebaseOptions.fromResource(nullAsPlatformType()) }
        firebaseApps.verify {
          FirebaseApp.initializeApp(nullAsPlatformType(), options, "secondary")
        }
        assertSame(storedContext, ReactNativeFirebaseApp.getApplicationContext())
      }
    }
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T> nullAsPlatformType(): T = null as T

  private fun assertStaticMethod(
    owner: Class<*>,
    name: String,
    returnType: Class<*>,
    vararg parameterTypes: Class<*>,
  ) {
    val method = owner.getMethod(name, *parameterTypes)
    assertTrue("$name must remain static", Modifier.isStatic(method.modifiers))
    assertTrue("$name must remain public", Modifier.isPublic(method.modifiers))
    assertEquals(returnType, method.returnType)
  }
}
