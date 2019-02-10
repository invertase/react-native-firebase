package io.invertase.firebase.crash;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.google.firebase.crash.FirebaseCrash;


public class RNFirebaseCrash extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseCrash";

  public RNFirebaseCrash(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void log(final String message) {
    FirebaseCrash.log(message);
  }

  @ReactMethod
  public void logcat(final int level, final String tag, final String message) {
    FirebaseCrash.logcat(level, tag, message);
  }

  @ReactMethod
  public void report(String message) {
    FirebaseCrash.report(new Exception(message));
  }

  @ReactMethod
  public void setCrashCollectionEnabled(Boolean enabled) {
    FirebaseCrash.setCrashCollectionEnabled(enabled);
  }

  @ReactMethod
  public void isCrashCollectionEnabled(Promise promise) {
    Boolean isEnabled = FirebaseCrash.isCrashCollectionEnabled();
    promise.resolve(isEnabled);
  }
}
