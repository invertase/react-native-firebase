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

import android.content.Context;
import android.os.Bundle;
import android.util.SparseArray;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.HttpMetric;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@SuppressWarnings("WeakerAccess")
public class UniversalFirebasePerfModule {
  private static SparseArray<Trace> traces = new SparseArray<>();
  private static SparseArray<HttpMetric> httpMetrics = new SparseArray<>();

  private final Context context;

  UniversalFirebasePerfModule(Context context) {
    this.context = context;
  }

  void onTearDown() {
    synchronized (UniversalFirebasePerfModule.class) {
      traces.clear();
      httpMetrics.clear();
    }
  }

  Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
      "isPerformanceCollectionEnabled",
      FirebasePerformance.getInstance().isPerformanceCollectionEnabled()
    );
    return constants;
  }

  Task<Boolean> setPerformanceCollectionEnabled(Boolean enabled) {
    return Tasks.call(() -> {
      FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
      return enabled;
    });
  }

  Task<Void> startTrace(int id, String identifier) {
    return Tasks.call(() -> {
      Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
      trace.start();

      synchronized (UniversalFirebasePerfModule.class) {
        traces.put(id, trace);
      }

      return null;
    });
  }

  Task<Void> stopTrace(int id, Bundle metrics, Bundle attributes) {
    return Tasks.call(() -> {
      Trace trace;
      synchronized (UniversalFirebasePerfModule.class) {
        trace = traces.get(id);
      }

      Set<String> metricKeys = metrics.keySet();
      Set<String> attributeKeys = attributes.keySet();

      for (String metricKey : metricKeys) {
        Double value = ((double) metrics.get(metricKey));
        trace.putMetric(metricKey, value.intValue());
      }

      for (String attributeKey : attributeKeys) {
        trace.putAttribute(attributeKey, (String) Objects.requireNonNull(attributes.get(attributeKey)));
      }

      trace.stop();

      synchronized (UniversalFirebasePerfModule.class) {
        traces.remove(id);
      }

      return null;
    });
  }

  Task<Void> startHttpMetric(int id, String url, String httpMethod) {
    return Tasks.call(() -> {
      HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(url, httpMethod);
      httpMetric.start();

      synchronized (UniversalFirebasePerfModule.class) {
        httpMetrics.put(id, httpMetric);
      }

      return null;
    });
  }

  Task<Void> stopHttpMetric(int id, Bundle httpMetricConfig, Bundle attributes) {
    return Tasks.call(() -> {
      HttpMetric httpMetric;
      synchronized (UniversalFirebasePerfModule.class) {
        httpMetric = httpMetrics.get(id);
      }

      if (httpMetricConfig.containsKey("httpResponseCode")) {
        httpMetric.setHttpResponseCode(httpMetricConfig.getInt("httpResponseCode"));
      }

      if (httpMetricConfig.containsKey("requestPayloadSize")) {
        httpMetric.setRequestPayloadSize(httpMetricConfig.getInt("requestPayloadSize"));
      }

      if (httpMetricConfig.containsKey("responsePayloadSize")) {
        httpMetric.setResponsePayloadSize(httpMetricConfig.getInt("responsePayloadSize"));
      }

      if (httpMetricConfig.containsKey("responseContentType")) {
        httpMetric.setResponseContentType(httpMetricConfig.getString("responseContentType"));
      }

      Set<String> attributeKeys = attributes.keySet();

      for (String attributeKey : attributeKeys) {
        httpMetric.putAttribute(attributeKey, Objects.requireNonNull(attributes.getString(attributeKey)));
      }

      httpMetric.stop();

      synchronized (UniversalFirebasePerfModule.class) {
        httpMetrics.remove(id);
      }

      return null;
    });
  }
}
