package io.invertase.firebase.config;

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

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;
import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithExceptionMap;

import com.facebook.fbreact.specs.NativeRNFBTurboConfigSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;
import com.google.firebase.remoteconfig.ConfigUpdate;
import com.google.firebase.remoteconfig.ConfigUpdateListener;
import com.google.firebase.remoteconfig.ConfigUpdateListenerRegistration;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigException;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigFetchThrottledException;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;
import org.jetbrains.annotations.NotNull;

public class NativeRNFBTurboConfig extends NativeRNFBTurboConfigSpec {
  private static final String SERVICE_NAME = "Config";
  private final UniversalFirebaseConfigModule module;

  private static final HashMap<String, ConfigUpdateListenerRegistration> mConfigUpdateRegistrations =
      new HashMap<>();

  public NativeRNFBTurboConfig(ReactApplicationContext reactContext) {
    super(reactContext);
    module = new UniversalFirebaseConfigModule(reactContext, SERVICE_NAME);
  }

  @Override
  public void invalidate() {
    super.invalidate();

    Iterator<Map.Entry<String, ConfigUpdateListenerRegistration>> configRegistrationsIterator =
        mConfigUpdateRegistrations.entrySet().iterator();

    while (configRegistrationsIterator.hasNext()) {
      Map.Entry<String, ConfigUpdateListenerRegistration> pair = configRegistrationsIterator.next();
      ConfigUpdateListenerRegistration mConfigRegistration = pair.getValue();
      mConfigRegistration.remove();
      configRegistrationsIterator.remove();
    }

    module.onTearDown();
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    return module.getConstantsForApp(FirebaseApp.DEFAULT_APP_NAME);
  }

