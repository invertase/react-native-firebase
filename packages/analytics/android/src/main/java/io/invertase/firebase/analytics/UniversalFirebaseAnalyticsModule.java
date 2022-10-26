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

import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.analytics.FirebaseAnalytics;
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.util.Set;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseAnalyticsModule extends UniversalFirebaseModule {

  UniversalFirebaseAnalyticsModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Void> logEvent(String name, Bundle parameters) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).logEvent(name, parameters);
          return null;
        });
  }

  Task<Void> setAnalyticsCollectionEnabled(Boolean enabled) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).setAnalyticsCollectionEnabled(enabled);
          return null;
        });
  }

  Task<Void> setSessionTimeoutDuration(long milliseconds) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).setSessionTimeoutDuration(milliseconds);
          return null;
        });
  }

  Task<String> getAppInstanceId() {
    return FirebaseAnalytics.getInstance(getContext()).getAppInstanceId();
  }

  Task<Long> getSessionId() {
    return FirebaseAnalytics.getInstance(getContext()).getSessionId();
  }

  Task<Void> setUserId(String id) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).setUserId(id);
          return null;
        });
  }

  Task<Void> setUserProperty(String name, String value) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).setUserProperty(name, value);
          return null;
        });
  }

  Task<Void> setUserProperties(Bundle properties) {
    return Tasks.call(
        () -> {
          Set<String> bundleKeys = properties.keySet();
          FirebaseAnalytics firebaseAnalytics = FirebaseAnalytics.getInstance(getContext());

          for (String bundleKey : bundleKeys) {
            firebaseAnalytics.setUserProperty(bundleKey, (String) properties.get(bundleKey));
          }

          return null;
        });
  }

  Task<Void> resetAnalyticsData() {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).resetAnalyticsData();
          return null;
        });
  }

  Task<Void> setDefaultEventParameters(Bundle parameters) {
    return Tasks.call(
        () -> {
          FirebaseAnalytics.getInstance(getContext()).setDefaultEventParameters(parameters);
          return null;
        });
  }
}
