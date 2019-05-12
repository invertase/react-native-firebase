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
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigInfo;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigValue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.invertase.firebase.common.UniversalFirebaseModule;

import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_FAILURE;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_NO_FETCH_YET;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_SUCCESS;
import static com.google.firebase.remoteconfig.FirebaseRemoteConfig.LAST_FETCH_STATUS_THROTTLED;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseConfigModule extends UniversalFirebaseModule {
  private static final String STRING_VALUE = "stringValue";
  private static final String BOOL_VALUE = "boolValue";
  private static final String NUMBER_VALUE = "numberValue";
  private static final String SOURCE = "source";

  UniversalFirebaseConfigModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Boolean> activateFetched() {
    return Tasks.call(() -> FirebaseRemoteConfig.getInstance().activateFetched());
  }

  Task<Boolean> fetch(long cacheExpirationSeconds, boolean activate) {
    return Tasks.call(() -> {
      FirebaseRemoteConfig instance = FirebaseRemoteConfig.getInstance();
      Task<Void> fetchTask;

      if (cacheExpirationSeconds == -1) {
        fetchTask = instance.fetch(cacheExpirationSeconds);
      } else {
        fetchTask = instance.fetch();
      }

      Tasks.await(fetchTask);

      if (activate) {
        return FirebaseRemoteConfig.getInstance().activateFetched();
      }

      return null;
    });
  }

  Task<Map<String, Object>> getConfigSettings() {
    return Tasks.call(() -> {
      Map<String, Object> settings = new HashMap<>(3);
      FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance().getInfo();
      FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

      settings.put("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
      settings.put("lastFetchStatus", lastFetchStatusToString((int) remoteConfigInfo.getFetchTimeMillis()));
      settings.put("isDeveloperModeEnabled", remoteConfigSettings.isDeveloperModeEnabled());

      return settings;
    });
  }

  Task<Map<String, Object>> setConfigSettings(Bundle configSettings) {
    return Tasks.call(() -> {
      FirebaseRemoteConfigSettings.Builder configSettingsBuilder = new FirebaseRemoteConfigSettings.Builder();
      configSettingsBuilder.setDeveloperModeEnabled(configSettings.getBoolean("isDeveloperModeEnabled"));
      FirebaseRemoteConfig.getInstance().setConfigSettings(configSettingsBuilder.build());
      return Tasks.await(getConfigSettings());
    });
  }

  Task<Void> setDefaults(HashMap<String, Object> defaults) {
    return Tasks.call(() -> {
      FirebaseRemoteConfig.getInstance().setDefaults(defaults);
      return null;
    });
  }

  Task<Void> setDefaultsFromResource(String resourceName) {
    return Tasks.call(() -> {
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

  Task<Map<String, Object>> getValuesByKeysPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      HashMap<String, Object> map = new HashMap<>();

      for (String key : keys) {
        FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
        map.put(key, convertRemoteConfigValue(configValue));
      }

      return map;
    });
  }

  Task<List<String>> getKeysByPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      return new ArrayList<>(keys);
    });
  }

  Task<Map<String, Object>> getValue(String key) {
    return Tasks.call(() -> {
      FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
      return convertRemoteConfigValue(configValue);
    });
  }

  Task<List<Map<String, Object>>> getValues(ArrayList<Object> keys) {
    return Tasks.call(() -> {
      ArrayList<Map<String, Object>> valuesArray = new ArrayList<>();

      for (Object key : keys) {
        FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig
          .getInstance()
          .getValue((String) key);

        valuesArray.add(convertRemoteConfigValue(configValue));
      }

      return valuesArray;
    });
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

  private Map<String, Object> convertRemoteConfigValue(FirebaseRemoteConfigValue value) {
    Map<String, Object> converted = new HashMap<>();

    converted.put(STRING_VALUE, value.asString());

    try {
      boolean booleanValue = value.asBoolean();
      converted.put(BOOL_VALUE, booleanValue);
    } catch (Exception e) {
      converted.put(BOOL_VALUE, null);
    }

    try {
      double numberValue = value.asDouble();
      converted.put(NUMBER_VALUE, numberValue);
    } catch (Exception e) {
      converted.put(NUMBER_VALUE, null);
    }

    switch (value.getSource()) {
      case FirebaseRemoteConfig.VALUE_SOURCE_DEFAULT:
        converted.put(SOURCE, "default");
        break;
      case FirebaseRemoteConfig.VALUE_SOURCE_REMOTE:
        converted.put(SOURCE, "remote");
        break;
      default:
        converted.put(SOURCE, "static");
    }

    return converted;
  }

}
