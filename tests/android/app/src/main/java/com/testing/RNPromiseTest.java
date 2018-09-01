package com.testing;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class RNPromiseTest extends ReactContextBaseJavaModule {
  private static final String TAG = "RNPromiseTest";

  RNPromiseTest(ReactApplicationContext reactContext) {
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

  // void resolve(@Nullable Object value);
  @ReactMethod
  public void resolveWithValue(String value, Promise promise) {
    promise.resolve(value);
  }

  // void reject(String code, String message);
  @ReactMethod
  public void rejectWithCodeAndMessage(String code, String message, Promise promise) {
    promise.reject(code, message);
  }

  // void reject(String code, Throwable throwable);
  @ReactMethod
  public void rejectWithCodeAndThrowable(String code, String errorMessage, Promise promise) {
    promise.reject(code, new Exception(errorMessage));
  }

  // void reject(String code, String message, Throwable throwable);
  @ReactMethod
  public void rejectWithCodeMessageAndThrowable(
    String code,
    String message,
    String errorMessage,
    Promise promise
  ) {
    promise.reject(code, message, new Exception(errorMessage));
  }

  // void reject(Throwable throwable);
  @ReactMethod
  public void rejectWithThrowable(String errorMessage, Promise promise) {
    promise.reject(new Exception(errorMessage));
  }

  /* ---------------------------
   *  With userInfo WritableMap
   * --------------------------- */

  // void reject(Throwable throwable, WritableMap userInfo);
  @ReactMethod
  public void rejectWithThrowableAndMap(String errorMessage, ReadableMap map, Promise promise) {
    promise.reject(new Exception(errorMessage), Arguments.makeNativeMap(map.toHashMap()));
  }

  // void reject(String code, @Nonnull WritableMap userInfo);
  @ReactMethod
  public void rejectWithCodeAndMap(String code, ReadableMap map, Promise promise) {
    promise.reject(code, Arguments.makeNativeMap(map.toHashMap()));
  }

  // void reject(String code, Throwable throwable, WritableMap userInfo);
  @ReactMethod
  public void rejectWithCodeThrowableAndMap(
    String code,
    String errorMessage,
    ReadableMap map,
    Promise promise
  ) {
    promise.reject(code, new Exception(errorMessage), Arguments.makeNativeMap(map.toHashMap()));
  }

  // void reject(String code, String message, @Nonnull WritableMap userInfo);
  @ReactMethod
  public void rejectWithCodeMessageAndMap(
    String code,
    String message,
    ReadableMap map,
    Promise promise
  ) {
    promise.reject(code, message, Arguments.makeNativeMap(map.toHashMap()));
  }

  // void reject(String code, String message, Throwable throwable, WritableMap userInfo);
  @ReactMethod
  public void rejectWithCodeMessageThrowableAndMap(
    String code,
    String message,
    String errorMessage,
    ReadableMap map,
    Promise promise
  ) {
    promise.reject(
      code,
      message,
      new Exception(errorMessage),
      Arguments.makeNativeMap(map.toHashMap())
    );
  }
}
