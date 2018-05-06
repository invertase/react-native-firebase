package io.invertase.firebase.functions;

import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.FirebaseFunctionsException;
import com.google.firebase.functions.HttpsCallableReference;
import com.google.firebase.functions.HttpsCallableResult;

import io.invertase.firebase.Utils;

public class RNFirebaseFunctions extends ReactContextBaseJavaModule {

  private static final String DATA_KEY = "data";
  private static final String CODE_KEY = "code";
  private static final String MSG_KEY = "message";
  private static final String ERROR_KEY = "__error";
  private static final String DETAILS_KEY = "details";
  private static final String TAG = "RNFirebaseFunctions";

  RNFirebaseFunctions(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void httpsCallable(final String name, ReadableMap wrapper, final Promise promise) {
    Object input = wrapper.toHashMap().get(DATA_KEY);
    Log.d(TAG, "function:call:input:" + name + ":" + (input != null ? input.toString() : "null"));

    HttpsCallableReference httpsCallableReference = FirebaseFunctions
      .getInstance()
      .getHttpsCallable(name);

    httpsCallableReference
      .call(input)
      .addOnSuccessListener(new OnSuccessListener<HttpsCallableResult>() {
        @Override
        public void onSuccess(HttpsCallableResult httpsCallableResult) {
          WritableMap map = Arguments.createMap();
          Object result = httpsCallableResult.getData();

          Log.d(
            TAG,
            "function:call:onSuccess:" + name
          );
          Log.d(
            TAG,
            "function:call:onSuccess:result:type:" + name + ":" + (result != null ? result.getClass().getName() : "null")
          );
          Log.d(
            TAG,
            "function:call:onSuccess:result:data:" + name + ":" + (result != null ? result.toString() : "null")
          );

          Utils.mapPutValue(DATA_KEY, result, map);
          promise.resolve(map);

        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.d(TAG, "function:call:onFailure:" + name, exception);

          String message;
          Object details = null;
          String code = "UNKNOWN";
          WritableMap map = Arguments.createMap();

          if (exception instanceof FirebaseFunctionsException) {
            FirebaseFunctionsException ffe = (FirebaseFunctionsException) exception;
            details = ffe.getDetails();
            code = ffe.getCode().name();
            message = ffe.getLocalizedMessage();
          } else {
            message = exception.getLocalizedMessage();
          }

          Utils.mapPutValue(CODE_KEY, code, map);
          Utils.mapPutValue(MSG_KEY, message, map);
          Utils.mapPutValue(ERROR_KEY, true, map);
          Utils.mapPutValue(DETAILS_KEY, details, map);
          promise.resolve(map);
        }
      });
  }
}
