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
import com.google.firebase.firestore.FirebaseFirestoreSettings;

import java.util.Map;
import java.util.Objects;

import io.invertase.firebase.common.UniversalFirebaseModule;

import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;

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
      FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
      FirebaseFirestoreSettings.Builder firestoreSettings = new FirebaseFirestoreSettings.Builder();

      // settings.cacheSizeBytes
      if (settings.containsKey("cacheSizeBytes")) {
        Double cacheSizeBytesDouble = (Double) settings.get("cacheSizeBytes");
        int cacheSizeBytes = cacheSizeBytesDouble.intValue();

        if (cacheSizeBytes == -1) {
          firestoreSettings.setCacheSizeBytes(FirebaseFirestoreSettings.CACHE_SIZE_UNLIMITED);
        } else {
          firestoreSettings.setCacheSizeBytes(cacheSizeBytes);
        }
      } else {
        firestoreSettings.setCacheSizeBytes(firebaseFirestore.getFirestoreSettings().getCacheSizeBytes());
      }

      // settings.host
      if (settings.containsKey("host")) {
        firestoreSettings.setHost((String) Objects.requireNonNull(settings.get("host")));
      } else {
        firestoreSettings.setHost(firebaseFirestore.getFirestoreSettings().getHost());
      }

      // settings.persistence
      if (settings.containsKey("persistence")) {
        firestoreSettings.setPersistenceEnabled((boolean) settings.get("persistence"));
      } else {
        firestoreSettings.setPersistenceEnabled(firebaseFirestore.getFirestoreSettings().isPersistenceEnabled());
      }

      // settings.ssl
      if (settings.containsKey("ssl")) {
        firestoreSettings.setSslEnabled((boolean) settings.get("ssl"));
      } else {
        firestoreSettings.setSslEnabled(firebaseFirestore.getFirestoreSettings().isSslEnabled());
      }

      firebaseFirestore.setFirestoreSettings(firestoreSettings.build());
      return null;
    });
  }
}
