package io.invertase.firebase.app;

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
import android.util.Log;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class ReactNativeFirebaseApp {
  private static Context applicationContext;

  public static Context getApplicationContext() {
    return applicationContext;
  }

  public static void setApplicationContext(Context applicationContext) {
    Log.d("ReactNativeFirebaseApp", "received application context.");
    ReactNativeFirebaseApp.applicationContext = applicationContext;
  }

  public static void initializeSecondaryApp(String name) {
    FirebaseOptions options = FirebaseOptions.fromResource(applicationContext);
    FirebaseApp.initializeApp(applicationContext, options, name);
  }

  public static void initializeSecondaryApp(String name, Context applicationContext) {
    FirebaseOptions options = FirebaseOptions.fromResource(applicationContext);
    FirebaseApp.initializeApp(applicationContext, options, name);
  }
}
