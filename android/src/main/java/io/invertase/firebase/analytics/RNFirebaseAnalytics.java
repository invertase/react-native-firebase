package io.invertase.firebase.analytics;

import android.util.Log;
import android.app.Activity;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;


public class RNFirebaseAnalytics extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseAnalytics";

  public RNFirebaseAnalytics(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  /**
   * @return
   */
  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void logEvent(final String name, @Nullable final ReadableMap params) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).logEvent(name, Arguments.toBundle(params));
  }

  /**
   * @param enabled
   */
  @ReactMethod
  public void setAnalyticsCollectionEnabled(final Boolean enabled) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).setAnalyticsCollectionEnabled(enabled);
  }

  /**
   * @param screenName
   * @param screenClassOverride
   */
  @ReactMethod
  public void setCurrentScreen(final String screenName, final String screenClassOverride) {
    final Activity activity = getCurrentActivity();
    if (activity != null) {
      // needs to be run on main thread
      Log.d(TAG, "setCurrentScreen " + screenName + " - " + screenClassOverride);
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          FirebaseAnalytics.getInstance(getReactApplicationContext()).setCurrentScreen(activity, screenName, screenClassOverride);
        }
      });
    }
  }

  /**
   * @param milliseconds
   */
  @ReactMethod
  public void setMinimumSessionDuration(final double milliseconds) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).setMinimumSessionDuration((long) milliseconds);
  }

  /**
   * @param milliseconds
   */
  @ReactMethod
  public void setSessionTimeoutDuration(final double milliseconds) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).setSessionTimeoutDuration((long) milliseconds);
  }

  /**
   * @param id
   */
  @ReactMethod
  public void setUserId(final String id) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).setUserId(id);
  }

  /**
   * @param name
   * @param value
   */
  @ReactMethod
  public void setUserProperty(final String name, final String value) {
    FirebaseAnalytics.getInstance(getReactApplicationContext()).setUserProperty(name, value);
  }
}
