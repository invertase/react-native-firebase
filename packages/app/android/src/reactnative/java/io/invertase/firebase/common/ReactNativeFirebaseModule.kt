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
 *
 */

import android.app.Activity
import android.content.Context
import androidx.annotation.CallSuper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap
import io.invertase.firebase.interfaces.ContextProvider
import java.util.HashMap
import java.util.concurrent.ExecutorService

open class ReactNativeFirebaseModule(
  reactContext: ReactApplicationContext?,
  private var moduleName: String?,
) : ReactContextBaseJavaModule(reactContext),
  ContextProvider {
  private val executorService = TaskExecutorService(name)

  @CallSuper
  override fun initialize() {
    super.initialize()
  }

  override fun getContext(): ReactContext? = reactApplicationContext

  fun getExecutor(): ExecutorService = executorService.getExecutor()

  fun getTransactionalExecutor(): ExecutorService = executorService.getTransactionalExecutor()

  fun getTransactionalExecutor(identifier: String): ExecutorService = executorService.getTransactionalExecutor(identifier)

  /**
   * Kept for source and runtime compatibility with React Native versions that called this method.
   * Dynamic dispatch is intentional: a child invalidate implementation must run before it calls
   * back into [invalidate].
   */
  @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
  @java.lang.Deprecated
  @Deprecated("Use invalidate() instead.")
  override fun onCatalystInstanceDestroy() {
    invalidate()
  }

  /**
   * Current React Native defines invalidate as an empty subclass hook. Do not call super here:
   * older supported React Native versions delegated back to onCatalystInstanceDestroy, which
   * would recurse through this compatibility method.
   */
  @CallSuper
  override fun invalidate() {
    executorService.shutdown()
  }

  fun removeEventListeningExecutor(identifier: String) {
    val executorName = executorService.getExecutorName(true, identifier)
    executorService.removeExecutor(executorName)
  }

  override fun getApplicationContext(): Context? = reactApplicationContext.applicationContext

  override fun getActivity(): Activity? = reactApplicationContext.currentActivity

  override fun getName(): String = "RNFB${moduleName}Module"

  override fun getConstants(): MutableMap<String, Any> = HashMap()

  companion object {
    @JvmStatic
    fun rejectPromiseWithExceptionMap(
      promise: Promise?,
      exception: Exception,
    ) {
      val exceptionMap = SharedUtils.getExceptionMap(exception)
      promise!!.reject(exception, exceptionMap)
    }

    @JvmStatic
    fun rejectPromiseWithCodeAndMessage(
      promise: Promise?,
      code: String?,
      message: String?,
      resolver: ReadableMap?,
    ) {
      val userInfoMap = Arguments.createMap()
      userInfoMap.putString("code", code)
      userInfoMap.putString("message", message)
      if (resolver != null) {
        userInfoMap.putMap("resolver", resolver)
      }
      promise!!.reject(code, message, userInfoMap)
    }

    @JvmStatic
    fun rejectPromiseWithCodeAndMessage(
      promise: Promise?,
      code: String?,
      message: String?,
    ) {
      val userInfoMap = Arguments.createMap()
      userInfoMap.putString("code", code)
      userInfoMap.putString("message", message)
      promise!!.reject(code, message, userInfoMap)
    }

    @JvmStatic
    fun rejectPromiseWithCodeAndMessage(
      promise: Promise?,
      code: String?,
      message: String?,
      nativeErrorMessage: String?,
    ) {
      val userInfoMap = Arguments.createMap()
      userInfoMap.putString("code", code)
      userInfoMap.putString("message", message)
      userInfoMap.putString("nativeErrorMessage", nativeErrorMessage)
      promise!!.reject(code, message, userInfoMap)
    }
  }
}
