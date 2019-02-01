package io.invertase.firebase.analytics;

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

import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.google.firebase.analytics.FirebaseAnalytics;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAnalyticsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Analytics";

  ReactNativeFirebaseAnalyticsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void logEvent(String name, @Nullable ReadableMap params, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).logEvent(name, Arguments.toBundle(params));
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setAnalyticsCollectionEnabled(Boolean enabled, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).setAnalyticsCollectionEnabled(enabled);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setCurrentScreen(String screenName, String screenClassOverride, Promise promise) {
    Activity activity = getActivity();
    if (activity != null) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          try {
            FirebaseAnalytics
              .getInstance(getContext())
              .setCurrentScreen(activity, screenName, screenClassOverride);

            promise.resolve(null);
          } catch (Exception exception) {
            rejectPromiseWithExceptionMap(promise, exception);
          }
        }
      });
    } else {
      promise.resolve(null);
    }
  }

  @ReactMethod
  public void setMinimumSessionDuration(double milliseconds, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).setMinimumSessionDuration((long) milliseconds);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setSessionTimeoutDuration(double milliseconds, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).setSessionTimeoutDuration((long) milliseconds);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setUserId(String id, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).setUserId(id);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setUserProperty(String name, String value, Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).setUserProperty(name, value);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void setUserProperties(ReadableMap properties, Promise promise) {
    try {
      ReadableMapKeySetIterator iterator = properties.keySetIterator();
      FirebaseAnalytics firebaseAnalytics = FirebaseAnalytics.getInstance(getContext());

      while (iterator.hasNextKey()) {
        String name = iterator.nextKey();
        String value = properties.getString(name);
        firebaseAnalytics.setUserProperty(name, value);
      }

      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void resetAnalyticsData(Promise promise) {
    try {
      FirebaseAnalytics.getInstance(getContext()).resetAnalyticsData();
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }
}
