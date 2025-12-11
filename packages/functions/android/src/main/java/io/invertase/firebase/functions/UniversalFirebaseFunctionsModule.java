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

@SuppressWarnings("WeakerAccess")
public class UniversalFirebaseFunctionsModule extends UniversalFirebaseModule {
  public static final String DATA_KEY = "data";
  public static final String CODE_KEY = "code";
  public static final String MSG_KEY = "message";
  public static final String DETAILS_KEY = "details";
  private static final String STREAMING_EVENT = "functions_streaming_event";
  private static SparseArray<Object> functionsStreamingListeners = new SparseArray<>();

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

  void httpsCallableStream(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
      Object data,
      ReadableMap options,
      int listenerId) {
    getExecutor()
        .execute(
            () -> {
              try {
                FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
                FirebaseFunctions functionsInstance =
                    FirebaseFunctions.getInstance(firebaseApp, region);

                if (host != null) {
                  functionsInstance.useEmulator(host, port);
                }

                HttpsCallableReference httpReference = functionsInstance.getHttpsCallable(name);

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
                }

                // Store the listener reference
                functionsStreamingListeners.put(listenerId, httpReference);

                // Use the Firebase SDK's native .stream() method
                httpReference
                    .stream(data)
                    .addOnSuccessListener(
                        result -> {
                          // Emit the stream data as it arrives
                          emitStreamEvent(appName, listenerId, result.getData(), false, null);
                        })
                    .addOnFailureListener(
                        exception -> {
                          // Emit error event
                          emitStreamEvent(appName, listenerId, null, true, exception.getMessage());
                          removeFunctionsStreamingListener(listenerId);
                        })
                    .addOnCompleteListener(
                        task -> {
                          // Stream completed - emit done event
                          if (task.isSuccessful()) {
                            emitStreamDone(appName, listenerId);
                          }
                          removeFunctionsStreamingListener(listenerId);
                        });
              } catch (Exception e) {
                emitStreamEvent(appName, listenerId, null, true, e.getMessage());
                removeFunctionsStreamingListener(listenerId);
              }
            });
  }

  void httpsCallableStreamFromUrl(
      String appName,
      String region,
      String host,
      Integer port,
      String url,
      Object data,
      ReadableMap options,
      int listenerId) {
    getExecutor()
        .execute(
            () -> {
              try {
                FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
                FirebaseFunctions functionsInstance =
                    FirebaseFunctions.getInstance(firebaseApp, region);

                if (host != null) {
                  functionsInstance.useEmulator(host, port);
                }

                URL parsedUrl = new URL(url);
                HttpsCallableReference httpReference =
                    functionsInstance.getHttpsCallableFromUrl(parsedUrl);

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
                }

                // Store the listener reference
                functionsStreamingListeners.put(listenerId, httpReference);

                // Use the Firebase SDK's native .stream() method
                httpReference
                    .stream(data)
                    .addOnSuccessListener(
                        result -> {
                          // Emit the stream data as it arrives
                          emitStreamEvent(appName, listenerId, result.getData(), false, null);
                        })
                    .addOnFailureListener(
                        exception -> {
                          // Emit error event
                          emitStreamEvent(appName, listenerId, null, true, exception.getMessage());
                          removeFunctionsStreamingListener(listenerId);
                        })
                    .addOnCompleteListener(
                        task -> {
                          // Stream completed - emit done event
                          if (task.isSuccessful()) {
                            emitStreamDone(appName, listenerId);
                          }
                          removeFunctionsStreamingListener(listenerId);
                        });
              } catch (Exception e) {
                emitStreamEvent(appName, listenerId, null, true, e.getMessage());
                removeFunctionsStreamingListener(listenerId);
              }
            });
  }

  void removeFunctionsStreamingListener(int listenerId) {
    Object listener = functionsStreamingListeners.get(listenerId);
    if (listener != null) {
      functionsStreamingListeners.remove(listenerId);
      // Cancel/cleanup if needed
    }
  }

  private void emitStreamEvent(
      String appName, int listenerId, Object data, boolean isError, String errorMessage) {
    WritableMap eventBody = Arguments.createMap();
    WritableMap body = Arguments.createMap();

    if (isError) {
      body.putString("error", errorMessage);
    } else if (data != null) {
      // Convert data to WritableMap/Array as needed
      // Using RCTConvertFirebase from the common module
      io.invertase.firebase.common.RCTConvertFirebase.mapPutValue("data", data, body);
    }

    eventBody.putInt("listenerId", listenerId);
    eventBody.putMap("body", body);

    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, eventBody, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }

  private void emitStreamDone(String appName, int listenerId) {
    WritableMap eventBody = Arguments.createMap();
    WritableMap body = Arguments.createMap();
    body.putBoolean("done", true);

    eventBody.putInt("listenerId", listenerId);
    eventBody.putMap("body", body);

    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, eventBody, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }
}
