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

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithExceptionMap;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import com.facebook.fbreact.specs.NativeRNFBTurboAnalyticsSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.ArrayList;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.annotation.Nullable;

public class NativeRNFBTurboAnalytics extends NativeRNFBTurboAnalyticsSpec {
  private static final String SERVICE_NAME = "Analytics";
  private static final long GET_SESSION_ID_TIMEOUT_MS = 60_000L;

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

  public NativeRNFBTurboAnalytics(ReactApplicationContext reactContext) {
    super(reactContext);
    module = new UniversalFirebaseAnalyticsModule(reactContext, SERVICE_NAME);
  }

  @Override
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

  @Override
  public void setAnalyticsCollectionEnabled(boolean enabled, Promise promise) {
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

  @Override
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

  @Override
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

  @Override
  public void getSessionId(Promise promise) {
    final AtomicBoolean completed = new AtomicBoolean(false);
    final Handler handler = new Handler(Looper.getMainLooper());
    final Runnable timeoutRunnable =
        () -> {
          if (completed.compareAndSet(false, true)) {
            promise.resolve(null);
          }
        };
    handler.postDelayed(timeoutRunnable, GET_SESSION_ID_TIMEOUT_MS);

    module
        .getSessionId()
        .addOnCompleteListener(
            task -> {
              handler.removeCallbacks(timeoutRunnable);
              if (!completed.compareAndSet(false, true)) {
                return;
              }
              if (task.isSuccessful()) {
                Long result = task.getResult();
                promise.resolve(result != null ? result.doubleValue() : null);
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void setUserId(@Nullable String id, Promise promise) {
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

  @Override
  public void setUserProperty(String name, @Nullable String value, Promise promise) {
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

  @Override
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

  @Override
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

  @Override
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

  @Override
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

  @Override
  public void logTransaction(String transactionId, Promise promise) {
    promise.reject("platform-unsupported", "logTransaction is only supported on iOS");
  }

  @Override
  public void initiateOnDeviceConversionMeasurementWithEmailAddress(
      String emailAddress, Promise promise) {
    promise.reject(
        "platform-unsupported",
        "initiateOnDeviceConversionMeasurementWithEmailAddress is only supported on iOS");
  }

  @Override
  public void initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
      String hashedEmailAddress, Promise promise) {
    promise.reject(
        "platform-unsupported",
        "initiateOnDeviceConversionMeasurementWithHashedEmailAddress is only supported on iOS");
  }

  @Override
  public void initiateOnDeviceConversionMeasurementWithPhoneNumber(
      String phoneNumber, Promise promise) {
    promise.reject(
        "platform-unsupported",
        "initiateOnDeviceConversionMeasurementWithPhoneNumber is only supported on iOS");
  }

  @Override
  public void initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
      String hashedPhoneNumber, Promise promise) {
    promise.reject(
        "platform-unsupported",
        "initiateOnDeviceConversionMeasurementWithHashedPhoneNumber is only supported on iOS");
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
