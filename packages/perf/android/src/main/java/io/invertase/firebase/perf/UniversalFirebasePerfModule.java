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
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public class UniversalFirebasePerfModule extends UniversalFirebaseModule {
  private static SparseArray<Trace> traces = new SparseArray<>();
  private static SparseArray<HttpMetric> httpMetrics = new SparseArray<>();

  UniversalFirebasePerfModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  @Override
  public void onTearDown() {
    super.onTearDown();
    traces.clear();
    httpMetrics.clear();
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
        "isPerformanceCollectionEnabled",
        FirebasePerformance.getInstance().isPerformanceCollectionEnabled());
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

          traces.put(id, trace);

          return null;
        });
  }

  Task<Void> stopTrace(int id, Bundle metrics, Bundle attributes) {
    return Tasks.call(
        () -> {
          Trace trace = traces.get(id);

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
          traces.remove(id);

          return null;
        });
  }

  Task<Void> startHttpMetric(int id, String url, String httpMethod) {
    return Tasks.call(
        () -> {
          HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(url, httpMethod);
          httpMetric.start();
          httpMetrics.put(id, httpMetric);
          return null;
        });
  }

  Task<Void> stopHttpMetric(int id, Bundle httpMetricConfig, Bundle attributes) {
    return Tasks.call(
        () -> {
          HttpMetric httpMetric = httpMetrics.get(id);

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
          httpMetrics.remove(id);

          return null;
        });
  }
}
