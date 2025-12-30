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

                // Use the Firebase SDK's native .stream() method which returns a Publisher
                Publisher<StreamResponse> publisher = httpReference.stream(data);

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
                        try {
                          // Extract data from StreamResponse
                          Object responseData = null;
                          boolean isFinalResult = false;
                          
                          // Check if it's a Message (chunk) or Result (final)
                          // StreamResponse is a sealed class with Message and Result subtypes
                          if (streamResponse instanceof StreamResponse.Message) {
                            StreamResponse.Message message = (StreamResponse.Message) streamResponse;
                            // Message has a getMessage() method that returns a Message object with getData()
                            if (message.getMessage() != null) {
                              responseData = message.getMessage().getData();
                            }
                            isFinalResult = false;
                          } else if (streamResponse instanceof StreamResponse.Result) {
                            StreamResponse.Result result = (StreamResponse.Result) streamResponse;
                            // Result has a getResult() method that returns a Result object with getData()
                            if (result.getResult() != null) {
                              responseData = result.getResult().getData();
                            }
                            isFinalResult = true;
                          }
                          
                          // Emit the stream data as it arrives
                          // For final result, emit with done=true and include the data
                          if (isFinalResult) {
                            emitStreamEventWithDone(appName, listenerId, responseData);
                            removeFunctionsStreamingListener(listenerId);
                          } else {
                            emitStreamEvent(
                                appName,
                                listenerId,
                                responseData,
                                false,
                                null);
                          }
                        } catch (Exception e) {
                          // Handle any errors during data extraction
                          String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                          emitStreamEvent(appName, listenerId, null, true, "Data extraction error: " + errorMsg);
                          removeFunctionsStreamingListener(listenerId);
                        }
                      }

                      @Override
                      public void onError(Throwable t) {
                        // Emit error event
                        String errorMsg = t.getMessage() != null ? t.getMessage() : t.toString();
                        emitStreamEvent(appName, listenerId, null, true, errorMsg);
                        removeFunctionsStreamingListener(listenerId);
                      }

                      @Override
                      public void onComplete() {
                        // Stream completed - emit done event only if we haven't already handled a Result
                        // Only emit done if listener still exists (Result was not received in onNext)
                        Object listener = functionsStreamingListeners.get(listenerId);
                        if (listener != null) {
                          emitStreamDone(appName, listenerId);
                          removeFunctionsStreamingListener(listenerId);
                        }
                      }
                    });
              } catch (Exception e) {
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
                        try {
                          // Extract data from StreamResponse
                          Object responseData = null;
                          boolean isFinalResult = false;
                          
                          android.util.Log.d("RNFBFunctions", "onNext received for URL: " + url + ", listenerId: " + listenerId);
                          
                          // Check if it's a Message (chunk) or Result (final)
                          // StreamResponse is a sealed class with Message and Result subtypes
                          if (streamResponse instanceof StreamResponse.Message) {
                            StreamResponse.Message message = (StreamResponse.Message) streamResponse;
                            // Message has a getMessage() method that returns a Message object with getData()
                            responseData = message.getMessage().getData();
                            isFinalResult = false;
                            android.util.Log.d("RNFBFunctions", "Received Message chunk for URL, data: " + (responseData != null ? responseData.toString() : "null"));
                          } else if (streamResponse instanceof StreamResponse.Result) {
                            StreamResponse.Result result = (StreamResponse.Result) streamResponse;
                            // Result has a getResult() method that returns a Result object with getData()
                            responseData = result.getResult().getData();
                            isFinalResult = true;
                            android.util.Log.d("RNFBFunctions", "Received Result (final) for URL, data: " + (responseData != null ? responseData.toString() : "null"));
                          } else {
                            android.util.Log.w("RNFBFunctions", "Unknown StreamResponse type for URL: " + streamResponse.getClass().getName());
                          }
                          
                          // Emit the stream data as it arrives
                          // For final result, emit with done=true and include the data
                          if (isFinalResult) {
                            android.util.Log.d("RNFBFunctions", "Emitting final result with done=true for URL");
                            emitStreamEventWithDone(appName, listenerId, responseData);
                            removeFunctionsStreamingListener(listenerId);
                          } else {
                            android.util.Log.d("RNFBFunctions", "Emitting chunk for URL");
                            emitStreamEvent(
                                appName,
                                listenerId,
                                responseData,
                                false,
                                null);
                          }
                        } catch (Exception e) {
                          // Handle any errors during data extraction
                          android.util.Log.e("RNFBFunctions", "Error extracting data from StreamResponse for URL: " + url, e);
                          String errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                          emitStreamEvent(appName, listenerId, null, true, "Data extraction error: " + errorMsg);
                          removeFunctionsStreamingListener(listenerId);
                        }
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
                        // Stream completed - emit done event only if we haven't already handled a Result
                        android.util.Log.d("RNFBFunctions", "Stream onComplete for URL: " + url + ", listenerId: " + listenerId);
                        // Only emit done if listener still exists (Result was not received in onNext)
                        Object listener = functionsStreamingListeners.get(listenerId);
                        if (listener != null) {
                          android.util.Log.d("RNFBFunctions", "Emitting done event via onComplete for URL");
                          emitStreamDone(appName, listenerId);
                          removeFunctionsStreamingListener(listenerId);
                        } else {
                          android.util.Log.d("RNFBFunctions", "Listener already removed, skipping done event for URL");
                        }
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
    WritableMap body = Arguments.createMap();

    if (isError) {
      body.putString("error", errorMessage);
      body.putBoolean("done", true);
    } else {
      // For non-error events, explicitly set done to false for chunks
      body.putBoolean("done", false);
      if (data != null) {
        // Convert data to WritableMap/Array as needed
        // Using RCTConvertFirebase from the common module
        io.invertase.firebase.common.RCTConvertFirebase.mapPutValue("data", data, body);
      }
    }

    // FirebaseFunctionsStreamHandler.getEventBody() will wrap this with listenerId, appName, etc.
    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, body, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }

  private void emitStreamDone(String appName, int listenerId) {
    WritableMap body = Arguments.createMap();
    body.putBoolean("done", true);

    // FirebaseFunctionsStreamHandler.getEventBody() will wrap this with listenerId, appName, etc.
    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, body, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }

  private void emitStreamEventWithDone(String appName, int listenerId, Object data) {
    WritableMap body = Arguments.createMap();
    body.putBoolean("done", true);

    if (data != null) {
      // Convert data to WritableMap/Array as needed
      io.invertase.firebase.common.RCTConvertFirebase.mapPutValue("data", data, body);
    }

    // FirebaseFunctionsStreamHandler.getEventBody() will wrap this with listenerId, appName, etc.
    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, body, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }
}
