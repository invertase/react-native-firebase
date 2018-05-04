package io.invertase.firebase.functions;

import android.support.annotation.NonNull;
import android.util.Log;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.FirebaseFunctionsException;
import com.google.firebase.functions.HttpsCallableReference;
import com.google.firebase.functions.HttpsCallableResult;

import java.util.List;
import java.util.Map;

import io.invertase.firebase.Utils;

public class RNFirebaseFunctions extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseFunctions";

  public RNFirebaseFunctions(ReactApplicationContext reactContext) {
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
  public void httpsCallable(final String name, @Nullable final Object data, final Promise promise) {
    Object input;
    if (data == null
      || data instanceof String
      || data instanceof Boolean
      || data instanceof Integer
      || data instanceof Long
      || data instanceof Float) {
      input = data;
    } else if (data instanceof ReadableArray) {
      input = ((ReadableArray) data).toArrayList();
    } else if (data instanceof ReadableMap) {
      input = ((ReadableMap) data).toHashMap();
    } else {
      input = null;
    }

    HttpsCallableReference httpsCallableReference = FirebaseFunctions
      .getInstance()
      .getHttpsCallable(name);

    httpsCallableReference
      .call(input)
      .addOnSuccessListener(new OnSuccessListener<HttpsCallableResult>() {
        @Override
        public void onSuccess(HttpsCallableResult httpsCallableResult) {
          Log.d(TAG, "function:call:onSuccess:" + name);

          WritableMap map = Arguments.createMap();
          Object result = httpsCallableResult.getData();
          if (result == null
            || result instanceof String
            || result instanceof Boolean
            || result instanceof Integer
            || result instanceof Long
            || result instanceof Float) {
            Utils.mapPutValue("data", result, map);
          } else if (result instanceof List) {
            map.putArray("data", Arguments.makeNativeArray((List<Object>) result));
          } else if (result instanceof Map) {
            map.putMap("data", Arguments.makeNativeMap((Map<String, Object>) result));
          } else {
            // TODO check for other instance types e.g. ArrayList ?
            map.putNull("data");
          }

          promise.resolve(map);

        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.d(TAG, "function:call:onFailure:" + name, exception);
          if (exception instanceof FirebaseFunctionsException) {
            FirebaseFunctionsException ffe = (FirebaseFunctionsException) exception;
            /*
                OK(0),
                CANCELLED(1),
                UNKNOWN(2),
                INVALID_ARGUMENT(3),
                DEADLINE_EXCEEDED(4),
                NOT_FOUND(5),
                ALREADY_EXISTS(6),
                PERMISSION_DENIED(7),
                RESOURCE_EXHAUSTED(8),
                FAILED_PRECONDITION(9),
                ABORTED(10),
                OUT_OF_RANGE(11),
                UNIMPLEMENTED(12),
                INTERNAL(13),
                UNAVAILABLE(14),
                DATA_LOSS(15),
                UNAUTHENTICATED(16);
             */
            FirebaseFunctionsException.Code code = ffe.getCode();
            String message = ffe.getMessage();
            Object details = ffe.getDetails();
            // TODO promise resolve so we can send details
          }
        }
      });
  }
}
