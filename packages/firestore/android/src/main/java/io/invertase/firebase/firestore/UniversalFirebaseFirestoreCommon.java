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
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.Query;

import java.util.WeakHashMap;
import java.lang.ref.WeakReference;

import io.invertase.firebase.common.UniversalFirebasePreferences;

public class UniversalFirebaseFirestoreCommon {
  static WeakHashMap<String, WeakReference<FirebaseFirestore>> instanceCache = new WeakHashMap<>();

  static FirebaseFirestore getFirestoreForApp(String appName) {
    WeakReference<FirebaseFirestore> cachedInstance = instanceCache.get(appName);

    if(cachedInstance != null){
      return cachedInstance.get();
    }

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    FirebaseFirestore instance = FirebaseFirestore.getInstance(firebaseApp);

    setFirestoreSettings(instance, appName);

    instanceCache.put(appName, new WeakReference<FirebaseFirestore>(instance));

    return instance;
  }

  private static void setFirestoreSettings(FirebaseFirestore firebaseFirestore, String appName) {

    UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();
    FirebaseFirestoreSettings.Builder firestoreSettings = new FirebaseFirestoreSettings.Builder();

    String cacheSizeKey = UniversalFirebaseFirestoreStatics.FIRESTORE_CACHE_SIZE + "_" + appName;
    String hostKey = UniversalFirebaseFirestoreStatics.FIRESTORE_HOST + "_" + appName;
    String persistenceKey = UniversalFirebaseFirestoreStatics.FIRESTORE_PERSISTENCE + "_" + appName;
    String sslKey = UniversalFirebaseFirestoreStatics.FIRESTORE_SSL + "_" + appName;


    int cacheSizeBytes = preferences.getIntValue(
      cacheSizeKey,
      (int) firebaseFirestore.getFirestoreSettings().getCacheSizeBytes()
    );

    String host = preferences.getStringValue(
      hostKey,
      firebaseFirestore.getFirestoreSettings().getHost()
    );

    boolean persistence = preferences.getBooleanValue(
      persistenceKey,
      firebaseFirestore.getFirestoreSettings().isPersistenceEnabled()
    );

    boolean ssl = preferences.getBooleanValue(
      sslKey,
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


    preferences.remove(cacheSizeKey).remove(hostKey).remove(persistenceKey).remove(sslKey).apply();
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
