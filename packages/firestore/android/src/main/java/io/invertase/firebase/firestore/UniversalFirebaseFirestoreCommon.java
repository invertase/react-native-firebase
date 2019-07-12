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
import com.google.firebase.firestore.Query;

public class UniversalFirebaseFirestoreCommon {

  static FirebaseFirestore getFirestoreForApp(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    return FirebaseFirestore.getInstance(firebaseApp);
  }

  static Query getQueryForFirestore (
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
