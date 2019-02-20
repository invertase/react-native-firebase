package io.invertase.firebase.perf;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.HttpMetric;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebasePerfModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Perf";
  private static SparseArray<Trace> traces = new SparseArray<>();
  private static SparseArray<HttpMetric> httpMetrics = new SparseArray<>();

  ReactNativeFirebasePerfModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();
    traces.clear();
    httpMetrics.clear();
  }

  @ReactMethod
  public void setPerformanceCollectionEnabled(Boolean enabled, Promise promise) {
    FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
    promise.resolve(FirebasePerformance.getInstance().isPerformanceCollectionEnabled());
  }

  @ReactMethod
  public void startTrace(int id, String identifier, Promise promise) {
    try {
      Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
      traces.put(id, trace);
      trace.start();
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void stopTrace(int id, ReadableMap traceData, Promise promise) {
    try {
      Trace trace = traces.get(id);

      ReadableMap metrics = traceData.getMap("metrics");
      ReadableMap attributes = traceData.getMap("attributes");

      ReadableMapKeySetIterator metricKeySetIterator = metrics.keySetIterator();
      ReadableMapKeySetIterator attrKeySetIterator = attributes.keySetIterator();

      while (attrKeySetIterator.hasNextKey()) {
        String attrName = attrKeySetIterator.nextKey();
        trace.putAttribute(attrName, attributes.getString(attrName));
      }

      while (metricKeySetIterator.hasNextKey()) {
        String metricName = metricKeySetIterator.nextKey();
        trace.putMetric(metricName, metrics.getInt(metricName));
      }

      trace.stop();
      traces.remove(id);

      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void startHttpMetric(int id, String url, String httpMethod, Promise promise) {
    try {
      HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(url, httpMethod);

      httpMetrics.put(id, httpMetric);
      httpMetric.start();

      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

  @ReactMethod
  public void stopHttpMetric(int id, ReadableMap metricData, Promise promise) {
    try {
      HttpMetric httpMetric = httpMetrics.get(id);

      if (metricData.hasKey("httpResponseCode")) {
        httpMetric.setHttpResponseCode(metricData.getInt("httpResponseCode"));
      }

      if (metricData.hasKey("requestPayloadSize")) {
        httpMetric.setRequestPayloadSize(metricData.getInt("requestPayloadSize"));
      }

      if (metricData.hasKey("responsePayloadSize")) {
        httpMetric.setResponsePayloadSize(metricData.getInt("responsePayloadSize"));
      }

      if (metricData.hasKey("responseContentType")) {
        httpMetric.setResponseContentType(metricData.getString("responseContentType"));
      }

      ReadableMap attributes = metricData.getMap("attributes");
      ReadableMapKeySetIterator attrKeySetIterator = attributes.keySetIterator();

      while (attrKeySetIterator.hasNextKey()) {
        String attrName = attrKeySetIterator.nextKey();
        httpMetric.putAttribute(attrName, attributes.getString(attrName));
      }

      httpMetric.stop();
      httpMetrics.remove(id);
      promise.resolve(null);
    } catch (Exception exception) {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }


  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
      "isPerformanceCollectionEnabled",
      FirebasePerformance.getInstance().isPerformanceCollectionEnabled()
    );
    return constants;
  }
}
