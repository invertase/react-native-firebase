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

import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.Query;

import java.util.HashMap;

import io.invertase.firebase.common.UniversalFirebasePreferences;

public class UniversalFirebaseFirestoreCommon {
  private static HashMap<String, Boolean> settingsLock = new HashMap<>();

  static FirebaseFirestore getFirestoreForApp(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    FirebaseFirestore instance = FirebaseFirestore.getInstance(firebaseApp);
    setFirestoreSettings(instance, appName);

    return instance;
  }

  private static void setFirestoreSettings(FirebaseFirestore firebaseFirestore, String appName) {
    // Ensure not already been set
    if (settingsLock.containsKey(appName)) return;

    UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();
    FirebaseFirestoreSettings.Builder firestoreSettings = new FirebaseFirestoreSettings.Builder();

    int cacheSizeBytes = preferences.getIntValue(
      UniversalFirebaseFirestoreStatics.FIRESTORE_CACHE_SIZE + "_" + appName,
      (int) firebaseFirestore.getFirestoreSettings().getCacheSizeBytes()
    );

    String host = preferences.getStringValue(
      UniversalFirebaseFirestoreStatics.FIRESTORE_HOST + "_" + appName,
      firebaseFirestore.getFirestoreSettings().getHost()
    );

    boolean persistence = preferences.getBooleanValue(
      UniversalFirebaseFirestoreStatics.FIRESTORE_PERSISTENCE + "_" + appName,
      firebaseFirestore.getFirestoreSettings().isPersistenceEnabled()
    );

    boolean ssl = preferences.getBooleanValue(
      UniversalFirebaseFirestoreStatics.FIRESTORE_SSL + "_" + appName,
      firebaseFirestore.getFirestoreSettings().isSslEnabled()
    );

    if (cacheSizeBytes == -1) {
      firestoreSettings.setCacheSizeBytes(FirebaseFirestoreSettings.CACHE_SIZE_UNLIMITED);
    } else {
      firestoreSettings.setCacheSizeBytes((long) cacheSizeBytes);
    }

    firestoreSettings.setHost(host);
    firestoreSettings.setPersistenceEnabled(persistence);
    firestoreSettings.setSslEnabled(ssl);

    firebaseFirestore.setFirestoreSettings(firestoreSettings.build());

    settingsLock.put(appName, true);
  }

  static Query getQueryForFirestore(
    FirebaseFirestore firebaseFirestore,
    String path,
    String type
  ) {
    if ("collectionGroup".equals(type)) {
      return firebaseFirestore.collectionGroup(path);
    }

    return firebaseFirestore.collection(path);
  }

  static DocumentReference getDocumentForFirestore(FirebaseFirestore firebaseFirestore, String path) {
    return firebaseFirestore.document(path);
  }
}
