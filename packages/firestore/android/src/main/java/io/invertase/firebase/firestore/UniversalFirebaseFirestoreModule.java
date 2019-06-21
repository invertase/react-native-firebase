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
}
