package com.invertase.testing

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class RNFBTestingCoverageModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "RNFBTestingCoverage"

  @ReactMethod
  fun flush(promise: Promise) {
    try {
      val coverageFile = File(reactApplicationContext.filesDir, "coverage.ec")
      val emmaRT = Class.forName("com.vladium.emma.rt.RT")
      val dump =
        emmaRT.getMethod(
          "dumpCoverageData",
          File::class.java,
          Boolean::class.javaPrimitiveType,
          Boolean::class.javaPrimitiveType,
        )
      dump.invoke(null, coverageFile, false, false)
      Log.i(
        TAG,
        "[native-coverage] flushed Jacoco coverage to ${coverageFile.absolutePath}",
      )
      promise.resolve(coverageFile.absolutePath)
    } catch (e: ClassNotFoundException) {
      Log.w(
        TAG,
        "[native-coverage] Jacoco/Emma RT class not found; coverage is likely not enabled in this build",
      )
      promise.reject("coverage_not_enabled", "Jacoco/Emma RT class not found", e)
    } catch (e: Exception) {
      Log.e(TAG, "[native-coverage] flush failed", e)
      promise.reject("coverage_flush_failed", "Failed to dump Jacoco coverage data", e)
    }
  }

  companion object {
    private const val TAG = "RNFBTestingCoverage"
  }
}
