package io.invertase.firebase.database;

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
import com.google.android.gms.tasks.Task;
import com.google.firebase.database.OnDisconnect;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.Map;

import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

public class UniversalFirebaseDatabaseOnDisconnectModule extends UniversalFirebaseModule {

  UniversalFirebaseDatabaseOnDisconnectModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Void> onDisconnectCancel(String appName, String dbURL, String path) {
    return getDatabaseForApp(appName, dbURL)
      .getReference(path)
      .onDisconnect()
      .cancel();
  }

  Task<Void> onDisconnectRemove(String appName, String dbURL, String path) {
    return getDatabaseForApp(appName, dbURL)
      .getReference(path)
      .onDisconnect()
      .removeValue();
  }

  Task<Void> onDisconnectSet(String appName, String dbURL, String path, Object value) {
    return getDatabaseForApp(appName, dbURL)
      .getReference(path)
      .onDisconnect()
      .setValue(value);
  }

  Task<Void> onDisconnectSetWithPriority(String appName, String dbURL, String path, Object value, Object priority) {
    OnDisconnect onDisconnect = getDatabaseForApp(appName, dbURL)
      .getReference(path)
      .onDisconnect();

    if (priority instanceof String) {
      return onDisconnect.setValue(value, (String) priority);
    } else {
      return onDisconnect.setValue(value, (double) priority);
    }
  }

  Task<Void> onDisconnectUpdate(String appName, String dbURL, String path, Map<String, Object> values) {
    return getDatabaseForApp(appName, dbURL)
      .getReference(path)
      .onDisconnect()
      .updateChildren(values);
  }
}
