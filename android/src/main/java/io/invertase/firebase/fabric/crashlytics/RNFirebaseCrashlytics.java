package io.invertase.firebase.fabric.crashlytics;

import android.util.Log;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;

import io.fabric.sdk.android.Fabric;

public class RNFirebaseCrashlytics extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseCrashlytics";

  public RNFirebaseCrashlytics(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void crash() {
    Crashlytics
      .getInstance()
      .crash();
  }

  @ReactMethod
  public void log(final String message) {
    Crashlytics.log(message);
  }

  @ReactMethod
  public void recordError(final int code, final String domain) {
    Crashlytics.logException(new Exception(code + ": " + domain));
  }

  @ReactMethod
  public void recordCustomError(String name, String reason, ReadableArray frameArray) {
      ArrayList<StackTraceElement> stackList = new ArrayList<>(0);
      for (int i = 0; i < frameArray.size(); i++) {
        ReadableMap map = frameArray.getMap(i);
        ReadableMap additional = map.hasKey("additional") ? map.getMap("additional") : null;
        String functionName = map.hasKey("functionName") ? map.getString("functionName") : "Unknown Function";
        String className = map.hasKey("className") ? map.getString("className") : "Unknown Class";
        StackTraceElement stack = new StackTraceElement(
          className,
          functionName,
          map.getString("fileName"),
          map.hasKey("lineNumber") ? map.getInt("lineNumber") : -1
        );
        stackList.add(stack);

        if(additional != null){
          StackTraceElement s = new StackTraceElement(
            "Additional Parameters",
            additional.toString(),
            map.getString("fileName"),
            map.hasKey("lineNumber") ? map.getInt("lineNumber") : -1
          );
          stackList.add(s);
        }
      }
      StackTraceElement[] stackTrace =  new StackTraceElement[stackList.size()];
      Exception e = new Exception(name + "\n" + reason);
      stackTrace = stackList.toArray(stackTrace);
      e.setStackTrace(stackTrace);
      Crashlytics.logException(e);
  }

  @ReactMethod
  public void setBoolValue(final String key, final boolean boolValue) {
    Crashlytics.setBool(key, boolValue);
  }

  @ReactMethod
  public void setFloatValue(final String key, final float floatValue) {
    Crashlytics.setFloat(key, floatValue);
  }

  @ReactMethod
  public void setIntValue(final String key, final int intValue) {
    Crashlytics.setInt(key, intValue);
  }

  @ReactMethod
  public void setStringValue(final String key, final String stringValue) {
    Crashlytics.setString(key, stringValue);
  }

  @ReactMethod
  public void setUserIdentifier(String userId) {
    Crashlytics.setUserIdentifier(userId);
  }

  @ReactMethod
  public void setUserName(String userName) {
    Crashlytics.setUserName(userName);
  }

  @ReactMethod
  public void setUserEmail(String userEmail) {
    Crashlytics.setUserEmail(userEmail);
  }

  @ReactMethod
  public void enableCrashlyticsCollection() {
    Fabric.with(getReactApplicationContext(), new Crashlytics());
  }

}
