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

import android.app.Activity
import android.content.IntentSender
import android.util.Log

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

import java.util.HashMap

import io.invertase.firebase.common.ReactNativeFirebaseModule
import io.invertase.firebase.common.ReactNativeFirebasePreferences

class ReactNativeFirebaseUtilsModule internal constructor(reactContext: ReactApplicationContext) : ReactNativeFirebaseModule(reactContext, TAG, false) {

  private val isGooglePlayServicesAvailable: Int
    get() {
      val gapi = GoogleApiAvailability.getInstance()
      return gapi.isGooglePlayServicesAvailable(context)
    }

  private val playServicesStatusMap: WritableMap
    get() {
      val result = Arguments.createMap()
      val gapi = GoogleApiAvailability.getInstance()

      val status = gapi.isGooglePlayServicesAvailable(context)
      result.putInt("status", status)

      if (status == ConnectionResult.SUCCESS) {
        result.putBoolean("isAvailable", true)
      } else {
        result.putBoolean("isAvailable", false)
        result.putString("error", gapi.getErrorString(status))
        result.putBoolean("isUserResolvableError", gapi.isUserResolvableError(status))
        result.putBoolean("hasResolution", ConnectionResult(status).hasResolution())
      }

      return result
    }

  @ReactMethod
  fun getSavedPreferences(promise: Promise) {
    promise.resolve(ReactNativeFirebasePreferences.getSharedInstance().allAsWritableMap)
  }

  @ReactMethod
  fun clearSavedPreferences(promise: Promise) {
    ReactNativeFirebasePreferences.getSharedInstance().clearAll()
    promise.resolve(null)
  }

  @ReactMethod
  fun androidGetPlayServicesStatus(promise: Promise) {
    promise.resolve(playServicesStatusMap)
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  fun androidPromptForPlayServices() {
    val status = isGooglePlayServicesAvailable

    if (status != ConnectionResult.SUCCESS && GoogleApiAvailability.getInstance().isUserResolvableError(status)) {
      val activity = activity
      if (activity != null) {
        GoogleApiAvailability.getInstance()
          .getErrorDialog(activity, status, status)
          .show()
      }
    }
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  fun androidResolutionForPlayServices() {
    val status = isGooglePlayServicesAvailable
    val connectionResult = ConnectionResult(status)

    if (!connectionResult.isSuccess() && connectionResult.hasResolution()) {
      val activity = activity
      if (activity != null) {
        try {
          connectionResult.startResolutionForResult(activity, status)
        } catch (error: IntentSender.SendIntentException) {
          Log.d(TAG, "resolutionForPlayServices", error)
        }

      }
    }
  }

  /**
   * Prompt the device user to update Play Services
   */
  @ReactMethod
  fun androidMakePlayServicesAvailable() {
    val status = isGooglePlayServicesAvailable

    if (status != ConnectionResult.SUCCESS) {
      val activity = activity
      if (activity != null) {
        GoogleApiAvailability.getInstance().makeGooglePlayServicesAvailable(activity)
      }
    }
  }

  override fun getConstants(): Map<String, Any> {
    val constants = HashMap<String, Any>()
    constants["androidPlayServices"] = playServicesStatusMap
    return constants
  }

  companion object {
    private val TAG = "Utils"
  }

}
