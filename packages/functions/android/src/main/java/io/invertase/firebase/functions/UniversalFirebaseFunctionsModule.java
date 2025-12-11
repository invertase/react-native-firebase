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
import android.util.SparseArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableReference;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.net.URL;
import java.util.concurrent.TimeUnit;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okio.BufferedSource;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseFunctionsModule extends UniversalFirebaseModule {
  public static final String DATA_KEY = "data";
  public static final String CODE_KEY = "code";
  public static final String MSG_KEY = "message";
  public static final String DETAILS_KEY = "details";
  private static SparseArray<Call> functionsStreamingListeners = new SparseArray<>();

  UniversalFirebaseFunctionsModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Object> httpsCallable(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
      Object data,
      ReadableMap options) {
    return Tasks.call(
        getExecutor(),
        () -> {
          FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
          FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);

          HttpsCallableReference httpReference = functionsInstance.getHttpsCallable(name);

          if (options.hasKey("timeout")) {
            httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
          }

          if (host != null) {
            functionsInstance.useEmulator(host, port);
          }

          return Tasks.await(httpReference.call(data)).getData();
        });
  }

  Task<Object> httpsCallableFromUrl(
      String appName,
      String region,
      String host,
      Integer port,
      String url,
      Object data,
      ReadableMap options) {
    return Tasks.call(
        getExecutor(),
        () -> {
          FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
          FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);
          URL parsedUrl = new URL(url);
          HttpsCallableReference httpReference =
              functionsInstance.getHttpsCallableFromUrl(parsedUrl);

          if (options.hasKey("timeout")) {
            httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
          }

          if (host != null) {
            functionsInstance.useEmulator(host, port);
          }

          return Tasks.await(httpReference.call(data)).getData();
        });
  }

  Task<Object> httpsCallableStream(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
      Object data,
      ReadableMap options,
      int listenerId) {
    return Tasks.call(
        getExecutor(),
        () -> {
          FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
          FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);
          HttpsCallableReference httpReference = functionsInstance.getHttpsCallable.(name, data, options);
          httpReference.stream(data, options, (event) -> {
            if (event.get("done")) {
              removeFunctionsStreamingListener(appName, listenerId);
            } else {
              emitEvent(appName, listenerId, event);
            }
          });
        });
  }

  Task<Object> httpsCallableStreamFromUrl(
      String appName,
      String region,
      String host,
      Integer port,
      String url,
      Object data,
      ReadableMap options,
      int listenerId) {

    return Tasks.call(
        getExecutor(),
        () -> {
          FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
          FirebaseFunctions functionsInstance = FirebaseFunctions.getInstance(firebaseApp, region);
          URL parsedUrl = new URL(url);
          HttpsCallableReference httpReference = functionsInstance.getHttpsCallableFromUrl(parsedUrl);
        httpReference.stream(data, options, (event) -> {
            if (event.get("done")) {
              removeFunctionsStreamingListener(appName, listenerId);
            } else {
              emitEvent(appName, listenerId, event);
            }
          });
        return Tasks.await(httpReference.call(data)).getData();
        });
  } 

  private void emitEvent(String appName, int listenerId, WritableMap body) {
    ReactNativeFirebaseEventEmitter.emitEvent(
        appName, "functions_streaming_event", Arguments.createMap().putMap("body", body));
  }

  private void emitDone(String appName, int listenerId) {
    WritableMap body = Arguments.createMap();
    body.putBoolean("done", true);
    emitEvent(appName, listenerId, body);
  }
}
