package io.invertase.firebase.perf;


import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;

public class RNFirebasePerformance extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebasePerformance";
  private HashMap<String, Trace> traces = new HashMap<>();

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
  public void setPerformanceCollectionEnabled(Boolean enabled) {
    FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
  }

  @ReactMethod
  public void start(String identifier) {
    getOrCreateTrace(identifier).start();
  }

  @ReactMethod
  public void stop(String identifier) {
    getOrCreateTrace(identifier).stop();
    traces.remove(identifier);
  }

  @ReactMethod
  public void incrementCounter(String identifier, String event) {
    getOrCreateTrace(identifier).incrementCounter(event);
  }

  private Trace getOrCreateTrace(String identifier) {
    if (traces.containsKey(identifier)) {
      return traces.get(identifier);
    }
    Trace trace = FirebasePerformance.getInstance().newTrace(identifier);
    traces.put(identifier, trace);
    return trace;
  }
}
