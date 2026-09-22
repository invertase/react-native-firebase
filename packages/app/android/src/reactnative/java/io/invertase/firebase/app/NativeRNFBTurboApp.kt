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

import android.util.Log
import com.facebook.fbreact.specs.NativeRNFBTurboAppSpec
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.firebase.FirebaseApp
import io.invertase.firebase.common.RCTConvertFirebase
import io.invertase.firebase.common.ReactNativeFirebaseEvent
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter
import io.invertase.firebase.common.ReactNativeFirebaseJSON
import io.invertase.firebase.common.ReactNativeFirebaseMeta
import io.invertase.firebase.common.ReactNativeFirebasePreferences
import java.util.ArrayList
import java.util.HashMap
import java.util.concurrent.ConcurrentHashMap

open class NativeRNFBTurboApp protected constructor(
  reactContext: ReactApplicationContext?,
) : NativeRNFBTurboAppSpec(reactContext),
  LifecycleEventListener {
  override fun initialize() {
    super.initialize()
    val reactContext = reactApplicationContext
    // Register unconditionally. When the host is already RESUMED, addLifecycleEventListener
    // posts onHostResume onto the UI queue asynchronously (it is not a synchronous call), so
    // the explicit attach below is the primary path; resume remains best-effort convergence
    // for later host flips. Stale-generation attaches are rejected or held pending by
    // attachReactContext's fail-closed current-context arbitration.
    reactContext.addLifecycleEventListener(this)
    ReactNativeFirebaseEventEmitter.getSharedInstance().attachReactContext(reactContext)
  }

  override fun invalidate() {
    val reactContext = reactApplicationContext
    reactContext.removeLifecycleEventListener(this)
    // Identity-guarded inside the emitter: only clears state belonging to this dying context,
    // never state a replacement runtime has already installed.
    ReactNativeFirebaseEventEmitter.getSharedInstance().detachReactContext(reactContext)
    super.invalidate()
  }

  override fun onHostResume() {
    // Re-attaching also flushes any events queued while no runtime was able to receive them.
    ReactNativeFirebaseEventEmitter
      .getSharedInstance()
      .attachReactContext(reactApplicationContext)
  }

  override fun onHostPause() {
    // No-op, required by LifecycleEventListener.
  }

  override fun onHostDestroy() {
    // No-op, required by LifecycleEventListener.
  }

  protected override fun getTypedExportedConstants(): MutableMap<String, Any?> {
    val constants: MutableMap<String, Any?> = HashMap()
    val appsList: MutableList<Map<String, Any?>> = ArrayList()
    val firebaseApps = FirebaseApp.getApps(reactApplicationContext)

    for (app in firebaseApps) {
      appsList.add(RCTConvertFirebase.firebaseAppToMap(app))
    }

    constants["NATIVE_FIREBASE_APPS"] = appsList
    constants["FIREBASE_RAW_JSON"] = ReactNativeFirebaseJSON.getSharedInstance().getRawJSON()

    return constants
  }

  override fun initializeApp(
    options: ReadableMap?,
    appConfig: ReadableMap?,
    promise: Promise?,
  ) {
    val firebaseApp =
      RCTConvertFirebase.readableMapToFirebaseApp(options, appConfig, reactApplicationContext)
    configureAuthDomain(
      nullableAsPlatformType<ReadableMap>(appConfig).getString("name"),
      nullableAsPlatformType<ReadableMap>(options).getString("authDomain"),
    )

    val firebaseAppMap = RCTConvertFirebase.firebaseAppToWritableMap(firebaseApp)
    nullableAsPlatformType<Promise>(promise).resolve(firebaseAppMap)
  }

  override fun setAutomaticDataCollectionEnabled(
    appName: String?,
    enabled: Boolean,
  ) {
    val firebaseApp: FirebaseApp? = FirebaseApp.getInstance(nullableAsPlatformType(appName))
    nullableAsPlatformType<FirebaseApp>(firebaseApp).setDataCollectionDefaultEnabled(enabled)
  }

  override fun deleteApp(
    appName: String?,
    promise: Promise?,
  ) {
    val firebaseApp: FirebaseApp? = FirebaseApp.getInstance(nullableAsPlatformType(appName))

    if (firebaseApp != null) {
      firebaseApp.delete()
      authDomains.remove(appName)
    }

    nullableAsPlatformType<Promise>(promise).resolve(null)
  }

  override fun eventsNotifyReady(ready: Boolean) {
    val emitter = ReactNativeFirebaseEventEmitter.getSharedInstance()
    emitter.notifyJsReady(ready)
  }

  override fun eventsGetListeners(promise: Promise?) {
    val emitter = ReactNativeFirebaseEventEmitter.getSharedInstance()
    nullableAsPlatformType<Promise>(promise).resolve(emitter.listenersMap)
  }

  override fun eventsPing(
    eventName: String?,
    eventBody: ReadableMap?,
    promise: Promise?,
  ) {
    val emitter = ReactNativeFirebaseEventEmitter.getSharedInstance()
    emitter.sendEvent(
      ReactNativeFirebaseEvent(
        nullableAsPlatformType(eventName),
        nullableAsPlatformType(RCTConvertFirebase.readableMapToWritableMap(eventBody)),
      ),
    )
    nullableAsPlatformType<Promise>(promise).resolve(
      RCTConvertFirebase.readableMapToWritableMap(eventBody),
    )
  }

  override fun eventsAddListener(eventName: String?) {
    val emitter = ReactNativeFirebaseEventEmitter.getSharedInstance()
    emitter.addListener(eventName)
  }

  override fun eventsRemoveListener(
    eventName: String?,
    all: Boolean,
  ) {
    val emitter = ReactNativeFirebaseEventEmitter.getSharedInstance()
    emitter.removeListener(eventName, all)
  }

  override fun addListener(eventName: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  override fun removeListeners(count: Double) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  override fun metaGetAll(promise: Promise?) {
    nullableAsPlatformType<Promise>(promise).resolve(
      ReactNativeFirebaseMeta.getSharedInstance().getAll(),
    )
  }

  override fun jsonGetAll(promise: Promise?) {
    nullableAsPlatformType<Promise>(promise).resolve(
      ReactNativeFirebaseJSON.getSharedInstance().getAll(),
    )
  }

  override fun preferencesSetBool(
    key: String?,
    value: Boolean,
    promise: Promise?,
  ) {
    ReactNativeFirebasePreferences.getSharedInstance().setBooleanValue(key, value)
    nullableAsPlatformType<Promise>(promise).resolve(null)
  }

  override fun preferencesSetString(
    key: String?,
    value: String?,
    promise: Promise?,
  ) {
    ReactNativeFirebasePreferences.getSharedInstance().setStringValue(key, value)
    nullableAsPlatformType<Promise>(promise).resolve(null)
  }

  override fun preferencesGetAll(promise: Promise?) {
    nullableAsPlatformType<Promise>(promise).resolve(
      ReactNativeFirebasePreferences.getSharedInstance().getAll(),
    )
  }

  override fun preferencesClearAll(promise: Promise?) {
    ReactNativeFirebasePreferences.getSharedInstance().clearAll()
    nullableAsPlatformType<Promise>(promise).resolve(null)
  }

  override fun setLogLevel(logLevel: String?) {
    // Android uses Firebase SDK log level via manifest; no-op at runtime.
  }

  companion object {
    private const val TAG = "App"

    @JvmField
    val authDomains: MutableMap<String?, String> = ConcurrentHashMap()

    // Kotlin has no package-private constructor. Protected keeps same-package Java construction
    // while avoiding an externally public constructor; this internal invoke keeps same-module
    // Kotlin package registration source-compatible without widening the constructor itself.
    internal operator fun invoke(reactContext: ReactApplicationContext?): NativeRNFBTurboApp = NativeRNFBTurboApp(reactContext)

    @Suppress("UNCHECKED_CAST")
    private fun <T> nullableAsPlatformType(value: T?): T = value as T

    @JvmStatic
    fun configureAuthDomain(
      name: String?,
      authDomain: String?,
    ) {
      if (authDomain != null) {
        Log.d(TAG, "$name custom authDomain $authDomain")
        authDomains[name] = authDomain
      } else {
        authDomains.remove(name)
      }
    }
  }
}
