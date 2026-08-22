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

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.HttpMetric;
import com.google.firebase.perf.metrics.Trace;
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class UniversalFirebasePerfModule extends UniversalFirebaseModule {
  private static final RNFBPerfHandleRegistry<Trace> traces = new RNFBPerfHandleRegistry<>();
  private static final RNFBPerfHandleRegistry<ScreenTrace> screenTraces =
      new RNFBPerfHandleRegistry<>();
  private static final RNFBPerfHandleRegistry<HttpMetric> httpMetrics =
      new RNFBPerfHandleRegistry<>();

  UniversalFirebasePerfModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  @Override
  public void onTearDown() {
    super.onTearDown();
    // Drop mappings only — matches prior SparseArray.clear() (no stop/cancel).
    traces.takeAll();
    httpMetrics.takeAll();
    screenTraces.takeAll();
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
        "isPerformanceCollectionEnabled",
        FirebasePerformance.getInstance().isPerformanceCollectionEnabled());
    constants.put("isInstrumentationEnabled", true);
    return constants;
  }

  Task<Boolean> setPerformanceCollectionEnabled(Boolean enabled) {
    return Tasks.call(
        () -> {
          FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
          return enabled;
        });
  }

  Task<Void> startTrace(int id, String identifier) {
    return Tasks.call(
        () -> {
          Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
          trace.start();
          if (!traces.putOrDiscard(id, trace, Trace::stop)) {
            throw new IllegalStateException("perf trace id already registered: " + id);
          }
          return null;
        });
  }

  Task<Void> stopTrace(int id, Bundle metrics, Bundle attributes) {
    return Tasks.call(
        () -> {
          Trace trace = traces.take(id);
          // Traces can be cleared during module teardown before JS stops them.
          if (trace == null) {
            return null;
          }

          Set<String> metricKeys = metrics.keySet();
          Set<String> attributeKeys = attributes.keySet();

          for (String metricKey : metricKeys) {
            Double value = ((double) metrics.get(metricKey));
            trace.putMetric(metricKey, value.intValue());
          }

          for (String attributeKey : attributeKeys) {
            trace.putAttribute(
                attributeKey, (String) Objects.requireNonNull(attributes.get(attributeKey)));
          }

          trace.stop();

          return null;
        });
  }

  Task<Void> startScreenTrace(Activity activity, int id, String identifier) {
    return Tasks.call(
        () -> {
          ScreenTrace screenTrace = new ScreenTrace(activity, identifier);
          screenTrace.recordScreenTrace();
          if (!screenTraces.putOrDiscard(id, screenTrace, ScreenTrace::sendScreenTrace)) {
            throw new IllegalStateException("perf screen trace id already registered: " + id);
          }
          return null;
        });
  }

  Task<Void> stopScreenTrace(int id) {
    return Tasks.call(
        () -> {
          ScreenTrace trace = screenTraces.take(id);
          // Screen traces can be cleared during module teardown before JS stops them.
          if (trace == null) {
            return null;
          }
          trace.sendScreenTrace();

          return null;
        });
  }

  Task<Void> startHttpMetric(int id, String url, String httpMethod) {
    return Tasks.call(
        () -> {
          HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(url, httpMethod);
          httpMetric.start();
          if (!httpMetrics.putOrDiscard(id, httpMetric, HttpMetric::stop)) {
            throw new IllegalStateException("perf http metric id already registered: " + id);
          }
          return null;
        });
  }

  Task<Void> stopHttpMetric(int id, Bundle httpMetricConfig, Bundle attributes) {
    return Tasks.call(
        () -> {
          HttpMetric httpMetric = httpMetrics.take(id);
          // HTTP metrics can be cleared during module teardown before JS stops them.
          if (httpMetric == null) {
            return null;
          }

          if (httpMetricConfig.containsKey("httpResponseCode")) {
            httpMetric.setHttpResponseCode((int) httpMetricConfig.getDouble("httpResponseCode"));
          }

          if (httpMetricConfig.containsKey("requestPayloadSize")) {
            httpMetric.setRequestPayloadSize(
                (int) httpMetricConfig.getDouble("requestPayloadSize"));
          }

          if (httpMetricConfig.containsKey("responsePayloadSize")) {
            httpMetric.setResponsePayloadSize(
                (int) httpMetricConfig.getDouble("responsePayloadSize"));
          }

          if (httpMetricConfig.containsKey("responseContentType")) {
            httpMetric.setResponseContentType(httpMetricConfig.getString("responseContentType"));
          }

          Set<String> attributeKeys = attributes.keySet();

          for (String attributeKey : attributeKeys) {
            httpMetric.putAttribute(
                attributeKey, Objects.requireNonNull(attributes.getString(attributeKey)));
          }

          httpMetric.stop();

          return null;
        });
  }

  // --- Synchronous variants for the TurboModule (all work is in-memory, no network/disk) ---

  void startTraceSync(int id, String identifier) {
    Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
    trace.start();
    if (!traces.putOrDiscard(id, trace, Trace::stop)) {
      throw new IllegalStateException("perf trace id already registered: " + id);
    }
  }

  void stopTraceSync(int id, Bundle metrics, Bundle attributes) {
    Trace trace = traces.take(id);
    // Traces can be cleared during module teardown before JS stops them.
    if (trace == null) {
      return;
    }

    Set<String> metricKeys = metrics.keySet();
    Set<String> attributeKeys = attributes.keySet();

    for (String metricKey : metricKeys) {
      Double value = ((double) metrics.get(metricKey));
      trace.putMetric(metricKey, value.intValue());
    }

    for (String attributeKey : attributeKeys) {
      trace.putAttribute(
          attributeKey, (String) Objects.requireNonNull(attributes.get(attributeKey)));
    }

    trace.stop();
  }

  void startScreenTraceSync(Activity activity, int id, String identifier) {
    ScreenTrace screenTrace = new ScreenTrace(activity, identifier);
    screenTrace.recordScreenTrace();
    if (!screenTraces.putOrDiscard(id, screenTrace, ScreenTrace::sendScreenTrace)) {
      throw new IllegalStateException("perf screen trace id already registered: " + id);
    }
  }

  void stopScreenTraceSync(int id) {
    ScreenTrace trace = screenTraces.take(id);
    // Screen traces can be cleared during module teardown before JS stops them.
    if (trace == null) {
      return;
    }
    trace.sendScreenTrace();
  }

  void startHttpMetricSync(int id, String url, String httpMethod) {
    HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(url, httpMethod);
    httpMetric.start();
    if (!httpMetrics.putOrDiscard(id, httpMetric, HttpMetric::stop)) {
      throw new IllegalStateException("perf http metric id already registered: " + id);
    }
  }

  void stopHttpMetricSync(int id, Bundle httpMetricConfig, Bundle attributes) {
    HttpMetric httpMetric = httpMetrics.take(id);
    // HTTP metrics can be cleared during module teardown before JS stops them.
    if (httpMetric == null) {
      return;
    }

    if (httpMetricConfig.containsKey("httpResponseCode")) {
      httpMetric.setHttpResponseCode((int) httpMetricConfig.getDouble("httpResponseCode"));
    }

    if (httpMetricConfig.containsKey("requestPayloadSize")) {
      httpMetric.setRequestPayloadSize((int) httpMetricConfig.getDouble("requestPayloadSize"));
    }

    if (httpMetricConfig.containsKey("responsePayloadSize")) {
      httpMetric.setResponsePayloadSize((int) httpMetricConfig.getDouble("responsePayloadSize"));
    }

    if (httpMetricConfig.containsKey("responseContentType")) {
      httpMetric.setResponseContentType(httpMetricConfig.getString("responseContentType"));
    }

    Set<String> attributeKeys = attributes.keySet();

    for (String attributeKey : attributeKeys) {
      httpMetric.putAttribute(
          attributeKey, Objects.requireNonNull(attributes.getString(attributeKey)));
    }

    httpMetric.stop();
  }
}
