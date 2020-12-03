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

import android.content.Context;
import android.content.res.Resources;
import android.content.res.XmlResourceParser;
import android.os.Bundle;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigInfo;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.*;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseConfigModule extends UniversalFirebaseModule {
  private static final String VALUE = "value";
  private static final String SOURCE = "source";

  UniversalFirebaseConfigModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Boolean> activate(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    return FirebaseRemoteConfig.getInstance(firebaseApp).activate();
  }

  Task<Void> fetch(String appName, long expirationDuration) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    return Tasks.call(getExecutor(), () -> {
      FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance(firebaseApp);
      Tasks.await(expirationDuration == -1 ? config.fetch() : config.fetch(expirationDuration));
      return null;
    });
  }

  Task<Boolean> fetchAndActivate(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance(firebaseApp);
    return config.fetchAndActivate();
  }

  Task<Void> reset(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance(firebaseApp);
    return config.reset();
  }

  Task<Void> setConfigSettings(String appName, Bundle configSettings) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    return Tasks.call(getExecutor(), () -> {
      FirebaseRemoteConfigSettings.Builder configSettingsBuilder = new FirebaseRemoteConfigSettings.Builder();

      if (configSettings.containsKey("minimumFetchInterval")) {
        double fetchInterval = configSettings.getDouble("minimumFetchInterval");
        configSettingsBuilder.setMinimumFetchIntervalInSeconds((long) fetchInterval);
      }
      if (configSettings.containsKey("fetchTimeout")) {
        double fetchTimeout = configSettings.getDouble("fetchTimeout");
        configSettingsBuilder.setFetchTimeoutInSeconds((long) fetchTimeout);
      }
      FirebaseRemoteConfig.getInstance(firebaseApp).setConfigSettingsAsync(configSettingsBuilder.build());
      return null;
    });
  }

  Task<Void> setDefaultsFromResource(String appName, String resourceName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    return Tasks.call(getExecutor(), () -> {
      int resourceId = getXmlResourceIdByName(resourceName);
      XmlResourceParser xmlResourceParser = null;

      try {
        xmlResourceParser = getApplicationContext().getResources().getXml(resourceId);
      } catch (Resources.NotFoundException nfe) {
        // do nothing
      }

      if (xmlResourceParser != null) {
        Tasks.await(FirebaseRemoteConfig.getInstance(firebaseApp).setDefaultsAsync(resourceId));
        return null;
      }

      throw new Exception("resource_not_found");
    });
  }

  Task<Void> setDefaults(String appName, HashMap<String, Object> defaults) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    return FirebaseRemoteConfig.getInstance(firebaseApp).setDefaultsAsync(defaults);
  }

  Task<FirebaseRemoteConfigInfo> ensureInitialized(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance(firebaseApp);
    Task<FirebaseRemoteConfigInfo> ensureInitializedTask = config.ensureInitialized();

    try {
      Tasks.await(fetchAndActivate(appName));
    } catch (Exception e) {
      // do nothing
    }

    return ensureInitializedTask;
  }

  Map<String, Object> getAllValuesForApp(String appName) {
    FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance(FirebaseApp.getInstance(appName));
    Map<String, FirebaseRemoteConfigValue> configValueMapRaw = config.getAll();
    Map<String, Object> configValuesMap = new HashMap<>(configValueMapRaw.size());
    for (Map.Entry<String, FirebaseRemoteConfigValue> entry : configValueMapRaw.entrySet()) {
      configValuesMap.put(entry.getKey(), convertRemoteConfigValue(entry.getValue()));
    }
    return configValuesMap;
  }

  private int getXmlResourceIdByName(String name) {
    String packageName = getApplicationContext().getPackageName();
    return getApplicationContext().getResources().getIdentifier(name, "xml", packageName);
  }

  private String lastFetchStatusToString(int fetchStatus) {
    String status = "unknown";
    switch (fetchStatus) {
      case LAST_FETCH_STATUS_SUCCESS:
        status = "success";
        break;
      case LAST_FETCH_STATUS_FAILURE:
        status = "failure";
        break;
      case LAST_FETCH_STATUS_NO_FETCH_YET:
        status = "no_fetch_yet";
        break;
      case LAST_FETCH_STATUS_THROTTLED:
        status = "throttled";
        break;
    }
    return status;
  }

  private Bundle convertRemoteConfigValue(FirebaseRemoteConfigValue value) {
    Bundle convertedConfigBundle = new Bundle(2);

    convertedConfigBundle.putString(VALUE, value.asString());

    switch (value.getSource()) {
      case FirebaseRemoteConfig.VALUE_SOURCE_DEFAULT:
        convertedConfigBundle.putString(SOURCE, "default");
        break;
      case FirebaseRemoteConfig.VALUE_SOURCE_REMOTE:
        convertedConfigBundle.putString(SOURCE, "remote");
        break;
      default:
        convertedConfigBundle.putString(SOURCE, "static");
    }

    return convertedConfigBundle;
  }

  public Map<String, Object> getConstantsForApp(String appName) {
    Map<String, Object> appConstants = new HashMap<>();
    FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance(FirebaseApp.getInstance(appName))
        .getInfo();
    FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

    appConstants.put("values", getAllValuesForApp(appName));
    appConstants.put("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
    appConstants.put("lastFetchStatus", lastFetchStatusToString((remoteConfigInfo.getLastFetchStatus())));
    appConstants.put("minimumFetchInterval", remoteConfigSettings.getMinimumFetchIntervalInSeconds());
    appConstants.put("fetchTimeout", remoteConfigSettings.getFetchTimeoutInSeconds());

    return appConstants;
  }

}