  @Override
  public void activate(String appName, Promise promise) {
    module
        .activate(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithConstants(task.getResult(), appName));
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void fetch(String appName, double expirationDurationSeconds, Promise promise) {
    module
        .fetch(appName, (long) expirationDurationSeconds)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithVoidConstants(appName));
              } else {
                rejectPromiseWithConfigException(promise, task.getException());
              }
            });
  }

  @Override
  public void fetchAndActivate(String appName, Promise promise) {
    module
        .fetchAndActivate(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithConstants(task.getResult(), appName));
              } else {
                rejectPromiseWithConfigException(promise, task.getException());
              }
            });
  }

  @Override
  public void reset(String appName, Promise promise) {
    module
        .reset(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithVoidConstants(appName));
              } else {
                rejectPromiseWithConfigException(promise, task.getException());
              }
            });
  }

  @Override
  public void setConfigSettings(String appName, ReadableMap configSettings, Promise promise) {
    module
        .setConfigSettings(appName, Arguments.toBundle(configSettings))
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithVoidConstants(appName));
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void setDefaults(String appName, ReadableMap defaults, Promise promise) {
    module
        .setDefaults(appName, defaults.toHashMap())
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithConstants(task.getResult(), appName));
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void setDefaultsFromResource(String appName, String resourceName, Promise promise) {
    module
        .setDefaultsFromResource(appName, resourceName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithConstants(task.getResult(), appName));
              } else {
                Exception exception = task.getException();
                if (exception != null && exception.getMessage().equals("resource_not_found")) {
                  rejectPromiseWithCodeAndMessage(
                      promise, "resource_not_found", "The specified resource name was not found.");
                  return;
                }
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void ensureInitialized(String appName, Promise promise) {
    module
        .ensureInitialized(appName)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithVoidConstants(appName));
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  @Override
  public void onConfigUpdated(String appName) {
    if (mConfigUpdateRegistrations.get(appName) == null) {
      ConfigUpdateListenerRegistration registration =
          FirebaseRemoteConfig.getInstance(FirebaseApp.getInstance(appName))
              .addOnConfigUpdateListener(
                  new ConfigUpdateListener() {
                    @Override
                    public void onUpdate(@NotNull ConfigUpdate configUpdate) {
                      ReactNativeFirebaseEventEmitter emitter =
                          ReactNativeFirebaseEventEmitter.getSharedInstance();

                      Set<String> updatedKeys = configUpdate.getUpdatedKeys();
                      List<String> updatedKeysList = new ArrayList<>(updatedKeys);

                      Map<String, Object> results = new HashMap<>();
                      results.put("appName", appName);
                      results.put("resultType", "success");
                      results.put("updatedKeys", updatedKeysList);
                      ReactNativeFirebaseEvent event =
                          new ReactNativeFirebaseEvent(
                              "on_config_updated", Arguments.makeNativeMap(results), appName);
                      emitter.sendEvent(event);
                    }

                    @Override
                    public void onError(@NotNull FirebaseRemoteConfigException error) {
                      ReactNativeFirebaseEventEmitter emitter =
                          ReactNativeFirebaseEventEmitter.getSharedInstance();

                      WritableMap userInfoMap = Arguments.createMap();
                      userInfoMap.putString("resultType", "error");
                      userInfoMap.putString("appName", appName);

                      FirebaseRemoteConfigException.Code code = error.getCode();
                      switch (code) {
                        case CONFIG_UPDATE_STREAM_ERROR:
                          userInfoMap.putString("code", "config_update_stream_error");
                          break;
                        case CONFIG_UPDATE_MESSAGE_INVALID:
                          userInfoMap.putString("code", "config_update_message_invalid");
                          break;
                        case CONFIG_UPDATE_NOT_FETCHED:
                          userInfoMap.putString("code", "config_update_not_fetched");
                          break;
                        case CONFIG_UPDATE_UNAVAILABLE:
                          userInfoMap.putString("code", "config_update_unavailable");
                          break;
                        case UNKNOWN:
                          userInfoMap.putString("code", "unknown");
                          break;
                        default:
                          userInfoMap.putString("code", "internal");
                      }

                      userInfoMap.putString("message", error.getMessage());
                      userInfoMap.putString("nativeErrorMessage", error.getMessage());
                      ReactNativeFirebaseEvent event =
                          new ReactNativeFirebaseEvent("on_config_updated", userInfoMap, appName);
                      emitter.sendEvent(event);
                    }
                  });

      mConfigUpdateRegistrations.put(appName, registration);
    }
  }

  @Override
  public void removeConfigUpdateRegistration(String appName) {
    ConfigUpdateListenerRegistration mConfigRegistration = mConfigUpdateRegistrations.get(appName);

    if (mConfigRegistration != null) {
      mConfigRegistration.remove();
      mConfigUpdateRegistrations.remove(appName);
    }
  }

  @Override
  public void setCustomSignals(String appName, ReadableMap customSignals, Promise promise) {
    module
        .setCustomSignals(appName, customSignals.toHashMap())
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                promise.resolve(resultWithVoidConstants(appName));
              } else {
                rejectPromiseWithExceptionMap(promise, task.getException());
              }
            });
  }

  private WritableMap resultWithConstants(Object result, String appName) {
    Map<String, Object> responseMap = new HashMap<>(2);
    responseMap.put("result", result);
    responseMap.put("constants", module.getConstantsForApp(appName));
    return Arguments.makeNativeMap(responseMap);
  }

  private WritableMap resultWithVoidConstants(String appName) {
    Map<String, Object> responseMap = new HashMap<>(1);
    responseMap.put("constants", module.getConstantsForApp(appName));
    return Arguments.makeNativeMap(responseMap);
  }

  private void rejectPromiseWithConfigException(Promise promise, @Nullable Exception exception) {
    if (exception == null) {
      rejectPromiseWithCodeAndMessage(
          promise,
          "unknown",
          "Operation cannot be completed successfully, due to an unknown error.");
      return;
    }

    if (exception.getCause() instanceof FirebaseRemoteConfigFetchThrottledException) {
      rejectPromiseWithCodeAndMessage(
          promise,
          "throttled",
          "fetch() operation cannot be completed successfully, due to throttling.",
          exception.getMessage());
    } else {
      rejectPromiseWithCodeAndMessage(
          promise,
          "failure",
          "fetch() operation cannot be completed successfully.",
          exception.getMessage());
    }
  }
}
