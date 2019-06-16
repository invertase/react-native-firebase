package io.invertase.firebase.perf;


import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.HttpMetric;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;
import java.util.Map;

public class RNFirebasePerformance extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebasePerformance";
  private HashMap<String, Trace> traces = new HashMap<>();
  private HashMap<String, HttpMetric> httpMetrics = new HashMap<>();

  public RNFirebasePerformance(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  /**
   * @return
   */
  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void setPerformanceCollectionEnabled(Boolean enabled, Promise promise) {
    FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
    promise.resolve(null);
  }

  /**
   * Trace
   */

  @ReactMethod
  public void getTraceAttribute(String identifier, String attribute, Promise promise) {
    promise.resolve(getOrCreateTrace(identifier).getAttribute(attribute));
  }

  @ReactMethod
  public void getTraceAttributes(String identifier, Promise promise) {
    Map<String, String> attributes = getOrCreateTrace(identifier).getAttributes();
    WritableMap map = Arguments.createMap();

    for (Map.Entry<String, String> entry : attributes.entrySet()) {
      map.putString(entry.getKey(), entry.getValue());
    }

    promise.resolve(map);
  }

  @ReactMethod
  public void getTraceLongMetric(String identifier, String metricName, Promise promise) {
    Integer value = Long.valueOf(getOrCreateTrace(identifier).getLongMetric(metricName)).intValue();
    promise.resolve(value);
  }

  @ReactMethod
  public void incrementTraceMetric(
    String identifier,
    String metricName,
    Integer incrementBy,
    Promise promise
  ) {
    getOrCreateTrace(identifier).incrementMetric(metricName, incrementBy.longValue());
    promise.resolve(null);
  }

  @ReactMethod
  public void putTraceAttribute(
    String identifier,
    String attribute,
    String value,
    Promise promise
  ) {
    getOrCreateTrace(identifier).putAttribute(attribute, value);
    // Docs say it returns a bool, actually void so we internally check attributes
    Map<String, String> attributes = getOrCreateTrace(identifier).getAttributes();
    if (attributes.containsKey(attribute)) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void putTraceMetric(String identifier, String metricName, Integer value, Promise promise) {
    getOrCreateTrace(identifier).putMetric(metricName, value.longValue());
    promise.resolve(null);
  }

  @ReactMethod
  public void removeTraceAttribute(String identifier, String attribute, Promise promise) {
    getOrCreateTrace(identifier).removeAttribute(attribute);
    promise.resolve(null);
  }

  @ReactMethod
  public void startTrace(String identifier, Promise promise) {
    getOrCreateTrace(identifier).start();
    promise.resolve(null);
  }

  @ReactMethod
  public void stopTrace(String identifier, Promise promise) {
    getOrCreateTrace(identifier).stop();
    traces.remove(identifier);
    promise.resolve(null);
  }

  /**
   * Http Metric
   */

  @ReactMethod
  public void getHttpMetricAttribute(
    String url,
    String httpMethod,
    String attribute,
    Promise promise
  ) {
    promise.resolve(getOrCreateHttpMetric(url, httpMethod).getAttribute(attribute));
  }

  @ReactMethod
  public void getHttpMetricAttributes(String url, String httpMethod, Promise promise) {
    Map<String, String> attributes = getOrCreateHttpMetric(url, httpMethod).getAttributes();
    WritableMap map = Arguments.createMap();

    for (Map.Entry<String, String> entry : attributes.entrySet()) {
      map.putString(entry.getKey(), entry.getValue());
    }

    promise.resolve(map);
  }

  @ReactMethod
  public void putHttpMetricAttribute(
    String url,
    String httpMethod,
    String attribute,
    String value,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).putAttribute(attribute, value);
    // Docs say it returns a bool, actually void so we internally check attributes
    Map<String, String> attributes = getOrCreateHttpMetric(url, httpMethod).getAttributes();
    if (attributes.containsKey(attribute)) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void removeHttpMetricAttribute(
    String url,
    String httpMethod,
    String attribute,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).removeAttribute(attribute);
    promise.resolve(null);
  }

  @ReactMethod
  public void setHttpMetricResponseCode(
    String url,
    String httpMethod,
    Integer code,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).setHttpResponseCode(code);
    promise.resolve(null);
  }

  @ReactMethod
  public void setHttpMetricRequestPayloadSize(
    String url,
    String httpMethod,
    Integer bytes,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).setRequestPayloadSize(bytes.longValue());
    promise.resolve(null);
  }

  @ReactMethod
  public void setHttpMetricResponseContentType(
    String url,
    String httpMethod,
    String type,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).setResponseContentType(type);
    promise.resolve(null);
  }

  @ReactMethod
  public void setHttpMetricResponsePayloadSize(
    String url,
    String httpMethod,
    Integer bytes,
    Promise promise
  ) {
    getOrCreateHttpMetric(url, httpMethod).setResponsePayloadSize(bytes.longValue());
    promise.resolve(null);
  }

  @ReactMethod
  public void startHttpMetric(String url, String httpMethod, Promise promise) {
    getOrCreateHttpMetric(url, httpMethod).start();
    promise.resolve(null);
  }

  @ReactMethod
  public void stopHttpMetric(String url, String httpMethod, Promise promise) {
    getOrCreateHttpMetric(url, httpMethod).stop();
    httpMetrics.remove(url + httpMethod);
    promise.resolve(null);
  }

  /**
   * Private
   */

  private Trace getOrCreateTrace(String identifier) {
    if (traces.containsKey(identifier)) {
      return traces.get(identifier);
    }
    Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
    traces.put(identifier, trace);
    return trace;
  }

  private HttpMetric getOrCreateHttpMetric(String url, String httpMethod) {
    String identifier = url + httpMethod;
    if (httpMetrics.containsKey(identifier)) {
      return httpMetrics.get(identifier);
    }
    HttpMetric httpMetric = FirebasePerformance.getInstance().newHttpMetric(
      url,
      this.mapStringToMethod(httpMethod)
    );
    httpMetrics.put(identifier, httpMetric);
    return httpMetric;
  }

  private String mapStringToMethod(String value) {
    switch (value) {
      case "CONNECT":
        return FirebasePerformance.HttpMethod.CONNECT;
      case "DELETE":
        return FirebasePerformance.HttpMethod.DELETE;
      case "GET":
        return FirebasePerformance.HttpMethod.GET;
      case "HEAD":
        return FirebasePerformance.HttpMethod.HEAD;
      case "OPTIONS":
        return FirebasePerformance.HttpMethod.OPTIONS;
      case "PATCH":
        return FirebasePerformance.HttpMethod.PATCH;
      case "POST":
        return FirebasePerformance.HttpMethod.POST;
      case "PUT":
        return FirebasePerformance.HttpMethod.PUT;
      case "TRACE":
        return FirebasePerformance.HttpMethod.TRACE;
    }

    return "";
  }
}
