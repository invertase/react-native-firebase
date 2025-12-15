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
import com.google.firebase.functions.StreamResponse;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.net.URL;
import java.util.concurrent.TimeUnit;
import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

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
                  android.util.Log.d(
                      "RNFBFunctions",
                      "httpsCallableStream starting for: " + name + ", listenerId: " + listenerId);
                  FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
                FirebaseFunctions functionsInstance =
                    FirebaseFunctions.getInstance(firebaseApp, region);

                if (host != null) {
                  functionsInstance.useEmulator(host, port);
                  android.util.Log.d("RNFBFunctions", "Using emulator: " + host + ":" + port);
                }

                HttpsCallableReference httpReference = functionsInstance.getHttpsCallable(name);

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
                }

                android.util.Log.d("RNFBFunctions", "About to call .stream() method");
                // Use the Firebase SDK's native .stream() method which returns a Publisher
                Publisher<StreamResponse> publisher = httpReference.stream(data);
                android.util.Log.d("RNFBFunctions", "Stream publisher created successfully");

                // Subscribe to the publisher
                publisher.subscribe(
                    new Subscriber<StreamResponse>() {
                      private Subscription subscription;

                      @Override
                      public void onSubscribe(Subscription s) {
                        subscription = s;
                        functionsStreamingListeners.put(listenerId, subscription);
                        s.request(Long.MAX_VALUE); // Request all items
                      }

                      @Override
                      public void onNext(StreamResponse streamResponse) {
                        // Emit the stream data as it arrives
                        emitStreamEvent(
                            appName,
                            listenerId,
                            null,
                            false,
                            null); // TODO: Extract data from StreamResponse
                      }

                      @Override
                      public void onError(Throwable t) {
                        // Emit error event
                        android.util.Log.e("RNFBFunctions", "Stream onError for " + name, t);
                        String errorMsg = t.getMessage() != null ? t.getMessage() : t.toString();
                        emitStreamEvent(appName, listenerId, null, true, errorMsg);
                        removeFunctionsStreamingListener(listenerId);
                      }

                      @Override
                      public void onComplete() {
                        // Stream completed - emit done event
                        android.util.Log.d("RNFBFunctions", "Stream onComplete for " + name);
                        emitStreamDone(appName, listenerId);
                        removeFunctionsStreamingListener(listenerId);
                      }
                    });
                } catch (Exception e) {
                  android.util.Log.e(
                      "RNFBFunctions", "Exception in httpsCallableStream for " + name, e);
                  String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                  emitStreamEvent(
                      appName, listenerId, null, true, "Stream setup failed: " + errorMsg);
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
                  android.util.Log.d(
                      "RNFBFunctions",
                      "httpsCallableStreamFromUrl starting for: "
                          + url
                          + ", listenerId: "
                          + listenerId);
                  FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
                FirebaseFunctions functionsInstance =
                    FirebaseFunctions.getInstance(firebaseApp, region);

                if (host != null) {
                  functionsInstance.useEmulator(host, port);
                  android.util.Log.d("RNFBFunctions", "Using emulator: " + host + ":" + port);
                }

                URL parsedUrl = new URL(url);
                HttpsCallableReference httpReference =
                    functionsInstance.getHttpsCallableFromUrl(parsedUrl);

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout((long) options.getInt("timeout"), TimeUnit.SECONDS);
                }

                  android.util.Log.d("RNFBFunctions", "About to call .stream() method on URL");
                  // Use the Firebase SDK's native .stream() method which returns a Publisher
                  Publisher<StreamResponse> publisher = httpReference.stream(data);
                  android.util.Log.d(
                      "RNFBFunctions", "Stream publisher created successfully from URL");

                // Subscribe to the publisher
                publisher.subscribe(
                    new Subscriber<StreamResponse>() {
                      private Subscription subscription;

                      @Override
                      public void onSubscribe(Subscription s) {
                        subscription = s;
                        functionsStreamingListeners.put(listenerId, subscription);
                        s.request(Long.MAX_VALUE); // Request all items
                      }

                      @Override
                      public void onNext(StreamResponse streamResponse) {
                        // Emit the stream data as it arrives
                        emitStreamEvent(
                            appName,
                            listenerId,
                            null,
                            false,
                            null); // TODO: Extract data from StreamResponse
                      }

                      @Override
                      public void onError(Throwable t) {
                        // Emit error event
                        android.util.Log.e("RNFBFunctions", "Stream onError for URL: " + url, t);
                        String errorMsg = t.getMessage() != null ? t.getMessage() : t.toString();
                        emitStreamEvent(appName, listenerId, null, true, errorMsg);
                        removeFunctionsStreamingListener(listenerId);
                      }

                      @Override
                      public void onComplete() {
                        // Stream completed - emit done event
                        android.util.Log.d("RNFBFunctions", "Stream onComplete for URL: " + url);
                        emitStreamDone(appName, listenerId);
                        removeFunctionsStreamingListener(listenerId);
                      }
                    });
                } catch (Exception e) {
                  android.util.Log.e(
                      "RNFBFunctions", "Exception in httpsCallableStreamFromUrl for " + url, e);
                  String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                  emitStreamEvent(
                      appName, listenerId, null, true, "Stream setup failed: " + errorMsg);
                  removeFunctionsStreamingListener(listenerId);
              }
            });
  }

  void removeFunctionsStreamingListener(int listenerId) {
    Object listener = functionsStreamingListeners.get(listenerId);
    if (listener != null) {
      // Cancel the subscription if it's still active
      if (listener instanceof Subscription) {
        ((Subscription) listener).cancel();
      }
      functionsStreamingListeners.remove(listenerId);
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
