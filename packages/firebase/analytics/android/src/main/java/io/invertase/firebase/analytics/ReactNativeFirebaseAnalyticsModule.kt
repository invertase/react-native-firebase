package io.invertase.firebase.analytics

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

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableMapKeySetIterator
import com.google.firebase.analytics.FirebaseAnalytics

import io.invertase.firebase.common.ReactNativeFirebaseModule

class ReactNativeFirebaseAnalyticsModule internal constructor(reactContext: ReactApplicationContext) : ReactNativeFirebaseModule(reactContext, TAG, false) {

  @ReactMethod
  fun logEvent(name: String, params: ReadableMap?, promise: Promise) {
    FirebaseAnalytics.getInstance(context).logEvent(name, Arguments.toBundle(params))
    promise.resolve(null)
  }

  @ReactMethod
  fun setAnalyticsCollectionEnabled(enabled: Boolean, promise: Promise) {
    FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(enabled)
    promise.resolve(null)
  }

  @ReactMethod
  fun setCurrentScreen(screenName: String, screenClassOverride: String, promise: Promise) {
    val activity = activity
    if (activity != null) {
      // needs to be run on ui thread
      activity.runOnUiThread {
        FirebaseAnalytics
          .getInstance(context)
          .setCurrentScreen(activity, screenName, screenClassOverride)

        promise.resolve(null)
      }
    } else {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun setMinimumSessionDuration(milliseconds: Double, promise: Promise) {
    FirebaseAnalytics.getInstance(context).setMinimumSessionDuration(milliseconds.toLong())
    promise.resolve(null)
  }

  @ReactMethod
  fun setSessionTimeoutDuration(milliseconds: Double, promise: Promise) {
    FirebaseAnalytics.getInstance(context).setSessionTimeoutDuration(milliseconds.toLong())
    promise.resolve(null)
  }

  @ReactMethod
  fun setUserId(id: String, promise: Promise) {
    FirebaseAnalytics.getInstance(context).setUserId(id)
    promise.resolve(null)
  }

  @ReactMethod
  fun setUserProperty(name: String, value: String, promise: Promise) {
    FirebaseAnalytics.getInstance(context).setUserProperty(name, value)
    promise.resolve(null)
  }

  @ReactMethod
  fun setUserProperties(properties: ReadableMap, promise: Promise) {
    val iterator = properties.keySetIterator()
    val firebaseAnalytics = FirebaseAnalytics.getInstance(context)

    while (iterator.hasNextKey()) {
      val name = iterator.nextKey()
      val value = properties.getString(name)
      firebaseAnalytics.setUserProperty(name, value)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun resetAnalyticsData(promise: Promise) {
    FirebaseAnalytics.getInstance(context).resetAnalyticsData()
    promise.resolve(null)
  }

  companion object {
    private val TAG = "Analytics"
  }
}
