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

  Task<Bundle> getConfigSettings() {
    return Tasks.call(() -> {
      Bundle settings = new Bundle();
      FirebaseRemoteConfigInfo remoteConfigInfo = FirebaseRemoteConfig.getInstance().getInfo();
      FirebaseRemoteConfigSettings remoteConfigSettings = remoteConfigInfo.getConfigSettings();

      settings.putDouble("lastFetchTime", remoteConfigInfo.getFetchTimeMillis());
      settings.putString("lastFetchStatus", lastFetchStatusToString(remoteConfigInfo.getLastFetchStatus()));
      settings.putBoolean("isDeveloperModeEnabled", remoteConfigSettings.isDeveloperModeEnabled());

      return settings;
    });
  }

  Task<Bundle> setConfigSettings(Bundle configSettings) {
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

  Task<Bundle> setDefaultsFromResource(String resourceName) {
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

      Bundle error = new Bundle();
      error.putString("code", "resource_not_found");
      error.putString("message", "The specified resource name was not found.");
      return error;
    });
  }

  Task<Bundle> getValuesByKeysPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      Bundle bundle = new Bundle();

      for (String key : keys) {
        FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
        bundle.putBundle(key, convertRemoteConfigValue(configValue));
      }

      return bundle;
    });
  }

  Task<List> getKeysByPrefix(String prefix) {
    return Tasks.call(() -> {
      Set<String> keys = FirebaseRemoteConfig.getInstance().getKeysByPrefix(prefix);
      return new ArrayList<>(keys);
    });
  }

  Task<Bundle> getValue(String key) {
    return Tasks.call(() -> {
      FirebaseRemoteConfigValue configValue = FirebaseRemoteConfig.getInstance().getValue(key);
      return convertRemoteConfigValue(configValue);
    });
  }

  Task<List> getValues(ArrayList keys) {
    return Tasks.call(() -> {
      ArrayList<Bundle> valuesArray = new ArrayList<>();

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

  private Bundle convertRemoteConfigValue(FirebaseRemoteConfigValue value) {
    Bundle bundle = new Bundle();

    bundle.putString(STRING_VALUE, value.asString());

    try {
      boolean booleanValue = value.asBoolean();
      bundle.putBoolean(BOOL_VALUE, booleanValue);
    } catch (Exception e) {
      bundle.putString(BOOL_VALUE, null);
    }

    try {
      double numberValue = value.asDouble();
      bundle.putDouble(NUMBER_VALUE, numberValue);
    } catch (Exception e) {
      bundle.putString(NUMBER_VALUE, null);
    }

    switch (value.getSource()) {
      case FirebaseRemoteConfig.VALUE_SOURCE_DEFAULT:
        bundle.putString(SOURCE, "default");
        break;
      case FirebaseRemoteConfig.VALUE_SOURCE_REMOTE:
        bundle.putString(SOURCE, "remote");
        break;
      default:
        bundle.putString(SOURCE, "static");
    }

    return bundle;
  }

}
