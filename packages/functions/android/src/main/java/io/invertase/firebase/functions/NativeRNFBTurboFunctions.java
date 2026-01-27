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

import android.util.SparseArray;
import com.facebook.fbreact.specs.NativeRNFBTurboFunctionsSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.FirebaseFunctionsException;
import com.google.firebase.functions.HttpsCallableOptions;
import com.google.firebase.functions.HttpsCallableReference;
import com.google.firebase.functions.StreamResponse;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.TaskExecutorService;
import java.io.IOException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;
import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

public class NativeRNFBTurboFunctions extends NativeRNFBTurboFunctionsSpec {
  private static final String SERVICE_NAME = "Functions";
  private static final String DATA_KEY = "data";
  private static final String CODE_KEY = "code";
  private static final String MSG_KEY = "message";
  private static final String DETAILS_KEY = "details";
  private static final String STREAMING_EVENT = "functions_streaming_event";

  private static final SparseArray<Object> functionsStreamingListeners = new SparseArray<>();
  private final TaskExecutorService executorService;

  public NativeRNFBTurboFunctions(ReactApplicationContext reactContext) {
    super(reactContext);
    this.executorService = new TaskExecutorService("Universal" + SERVICE_NAME + "Module");
  }

  private ExecutorService getExecutor() {
    return executorService.getExecutor();
  }

  @Override
  public void httpsCallable(
      String appName,
      String region,
      String emulatorHost,
      double emulatorPort,
      String name,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {

    Object callableData = data.toHashMap().get(DATA_KEY);
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    Task<Object> callMethodTask =
        httpsCallableInternal(appName, region, emulatorHost, port, name, null, callableData, options);

    callMethodTask.addOnSuccessListener(
        getExecutor(),
        result -> promise.resolve(RCTConvertFirebase.mapPutValue(DATA_KEY, result, Arguments.createMap())));

    callMethodTask.addOnFailureListener(
        getExecutor(), exception -> handleFunctionsException(exception, promise));
  }

  @Override
  public void httpsCallableFromUrl(
      String appName,
      String region,
      String emulatorHost,
      double emulatorPort,
      String url,
      ReadableMap data,
      ReadableMap options,
      Promise promise) {

    Object callableData = data.toHashMap().get(DATA_KEY);
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    Task<Object> callMethodTask =
        httpsCallableInternal(appName, region, emulatorHost, port, null, url, callableData, options);

    callMethodTask.addOnSuccessListener(
        getExecutor(),
        result -> promise.resolve(RCTConvertFirebase.mapPutValue(DATA_KEY, result, Arguments.createMap())));

    callMethodTask.addOnFailureListener(
        getExecutor(), exception -> handleFunctionsException(exception, promise));
  }

  @Override
  public void httpsCallableStream(
      String appName,
      String region,
      String emulatorHost,
      double emulatorPort,
      String name,
      ReadableMap data,
      ReadableMap options,
      double listenerId) {
    Object callableData = data.toHashMap().get(DATA_KEY);
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    httpsCallableStreamSetup(
        appName, region, emulatorHost, port, name, null, callableData, options, (int) listenerId);
  }

  @Override
  public void httpsCallableStreamFromUrl(
      String appName,
      String region,
      String emulatorHost,
      double emulatorPort,
      String url,
      ReadableMap data,
      ReadableMap options,
      double listenerId) {

    Object callableData = data.toHashMap().get(DATA_KEY);
    Integer port = emulatorHost != null ? (int) emulatorPort : null;

    httpsCallableStreamSetup(
        appName, region, emulatorHost, port, null, url, callableData, options, (int) listenerId);
  }

  @Override
  public void removeFunctionsStreaming(String appName, String region, double listenerId) {
    removeFunctionsStreamingListener((int) listenerId);
  }

  // Internal implementation methods

  private Task<Object> httpsCallableInternal(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
      String url,
      Object data,
      ReadableMap options) {
    TaskCompletionSource<Object> taskCompletionSource = new TaskCompletionSource<>();

    getExecutor()
        .execute(
            () -> {
              try {
                FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
                FirebaseFunctions functionsInstance =
                    FirebaseFunctions.getInstance(firebaseApp, region);

                // Get limitedUseAppCheckTokens from options (defaults to false)
                boolean limitedUseAppCheckTokens = false;
                if (options.hasKey("limitedUseAppCheckTokens")) {
                  limitedUseAppCheckTokens = options.getBoolean("limitedUseAppCheckTokens");
                }

                // Create HttpsCallableOptions with limitedUseAppCheckTokens
                HttpsCallableOptions callableOptions = new HttpsCallableOptions.Builder()
                    .setLimitedUseAppCheckTokens(limitedUseAppCheckTokens)
                    .build();

                // Create reference based on which parameter is provided
                HttpsCallableReference httpReference;
                if (url != null) {
                  URL parsedUrl = new URL(url);
                  httpReference = functionsInstance.getHttpsCallableFromUrl(parsedUrl, callableOptions);
                } else {
                  httpReference = functionsInstance.getHttpsCallable(name, callableOptions);
                }

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout(options.getInt("timeout"), TimeUnit.SECONDS);
                }

                if (host != null) {
                  functionsInstance.useEmulator(host, port);
                }

                Object result = Tasks.await(httpReference.call(data)).getData();
                taskCompletionSource.setResult(result);
              } catch (Exception e) {
                taskCompletionSource.setException(e);
              }
            });

    return taskCompletionSource.getTask();
  }

