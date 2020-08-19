package io.invertase.firebase.functions;

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

import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableReference;

import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.concurrent.TimeUnit;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseFunctionsModule extends UniversalFirebaseModule {
  public static final String DATA_KEY = "data";
  public static final String CODE_KEY = "code";
  public static final String MSG_KEY = "message";
  public static final String DETAILS_KEY = "details";

  UniversalFirebaseFunctionsModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Object> httpsCallable(
    String appName,
    String region,
    String origin,
    String name,
    Object data,
    ReadableMap options
  ) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);

      HttpsCallableReference httpReference = functionsInstance.getHttpsCallable(name);

      if (options.hasKey("timeout")) {
        httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
      }

      if (origin != null) {
        functionsInstance.useFunctionsEmulator(origin);
      }

      return Tasks.await(httpReference.call(data)).getData();
    });
  }

}
