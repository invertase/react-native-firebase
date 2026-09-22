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

open class ReactNativeFirebaseApp {
  companion object {
    private var applicationContext: Context? = null

    @JvmStatic fun getApplicationContext(): Context = nullableAsPlatformType(applicationContext)

    @JvmStatic
    fun setApplicationContext(applicationContext: Context?) {
      Log.d("ReactNativeFirebaseApp", "received application context.")
      ReactNativeFirebaseApp.applicationContext = applicationContext
    }

    @JvmStatic
    fun initializeSecondaryApp(name: String?) {
      val context: Context = nullableAsPlatformType(applicationContext)
      val options = FirebaseOptions.fromResource(context)
      FirebaseApp.initializeApp(
        context,
        nullableAsPlatformType(options),
        nullableAsPlatformType(name),
      )
    }

    @JvmStatic
    fun initializeSecondaryApp(
      name: String?,
      applicationContext: Context?,
    ) {
      val context: Context = nullableAsPlatformType(applicationContext)
      val options = FirebaseOptions.fromResource(context)
      FirebaseApp.initializeApp(
        context,
        nullableAsPlatformType(options),
        nullableAsPlatformType(name),
      )
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T> nullableAsPlatformType(value: T?): T = value as T
  }
}
