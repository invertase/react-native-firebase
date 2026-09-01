package com.invertase.testing

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

/** Test-app TurboModule: platform-specific probes no-op on Android. */
class NativeRNFBTesting(reactContext: ReactApplicationContext) :
  NativeRNFBTestingSpec(reactContext) {

  override fun messagingPreservesExistingDelegate(promise: Promise) {
    promise.resolve(false)
  }

  override fun completesNonFCMRemoteNotification(promise: Promise) {
    promise.resolve(false)
  }
}
