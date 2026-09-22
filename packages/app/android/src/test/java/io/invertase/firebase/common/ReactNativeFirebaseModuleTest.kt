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

import android.app.Activity
import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`

/** Plain JUnit4 + Mockito coverage for the module's bridge and lifecycle contracts. */
class ReactNativeFirebaseModuleTest {
  private lateinit var jsonObjectField: java.lang.reflect.Field
  private var originalJsonObject: Any? = null

  @Before
  fun setUp() {
    val jsonObject = mock(JSONObject::class.java)
    `when`(jsonObject.optInt(anyString(), anyInt())).thenAnswer { it.getArgument(1) }
    val json = ReactNativeFirebaseJSON.getSharedInstance()
    jsonObjectField = ReactNativeFirebaseJSON::class.java.getDeclaredField("jsonObject")
    jsonObjectField.isAccessible = true
    originalJsonObject = jsonObjectField.get(json)
    jsonObjectField.set(json, jsonObject)
  }

  @After
  fun tearDown() {
    jsonObjectField.set(ReactNativeFirebaseJSON.getSharedInstance(), originalJsonObject)
  }

  @Test
  fun constructorUsesVirtualNameAfterAssigningModuleName() {
    val subject = VirtualNameModule(mock(ReactApplicationContext::class.java))
    val field = ReactNativeFirebaseModule::class.java.getDeclaredField("executorService")
    field.isAccessible = true
    val service = field.get(subject) as TaskExecutorService

    assertEquals("ExternalChildExecutor", service.getExecutorName(false, ""))
    assertEquals("ExternalChild", subject.name)
  }

  @Test
  fun namePreservesJavaNullConcatenation() {
    val subject = ReactNativeFirebaseModule(mock(ReactApplicationContext::class.java), null)

    assertEquals("RNFBnullModule", subject.name)
  }

  @Test
  fun contextActivityAndApplicationContextDelegateToReactContext() {
    val reactContext = mock(ReactApplicationContext::class.java)
    val applicationContext = mock(Context::class.java)
    val activity = mock(Activity::class.java)
    `when`(reactContext.applicationContext).thenReturn(applicationContext)
    `when`(reactContext.currentActivity).thenReturn(activity)
    val subject = ReactNativeFirebaseModule(reactContext, "App")

    assertSame(reactContext, subject.getContext())
    assertSame(applicationContext, subject.getApplicationContext())
    assertSame(activity, subject.getActivity())
    subject.initialize()
  }

  @Test
  fun nullCurrentActivityAndApplicationContextAreReturned() {
    val reactContext = mock(ReactApplicationContext::class.java)
    `when`(reactContext.applicationContext).thenReturn(null)
    `when`(reactContext.currentActivity).thenReturn(null)
    val subject = ReactNativeFirebaseModule(reactContext, "App")

    assertNull(subject.getApplicationContext())
    assertNull(subject.getActivity())
  }

  @Test
  fun executorAccessorsAndRemovalPreserveTransactionalBehavior() {
    val subject = ReactNativeFirebaseModule(mock(ReactApplicationContext::class.java), "App")
    val defaultExecutor = subject.getExecutor()
    val transactionalExecutor = subject.getTransactionalExecutor()
    val identifiedExecutor = subject.getTransactionalExecutor("listener")

    assertSame(defaultExecutor, transactionalExecutor)
    assertNotSame(transactionalExecutor, identifiedExecutor)
    assertSame(identifiedExecutor, subject.getTransactionalExecutor("listener"))

    subject.removeEventListeningExecutor("listener")

    assertTrue(identifiedExecutor.isShutdown)
    assertNotSame(identifiedExecutor, subject.getTransactionalExecutor("listener"))
    subject.invalidate()
    assertTrue(defaultExecutor.isShutdown)
  }

  @Suppress("DEPRECATION")
  @Test
  fun catalystDestroyDynamicallyInvokesChildInvalidate() {
    val subject = LifecycleModule(mock(ReactApplicationContext::class.java))
    val executor = subject.getTransactionalExecutor()

    subject.onCatalystInstanceDestroy()

    assertEquals(1, subject.invalidations)
    assertTrue(executor.isShutdown)
  }

  @Test
  fun constantsAreFreshMutableHashMaps() {
    val subject = ReactNativeFirebaseModule(mock(ReactApplicationContext::class.java), "App")
    val first = subject.constants
    val second = subject.constants

    first["value"] = 1
    assertTrue(first is HashMap<*, *>)
    assertTrue(second is HashMap<*, *>)
    assertNotSame(first, second)
    assertTrue(second.isEmpty())
  }

  @Test
  fun rejectionHelpersPreserveMapsAndPromiseOverloads() {
    val promise = mock(Promise::class.java)
    val map = mock(WritableMap::class.java)
    val resolver = mock(ReadableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap> { Arguments.createMap() }.thenReturn(map)

      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
        promise,
        "code",
        "message",
        resolver,
      )
      verify(map).putString("code", "code")
      verify(map).putString("message", "message")
      verify(map).putMap("resolver", resolver)
      verify(promise).reject("code", "message", map)

      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
        promise,
        "without-resolver",
        "message",
        null as ReadableMap?,
      )
      verify(promise).reject("without-resolver", "message", map)

      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(promise, null, null)
      verify(map).putString("code", null)
      verify(map).putString("message", null)
      verify(promise).reject(null as String?, null as String?, map)

      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
        promise,
        "native-code",
        "native-message",
        null as String?,
      )
      verify(map).putString("nativeErrorMessage", null)
      verify(map, never()).putMap("resolver", null)
      verify(promise).reject("native-code", "native-message", map)

      assertThrows(NullPointerException::class.java) {
        ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(null, "code", "message")
      }
      assertThrows(NullPointerException::class.java) {
        ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
          null,
          "code",
          "message",
          resolver,
        )
      }
      assertThrows(NullPointerException::class.java) {
        ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
          null,
          "code",
          "message",
          "native",
        )
      }
    }
  }

  @Test
  fun exceptionRejectionUsesSharedExceptionMapAndExactOverload() {
    val promise = mock(Promise::class.java)
    val exception = Exception("failure")
    val map = mock(WritableMap::class.java)
    mockStatic(Arguments::class.java).use { arguments ->
      arguments.`when`<WritableMap>(Arguments::createMap).thenReturn(map)

      ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, exception)

      verify(promise).reject(exception, map)
      verify(map).putString("code", "unknown")
      verify(map).putString("nativeErrorCode", "unknown")
      verify(map).putString("message", "failure")
      verify(map).putString("nativeErrorMessage", "failure")
      assertThrows(NullPointerException::class.java) {
        ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(null, exception)
      }
    }
  }

  private class VirtualNameModule(
    reactContext: ReactApplicationContext?,
  ) : ReactNativeFirebaseModule(reactContext, "Ignored") {
    override fun getName(): String = "ExternalChild"
  }

  private class LifecycleModule(
    reactContext: ReactApplicationContext?,
  ) : ReactNativeFirebaseModule(reactContext, "Lifecycle") {
    var invalidations = 0

    override fun invalidate() {
      invalidations += 1
      super.invalidate()
    }
  }
}
