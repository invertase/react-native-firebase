package io.invertase.firebase.firestore;

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
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.FirebaseFirestore;
import io.invertase.firebase.common.UniversalFirebaseModule;
import io.invertase.firebase.common.UniversalFirebasePreferences;

import java.util.Map;
import java.util.Objects;

import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;
import static  io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.instanceCache;

public class UniversalFirebaseFirestoreModule extends UniversalFirebaseModule {

  UniversalFirebaseFirestoreModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Void> disableNetwork(String appName) {
    return getFirestoreForApp(appName).disableNetwork();
  }

  Task<Void> enableNetwork(String appName) {
    return getFirestoreForApp(appName).enableNetwork();
  }

  Task<Void> settings(String appName, Map<String, Object> settings) {
    return Tasks.call(getExecutor(), () -> {
      // settings.cacheSizeBytes
      if (settings.containsKey("cacheSizeBytes")) {
        Double cacheSizeBytesDouble = (Double) settings.get("cacheSizeBytes");

        UniversalFirebasePreferences.getSharedInstance().setIntValue(
          UniversalFirebaseFirestoreStatics.FIRESTORE_CACHE_SIZE + "_" + appName,
          Objects.requireNonNull(cacheSizeBytesDouble).intValue());
      }

      // settings.host
      if (settings.containsKey("host")) {
        UniversalFirebasePreferences.getSharedInstance().setStringValue(
          UniversalFirebaseFirestoreStatics.FIRESTORE_HOST + "_" + appName, (String) settings.get("host"));
      }

      // settings.persistence
      if (settings.containsKey("persistence")) {
        UniversalFirebasePreferences.getSharedInstance().setBooleanValue(
          UniversalFirebaseFirestoreStatics.FIRESTORE_PERSISTENCE + "_" + appName,
          (boolean) settings.get("persistence"));
      }

      // settings.ssl
      if (settings.containsKey("ssl")) {
        UniversalFirebasePreferences.getSharedInstance().setBooleanValue(
          UniversalFirebaseFirestoreStatics.FIRESTORE_SSL + "_" + appName, (boolean) settings.get("ssl"));
      }

      return null;
    });
  }

  Task<Void> clearPersistence(String appName) {
    return getFirestoreForApp(appName).clearPersistence();
  }

  Task<Void> waitForPendingWrites(String appName) {
    return getFirestoreForApp(appName).waitForPendingWrites();
  }

  Task<Void> terminate(String appName) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);

    if (instanceCache.get(appName) != null) {
      instanceCache.get(appName).clear();
      instanceCache.remove(appName);
    }

    return firebaseFirestore.terminate();
  }
}
