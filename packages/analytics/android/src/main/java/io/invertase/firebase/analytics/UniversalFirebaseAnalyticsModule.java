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
import android.content.Context;
import android.os.Bundle;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.analytics.FirebaseAnalytics;

import java.util.Set;

import javax.annotation.Nullable;

public class UniversalFirebaseAnalyticsModule {
  private static final String TAG = "Analytics";
  private final Context context;


  UniversalFirebaseAnalyticsModule(Context context) {
    this.context = context;
  }

  Task<Void> logEvent(String name, Bundle parameters) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).logEvent(name, parameters);
      return null;
    });
  }

  Task<Void> setAnalyticsCollectionEnabled(Boolean enabled) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(enabled);
      return null;
    });
  }

  Task<Void> setAnalyticsCollectionEnabled(Activity currentActivity, String screenName, @Nullable String screenClassOverride) {
    return Tasks.call(() -> {
      if (currentActivity == null) return null;
      FirebaseAnalytics.getInstance(context).setCurrentScreen(currentActivity, screenName, screenClassOverride);
      return null;
    });
  }

  Task<Void> setMinimumSessionDuration(long milliseconds) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).setMinimumSessionDuration(milliseconds);
      return null;
    });
  }

  Task<Void> setSessionTimeoutDuration(long milliseconds) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).setSessionTimeoutDuration(milliseconds);
      return null;
    });
  }

  Task<Void> setUserId(String id) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).setUserId(id);
      return null;
    });
  }

  Task<Void> setUserProperty(String name, String value) {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).setUserProperty(name, value);
      return null;
    });
  }

  Task<Void> setUserProperties(Bundle properties) {
    return Tasks.call(() -> {
      Set<String> bundleKeys = properties.keySet();
      FirebaseAnalytics firebaseAnalytics = FirebaseAnalytics.getInstance(context);

      for (String bundleKey:bundleKeys) {
        firebaseAnalytics.setUserProperty(bundleKey, (String) properties.get(bundleKey));
      }

      return null;
    });
  }

  Task<Void> resetAnalyticsData() {
    return Tasks.call(() -> {
      FirebaseAnalytics.getInstance(context).resetAnalyticsData();
      return null;
    });
  }
}
