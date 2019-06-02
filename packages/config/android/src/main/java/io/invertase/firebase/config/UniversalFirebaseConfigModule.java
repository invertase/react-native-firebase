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

import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.*;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseConfigModule extends UniversalFirebaseModule {
  private static final String STRING_VALUE = "stringValue";
  private static final String BOOL_VALUE = "boolValue";
  private static final String NUMBER_VALUE = "numberValue";
  private static final String SOURCE = "source";

  UniversalFirebaseConfigModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Boolean> activate() {
    return FirebaseRemoteConfig.getInstance().activate();
  }

  Task<Void> fetch(long expirationDuration) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance();
      Tasks.await(expirationDuration == -1 ? config.fetch() : config.fetch(expirationDuration));
      return null;
    });
  }

  Task<Boolean> fetchAndActivate() {
    FirebaseRemoteConfig config = FirebaseRemoteConfig.getInstance();
    Task<Void> fetchTask = config.fetch();
    return fetchTask.onSuccessTask(aVoid -> config.activate());
  }

  Task<Void> setConfigSettings(Bundle configSettings) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseRemoteConfigSettings.Builder configSettingsBuilder = new FirebaseRemoteConfigSettings.Builder();
      configSettingsBuilder.setDeveloperModeEnabled(configSettings.getBoolean("isDeveloperModeEnabled"));
      FirebaseRemoteConfig.getInstance().setConfigSettings(configSettingsBuilder.build());
      return null;
    });
  }

  Task<Void> setDefaults(HashMap<String, Object> defaults) {
    return FirebaseRemoteConfig.getInstance().setDefaultsAsync(defaults);
  }

  Task<Void> setDefaultsFromResource(String resourceName) {
    return Tasks.call(getExecutor(), () -> {
      int resourceId = getXmlResourceIdByName(resourceName);
      XmlResourceParser xmlResourceParser = null;

      try {
        xmlResourceParser = getApplicationContext().getResources().getXml(resourceId);
      } catch (Resources.NotFoundException nfe) {
        // do nothing
      }

      if (xmlResourceParser != null) {
        FirebaseRemoteConfig.getInstance().setDefaults(resourceId);
        return null;
      }

      throw new Exception("resource_not_found");
    });
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

    convertedConfigBundle.putString(STRING_VALUE, value.asString());

    try {
      boolean booleanValue = value.asBoolean();
      convertedConfigBundle.putBoolean(BOOL_VALUE, booleanValue);
    } catch (Exception e) {
      // ignore
    }

    try {
      double numberValue = value.asDouble();
      convertedConfigBundle.putDouble(NUMBER_VALUE, numberValue);
    } catch (Exception e) {
      // ignore
    }

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
    FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance(FirebaseApp.getInstance(appName)).getInfo();
    FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

    appConstants.put("values", getAllValuesForApp(appName));
    appConstants.put("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
    appConstants.put("isDeveloperModeEnabled", remoteConfigSettings.isDeveloperModeEnabled());
    appConstants.put("lastFetchStatus", lastFetchStatusToString(remoteConfigInfo.getLastFetchStatus()));

    return appConstants;
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    Map<String, Object> constantsForApps = new HashMap<>();
    List<FirebaseApp> firebaseApps = FirebaseApp.getApps(getApplicationContext());
    for (FirebaseApp app : firebaseApps) {
      constantsForApps.put(app.getName(), getConstantsForApp(app.getName()));
    }
    constants.put("REMOTE_CONFIG_APP_CONSTANTS", constantsForApps);
    return constants;
  }

}
