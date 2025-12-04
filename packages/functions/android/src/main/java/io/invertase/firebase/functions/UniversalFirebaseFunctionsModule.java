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

  // -------------------- Streaming Support (Android only) --------------------
  // Streaming targets HTTP (onRequest) endpoints that emit SSE/NDJSON.

  void httpsCallableStream(
      String appName,
      String region,
      String host,
      Integer port,
      String name,
      Object data,
      ReadableMap options,
      Integer listenerId) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    String projectId = firebaseApp.getOptions().getProjectId();
    String url;
    if (host != null) {
      url = "http://" + host + ":" + port + "/" + projectId + "/" + region + "/" + name;
    } else {
      url = "https://" + region + "-" + projectId + ".cloudfunctions.net/" + name;
    }
    startHttpStream(appName, host, port, url, listenerId);
  }

  void httpsCallableStreamFromUrl(
      String appName,
      String region,
      String host,
      Integer port,
      String url,
      Object data,
      ReadableMap options,
      Integer listenerId) {
    startHttpStream(appName, host, port, url, listenerId);
  }

  public static void cancelHttpsCallableStream(Integer listenerId) {
    synchronized (functionsStreamingListeners) {
      Call call = functionsStreamingListeners.get(listenerId);
      if (call != null) {
        try {
          call.cancel();
        } catch (Exception ignore) {
        }
        functionsStreamingListeners.remove(listenerId);
      }
    }
  }

  private void startHttpStream(
      String appName, String host, Integer port, String url, Integer listenerId) {
    getExecutor()
        .execute(
            () -> {
              OkHttpClient client =
                  new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
              HttpUrl parsed = HttpUrl.parse(url);
              if (parsed == null) {
                emitError(appName, listenerId, "invalid_url");
                return;
              }
              HttpUrl.Builder builder = parsed.newBuilder();
              if (host != null && port != null) {
                builder.scheme("http").host(host).port(port);
              }
              HttpUrl finalUrl = builder.build();
              Request request =
                  new Request.Builder()
                      .url(finalUrl)
                      .addHeader("Accept", "text/event-stream, application/x-ndjson, */*")
                      .build();
              Call call = client.newCall(request);
              synchronized (functionsStreamingListeners) {
                functionsStreamingListeners.put(listenerId, call);
              }
              call.enqueue(
                  new Callback() {
                    @Override
                    public void onFailure(Call call, java.io.IOException e) {
                      emitError(appName, listenerId, e.getMessage());
                      synchronized (functionsStreamingListeners) {
                        functionsStreamingListeners.remove(listenerId);
                      }
                    }

                    @Override
                    public void onResponse(Call call, Response response) {
                      try (ResponseBody body = response.body()) {
                        if (!response.isSuccessful()) {
                          emitError(
                              appName,
                              listenerId,
                              "http_error_" + response.code() + "_" + response.message());
                          return;
                        }
                        if (body == null) {
                          emitError(appName, listenerId, "empty_response_body");
                          return;
                        }
                        BufferedSource source = body.source();
                        while (!source.exhausted()) {
                          String line = source.readUtf8Line();
                          if (line == null) {
                            break;
                          }
                          String payload = line.startsWith("data: ") ? line.substring(6) : line;
                          WritableMap map = Arguments.createMap();
                          map.putString("text", payload);
                          emitEvent(appName, listenerId, map);
                        }
                        WritableMap done = Arguments.createMap();
                        done.putBoolean("done", true);
                        emitEvent(appName, listenerId, done);
                      } catch (Exception e) {
                        emitError(appName, listenerId, e.getMessage());
                      } finally {
                        synchronized (functionsStreamingListeners) {
                          functionsStreamingListeners.remove(listenerId);
                        }
                      }
                    }
                  });
            });
  }

  private void emitEvent(String appName, int listenerId, WritableMap body) {
    ReactNativeFirebaseEventEmitter.getSharedInstance()
        .sendEvent(
            new ReactNativeFirebaseFunctionsEvent(
                ReactNativeFirebaseFunctionsEvent.FUNCTIONS_STREAMING_EVENT,
                body,
                appName,
                listenerId));
  }

  private void emitError(String appName, int listenerId, String message) {
    WritableMap body = Arguments.createMap();
    body.putString("error", message != null ? message : "unknown_error");
    emitEvent(appName, listenerId, body);
  }
}
