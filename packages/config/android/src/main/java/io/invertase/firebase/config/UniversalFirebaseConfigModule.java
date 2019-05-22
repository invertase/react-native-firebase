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
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

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

  Task<Boolean> activateFetched() {
    return Tasks.call(() -> FirebaseRemoteConfig.getInstance().activateFetched());
  }

  Task<Boolean> fetch(long cacheExpirationSeconds, boolean activate) {
    return Tasks.call(getExecutor(), () -> {
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

  Task<Bundle> getConfigSettings() {
    return Tasks.call(() -> {
      Bundle settingsBundle = new Bundle(3);
      FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance().getInfo();
      FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

      settingsBundle.putLong("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
      settingsBundle.putString("lastFetchStatus", lastFetchStatusToString(remoteConfigInfo.getLastFetchStatus()));
      settingsBundle.putBoolean("isDeveloperModeEnabled", remoteConfigSettings.isDeveloperModeEnabled());

      return settingsBundle;
    });
  }

  Task<Bundle> setConfigSettings(Bundle configSettings) {
    return Tasks.call(getExecutor(), () -> {
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

  Task<Bundle> getValuesByKeysPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      Bundle valuesBundle = new Bundle(keys.size());

      for (String key : keys) {
        FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
        valuesBundle.putBundle(key, convertRemoteConfigValue(configValue));
      }

      return valuesBundle;
    });
  }

  Task<List<String>> getKeysByPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      return new ArrayList<>(keys);
    });
  }

  Task<Bundle> getValue(String key) {
    return Tasks.call(() -> convertRemoteConfigValue(FirebaseRemoteConfig.getInstance().getValue(key)));
  }

  Task<List<Bundle>> getValues(ArrayList<Object> keys) {
    return Tasks.call(getExecutor(), () -> {
      List<Bundle> valuesList = new ArrayList<>(keys.size());
      for (Object key : keys) {
        valuesList.add(convertRemoteConfigValue(FirebaseRemoteConfig.getInstance().getValue((String) key)));
      }
      return valuesList;
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

}
