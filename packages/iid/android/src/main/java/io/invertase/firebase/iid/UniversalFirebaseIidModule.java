package io.invertase.firebase.iid;

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
import com.google.firebase.FirebaseApp;
import com.google.firebase.iid.FirebaseInstanceId;

import io.invertase.firebase.common.UniversalFirebaseModule;

public class UniversalFirebaseIidModule extends UniversalFirebaseModule {

  UniversalFirebaseIidModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<String> get(String appName) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      return FirebaseInstanceId.getInstance(firebaseApp).getId();
    });
  }

  Task<String> getToken(String appName, String authorizedEntity, String scope) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      return FirebaseInstanceId.getInstance(firebaseApp).getToken(authorizedEntity, scope);
    });
  }

  Task<Void> delete(String appName) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseInstanceId.getInstance(firebaseApp).deleteInstanceId();
      return null;
    });
  }

  Task<Void> deleteToken(String appName, String authorizedEntity, String scope) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseInstanceId.getInstance(firebaseApp).deleteToken(authorizedEntity, scope);
      return null;
    });
  }
}
