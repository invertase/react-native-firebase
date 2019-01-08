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
 *
 */

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.google.firebase.FirebaseApp

import java.util.ArrayList
import java.util.HashMap

import io.invertase.firebase.common.RCTConvertFirebaseCommon
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter
import io.invertase.firebase.common.ReactNativeFirebaseModule
import io.invertase.firebase.common.ReactNativeFirebasePreferences

class ReactNativeFirebaseAppModule internal constructor(reactContext: ReactApplicationContext) : ReactNativeFirebaseModule(reactContext, TAG, false) {

  override fun initialize() {
    super.initialize()
    ReactNativeFirebaseEventEmitter.getSharedInstance().attachContext(context)
    ReactNativeFirebasePreferences.getSharedInstance().attachContext(context)
  }

  @ReactMethod
  fun initializeApp(firebaseAppRaw: ReadableMap, promise: Promise) {
    val firebaseApp = RCTConvertFirebaseCommon.readableMapToFirebaseApp(
      firebaseAppRaw,
      context
    )

    val firebaseAppMap = RCTConvertFirebaseCommon.firebaseAppToWritableMap(firebaseApp)
    promise.resolve(firebaseAppMap)
  }

  @ReactMethod
  fun deleteApp(appName: String, promise: Promise) {
    val firebaseApp = FirebaseApp.getInstance(appName)
    firebaseApp!!.delete()
    promise.resolve(null)
  }

  override fun getConstants(): Map<String, Any> {
    val constants = HashMap<String, Any>()
    val appsList = ArrayList<Map<String, Any>>()
    val firebaseApps = FirebaseApp.getApps(getReactApplicationContext())

    for (app in firebaseApps) {
      appsList.add(RCTConvertFirebaseCommon.firebaseAppToMap(app))
    }

    constants["apps"] = appsList
    return constants
  }

  companion object {
    private val TAG = "App"
  }

}
