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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.Source;

import java.util.concurrent.Executor;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.rejectPromiseFirestoreException;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getFirestoreForApp;
import static io.invertase.firebase.firestore.UniversalFirebaseFirestoreCommon.getQueryForFirestore;

public class ReactNativeFirebaseFirestoreCollectionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "FirestoreCollection";

  public ReactNativeFirebaseFirestoreCollectionModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void collectionGet(
    String appName,
    String path,
    String type,
    ReadableArray filters,
    ReadableArray orders,
    ReadableMap options,
    ReadableMap getOptions,
    Promise promise
  ) {
    FirebaseFirestore firebaseFirestore = getFirestoreForApp(appName);
    ReactNativeFirebaseFirestoreQuery query = new ReactNativeFirebaseFirestoreQuery(
      getQueryForFirestore(firebaseFirestore, path, type),
      filters,
      orders,
      options
    );

    Source source;

    if (getOptions != null && getOptions.hasKey("source")) {
      String optionsSource = getOptions.getString("source");
      if ("server".equals(optionsSource)) {
        source = Source.SERVER;
      } else if ("cache".equals(optionsSource)) {
        source = Source.CACHE;
      } else {
        source = Source.DEFAULT;
      }
    } else {
      source = Source.DEFAULT;
    }

    query.get(getExecutor(), source)
      .addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult());
      } else {
        rejectPromiseFirestoreException(promise, task.getException());
      }
    });
  }
}
