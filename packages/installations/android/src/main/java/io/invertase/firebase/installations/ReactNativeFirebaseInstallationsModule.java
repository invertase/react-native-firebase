package io.invertase.firebase.installations;

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

import android.util.Log;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.installations.FirebaseInstallations;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseInstallationsModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Installations";

  ReactNativeFirebaseInstallationsModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @ReactMethod
  public void getId(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    Tasks.call(
            getExecutor(),
            () -> {
              return Tasks.await(FirebaseInstallations.getInstance(firebaseApp).getId());
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                Log.e(
                    TAG,
                    "RNFB: Unknown error while fetching Installations ID "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "id-error", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void getToken(String appName, boolean forceRefresh, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    Tasks.call(
            getExecutor(),
            () -> {
              return Tasks.await(
                  FirebaseInstallations.getInstance(firebaseApp).getToken(forceRefresh));
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult().getToken());
              } else {
                Log.e(
                    TAG,
                    "RNFB: Unknown error while fetching Installations token "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "token-error", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void delete(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    Tasks.call(
            getExecutor(),
            () -> {
              return Tasks.await(FirebaseInstallations.getInstance(firebaseApp).delete());
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                promise.resolve(null);
              } else {
                Log.e(
                    TAG,
                    "RNFB: Unknown error while deleting Installations"
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "delete-error", task.getException().getMessage());
              }
            });
  }
}
