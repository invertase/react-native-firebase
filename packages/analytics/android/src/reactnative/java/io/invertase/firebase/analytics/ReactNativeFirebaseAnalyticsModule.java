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

import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.firebase.analytics.FirebaseAnalytics;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.ArrayList;
import java.util.Locale;
import javax.annotation.Nullable;

public class ReactNativeFirebaseAnalyticsModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "Analytics";

  /**
   * GA4 parameters that must be sent as long values. React Native's bridge stores JS numbers as
   * doubles in {@link Bundle}; Firebase Analytics expects integral types for these keys.
   */
  private static final String[] LONG_NUMERIC_PARAM_KEYS =
      new String[] {
        FirebaseAnalytics.Param.QUANTITY,
        FirebaseAnalytics.Param.INDEX,
        FirebaseAnalytics.Param.LEVEL,
        FirebaseAnalytics.Param.NUMBER_OF_NIGHTS,
        FirebaseAnalytics.Param.NUMBER_OF_PASSENGERS,
        FirebaseAnalytics.Param.NUMBER_OF_ROOMS,
        FirebaseAnalytics.Param.SCORE,
      };

  private final UniversalFirebaseAnalyticsModule module;

  ReactNativeFirebaseAnalyticsModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    module = new UniversalFirebaseAnalyticsModule(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void logEvent(String name, @Nullable ReadableMap params, Promise promise) {
    module
        .logEvent(name, toBundle(params))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setAnalyticsCollectionEnabled(Boolean enabled, Promise promise) {
    module
        .setAnalyticsCollectionEnabled(enabled)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setSessionTimeoutDuration(double milliseconds, Promise promise) {
    module
        .setSessionTimeoutDuration((long) milliseconds)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void getAppInstanceId(Promise promise) {
    module
        .getAppInstanceId()
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void getSessionId(Promise promise) {
    module
        .getSessionId()
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                Long result = task.getResult();
                promise.resolve(result != null ? result.doubleValue() : null);
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setUserId(String id, Promise promise) {
    module
        .setUserId(id)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setUserProperty(String name, String value, Promise promise) {
    module
        .setUserProperty(name, value)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setUserProperties(ReadableMap properties, Promise promise) {
    module
        .setUserProperties(Arguments.toBundle(properties))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void resetAnalyticsData(Promise promise) {
    module
        .resetAnalyticsData()
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setDefaultEventParameters(@Nullable ReadableMap params, Promise promise) {
    module
        .setDefaultEventParameters(toBundle(params))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @ReactMethod
  public void setConsent(ReadableMap consentSettings, Promise promise) {
    module
        .setConsent(Arguments.toBundle(consentSettings))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  private Bundle toBundle(ReadableMap readableMap) {
    Bundle bundle = Arguments.toBundle(readableMap);
    if (bundle == null) {
      return null;
    }

    ArrayList itemsArray = (ArrayList) bundle.getSerializable(FirebaseAnalytics.Param.ITEMS);
    if (itemsArray != null) {
      if (itemsArray.isEmpty()) {
        bundle.putParcelableArray(FirebaseAnalytics.Param.ITEMS, new Bundle[0]);
      } else {
        ArrayList<Bundle> validBundles = new ArrayList<>();
        for (Object item : itemsArray) {
          if (item instanceof Bundle) {
            Bundle itemBundle = (Bundle) item;
            coerceLongNumericParams(itemBundle);
            validBundles.add(itemBundle);
          }
        }
        bundle.putParcelableArray(
            FirebaseAnalytics.Param.ITEMS, validBundles.toArray(new Bundle[0]));
      }
    }

    coerceLongNumericParams(bundle);
    coerceSuccessParamToLong(bundle);

    if (bundle.containsKey(FirebaseAnalytics.Param.EXTEND_SESSION)) {
      double number = bundle.getDouble(FirebaseAnalytics.Param.EXTEND_SESSION);
      bundle.putLong(FirebaseAnalytics.Param.EXTEND_SESSION, (long) number);
    }
    return bundle;
  }

  private static void coerceLongNumericParams(Bundle bundle) {
    for (String key : LONG_NUMERIC_PARAM_KEYS) {
      if (bundle.containsKey(key)) {
        double number = bundle.getDouble(key);
        bundle.putLong(key, (long) number);
      }
    }
  }

  private static void coerceSuccessParamToLong(Bundle bundle) {
    if (!bundle.containsKey(FirebaseAnalytics.Param.SUCCESS)) {
      return;
    }
    Object value = bundle.get(FirebaseAnalytics.Param.SUCCESS);
    bundle.remove(FirebaseAnalytics.Param.SUCCESS);
    long asLong = 0L;
    if (value instanceof Boolean) {
      asLong = (Boolean) value ? 1L : 0L;
    } else if (value instanceof Number) {
      asLong = ((Number) value).longValue() != 0L ? 1L : 0L;
    } else if (value instanceof String) {
      String s = ((String) value).trim().toLowerCase(Locale.ROOT);
      asLong = ("1".equals(s) || "true".equals(s) || "yes".equals(s)) ? 1L : 0L;
    }
    bundle.putLong(FirebaseAnalytics.Param.SUCCESS, asLong);
  }
}