  private void httpsCallableStreamSetup(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
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

                // Get limitedUseAppCheckTokens from options (defaults to false)
                boolean limitedUseAppCheckTokens = false;
                if (options.hasKey("limitedUseAppCheckTokens")) {
                  limitedUseAppCheckTokens = options.getBoolean("limitedUseAppCheckTokens");
                }

                // Create HttpsCallableOptions with limitedUseAppCheckTokens
                HttpsCallableOptions callableOptions = new HttpsCallableOptions.Builder()
                    .setLimitedUseAppCheckTokens(limitedUseAppCheckTokens)
                    .build();

                // Create reference based on which parameter is provided
                HttpsCallableReference httpReference;
                if (url != null) {
                  URL parsedUrl = new URL(url);
                  httpReference = functionsInstance.getHttpsCallableFromUrl(parsedUrl, callableOptions);
                } else {
                  httpReference = functionsInstance.getHttpsCallable(name, callableOptions);
                }

                if (options.hasKey("timeout")) {
                  httpReference.setTimeout(options.getInt("timeout"), TimeUnit.SECONDS);
                }

                Publisher<StreamResponse> publisher = httpReference.stream(data);

                publisher.subscribe(
                  new Subscriber<>() {

                    @Override
                    public void onSubscribe(Subscription s) {
                      functionsStreamingListeners.put(listenerId, s);
                      s.request(Long.MAX_VALUE);
                    }

                    @Override
                    public void onNext(StreamResponse streamResponse) {

                        Object responseData = null;
                        boolean isFinalResult = false;

                        if (streamResponse instanceof StreamResponse.Message message) {
                          responseData = message.getMessage().getData();
                        } else if (streamResponse instanceof StreamResponse.Result result) {
                          responseData = result.getResult().getData();
                          isFinalResult = true;
                        }

                        if (isFinalResult) {
                          emitStreamEventWithDone(appName, listenerId, responseData);
                          removeFunctionsStreamingListener(listenerId);
                        } else {
                          emitStreamEvent(appName, listenerId, responseData, false, null);
                        }
                    }

                    @Override
                    public void onError(Throwable t) {
                      WritableMap errorMap = createErrorMap(t);
                      emitStreamEvent(appName, listenerId, null, true, errorMap);
                      removeFunctionsStreamingListener(listenerId);
                    }

                    @Override
                    public void onComplete() {
                      Object listener = functionsStreamingListeners.get(listenerId);
                      if (listener != null) {
                        emitStreamEventWithDone(appName, listenerId, null);
                        removeFunctionsStreamingListener(listenerId);
                      }
                    }
                  });
              } catch (Exception e) {
                WritableMap errorMap = createErrorMap(e);
                emitStreamEvent(appName, listenerId, null, true, errorMap);
                removeFunctionsStreamingListener(listenerId);
              }
            });
  }

  private void removeFunctionsStreamingListener(int listenerId) {
    Object listener = functionsStreamingListeners.get(listenerId);
    if (listener != null) {
      if (listener instanceof Subscription) {
        ((Subscription) listener).cancel();
      }
      functionsStreamingListeners.remove(listenerId);
    }
  }

  private void emitStreamEvent(
      String appName, int listenerId, Object data, boolean isError, WritableMap errorMap) {
    WritableMap body = Arguments.createMap();

    if (isError) {
      body.putMap("error", errorMap);
      body.putBoolean("done", true);
    } else {
      body.putBoolean("done", false);
      if (data != null) {
        RCTConvertFirebase.mapPutValue("data", data, body);
      }
    }

    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, body, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }

  private void emitStreamEventWithDone(String appName, int listenerId, Object data) {
    WritableMap body = Arguments.createMap();
    body.putBoolean("done", true);

    if (data != null) {
      RCTConvertFirebase.mapPutValue("data", data, body);
    }

    FirebaseFunctionsStreamHandler handler =
        new FirebaseFunctionsStreamHandler(STREAMING_EVENT, body, appName, listenerId);

    ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(handler);
  }

  private void handleFunctionsException(Exception exception, Promise promise) {
    WritableMap errorMap = createErrorMap(exception);
    
    String code = errorMap.getString(CODE_KEY);
    String message = errorMap.getString(MSG_KEY);
    
    promise.reject(code, message, exception, errorMap);
  }

  private WritableMap createErrorMap(Throwable throwable) {
    Object details = null;
    String code = "UNKNOWN";
    String message = throwable.getMessage() != null ? throwable.getMessage() : throwable.toString();

    // Check if the throwable contains a FirebaseFunctionsException
    if (throwable.getCause() != null && throwable.getCause() instanceof FirebaseFunctionsException) {
      FirebaseFunctionsException functionsException = (FirebaseFunctionsException) throwable.getCause();
      details = functionsException.getDetails();
      code = functionsException.getCode().name();
      message = functionsException.getMessage();
      String timeout = FirebaseFunctionsException.Code.DEADLINE_EXCEEDED.name();
      boolean isTimeout = code.contains(timeout);

      if (functionsException.getCause() instanceof IOException && !isTimeout) {
        code = FirebaseFunctionsException.Code.UNAVAILABLE.name();
        message = FirebaseFunctionsException.Code.UNAVAILABLE.name();
      }
    } else if (throwable instanceof FirebaseFunctionsException) {
      FirebaseFunctionsException functionsException = (FirebaseFunctionsException) throwable;
      details = functionsException.getDetails();
      code = functionsException.getCode().name();
      message = functionsException.getMessage();
      String timeout = FirebaseFunctionsException.Code.DEADLINE_EXCEEDED.name();
      boolean isTimeout = code.contains(timeout);

      if (functionsException.getCause() instanceof IOException && !isTimeout) {
        code = FirebaseFunctionsException.Code.UNAVAILABLE.name();
        message = FirebaseFunctionsException.Code.UNAVAILABLE.name();
      }
    }

    WritableMap errorMap = Arguments.createMap();
    errorMap.putString(CODE_KEY, code);
    errorMap.putString(MSG_KEY, message);
    RCTConvertFirebase.mapPutValue(DETAILS_KEY, details, errorMap);
    
    return errorMap;
  }

  @Override
  public void invalidate() {
    super.invalidate();

    // Cancel all active streaming listeners before shutdown
    for (int i = 0; i < functionsStreamingListeners.size(); i++) {
      int listenerId = functionsStreamingListeners.keyAt(i);
      Object listener = functionsStreamingListeners.get(listenerId);
      if (listener instanceof Subscription) {
        ((Subscription) listener).cancel();
      }
    }
    functionsStreamingListeners.clear();

    executorService.shutdown();
  }
}
