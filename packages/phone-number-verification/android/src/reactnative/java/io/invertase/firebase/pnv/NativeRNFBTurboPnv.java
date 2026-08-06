package io.invertase.firebase.pnv;

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

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;

import android.app.Activity;
import com.facebook.fbreact.specs.NativeRNFBTurboPnvSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.pnv.FirebasePhoneNumberVerification;
import com.google.firebase.pnv.FirebasePhoneNumberVerificationException;
import com.google.firebase.pnv.VerificationSupportResult;
import com.google.firebase.pnv.VerifiedPhoneNumberTokenResult;
import io.invertase.firebase.common.TaskExecutorService;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

public class NativeRNFBTurboPnv extends NativeRNFBTurboPnvSpec {
  private static final String TAG = "Pnv";

  private final FirebasePhoneNumberVerification fpnv;
  private final TaskExecutorService executorService;

  public NativeRNFBTurboPnv(ReactApplicationContext reactContext) {
    super(reactContext);
    fpnv = FirebasePhoneNumberVerification.getInstance();
    executorService = new TaskExecutorService(TAG);
  }

  @Override
  public void invalidate() {
    super.invalidate();
    executorService.shutdown();
  }

  private Executor getExecutor() {
    return executorService.getExecutor();
  }

  private static String reasonToString(int reason) {
    switch (reason) {
      case 1:
        return "CAPABLE";
      case 2:
        return "INCAPABLE_DUE_TO_CARRIER_UNSUPPORTED";
      case 3:
        return "INCAPABLE_DUE_TO_ANDROID_VERSION";
      case 4:
        return "INCAPABLE_DUE_TO_SIM_STATE";
      default:
        return "CAPABILITY_STATUS_UNSPECIFIED";
    }
  }

  private static String pnvErrorCode(Exception e) {
    if (e instanceof FirebasePhoneNumberVerificationException) {
      int code = ((FirebasePhoneNumberVerificationException) e).getErrorCode();
      switch (code) {
        case 55501:
          return "pnv/carrier-not-supported";
        case 55502:
          return "pnv/invalid-digital-credential-response";
        case 55503:
          return "pnv/integrity-check-failed";
        case 55504:
          return "pnv/preflight-check-failed";
        case 55505:
          return "pnv/unsupported-operation";
        case 55506:
          return "pnv/credential-manager-error";
        case 55507:
          return "pnv/invalid-test-number-id";
        case 55508:
          return "pnv/test-session-already-enabled";
        case 55509:
          return "pnv/activity-context-required";
        default:
          return "pnv/unknown";
      }
    }
    return "pnv/unknown";
  }

  private static WritableMap supportResultToMap(VerificationSupportResult result) {
    WritableMap map = Arguments.createMap();
    map.putBoolean("isSupported", result.isSupported());
    map.putInt("simSlot", result.getSimSlot());
    map.putString("carrierId", result.getCarrierId());
    map.putString("reason", reasonToString(result.getReason()));
    return map;
  }

  private static WritableArray supportResultsToArray(List<VerificationSupportResult> results) {
    WritableArray array = Arguments.createArray();
    for (int i = 0; i < results.size(); i++) {
      array.pushMap(supportResultToMap(results.get(i)));
    }
    return array;
  }

  private static WritableMap tokenResultToMap(VerifiedPhoneNumberTokenResult result) {
    WritableMap map = Arguments.createMap();
    map.putString("phoneNumber", result.getPhoneNumber());
    map.putString("token", result.getToken());
    map.putDouble("expirationTimestamp", (double) result.getExpirationTimestamp());
    map.putDouble("issuedAtTimestamp", (double) result.getIssuedAtTimestamp());
    String nonce = result.getNonce();
    if (nonce != null) {
      map.putString("nonce", nonce);
    } else {
      map.putNull("nonce");
    }
    Map<String, Object> claims = result.getClaims();
    if (claims != null) {
      map.putMap("claims", claimsToWritableMap(claims));
    } else {
      map.putNull("claims");
    }
    return map;
  }

  private static WritableMap claimsToWritableMap(Map<String, Object> claims) {
    WritableMap map = Arguments.createMap();
    for (Map.Entry<String, Object> entry : claims.entrySet()) {
      String key = entry.getKey();
      Object value = entry.getValue();
      if (value == null) {
        map.putNull(key);
      } else if (value instanceof String) {
        map.putString(key, (String) value);
      } else if (value instanceof Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else if (value instanceof Integer) {
        map.putInt(key, (Integer) value);
      } else if (value instanceof Long) {
        map.putDouble(key, ((Long) value).doubleValue());
      } else if (value instanceof Double) {
        map.putDouble(key, (Double) value);
      } else if (value instanceof Float) {
        map.putDouble(key, ((Float) value).doubleValue());
      } else {
        map.putString(key, value.toString());
      }
    }
    return map;
  }

  @Override
  public void enableTestSession(String token, Promise promise) {
    try {
      fpnv.enableTestSession(token);
      promise.resolve(null);
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
    }
  }

  @Override
  public void getVerificationSupportInfo(Promise promise) {
    fpnv.getVerificationSupportInfo()
        .addOnSuccessListener(
            getExecutor(),
            results -> {
              promise.resolve(supportResultsToArray(results));
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
            });
  }

  @Override
  public void getVerificationSupportInfoForSimSlot(double simSlot, Promise promise) {
    fpnv.getVerificationSupportInfo((int) simSlot)
        .addOnSuccessListener(
            getExecutor(),
            results -> {
              promise.resolve(supportResultsToArray(results));
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
            });
  }

  @Override
  public void getVerifiedPhoneNumber(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      rejectPromiseWithCodeAndMessage(
          promise, "pnv/activity-context-required", "Could not get current activity");
      return;
    }
    fpnv.getVerifiedPhoneNumber(activity)
        .addOnSuccessListener(
            getExecutor(),
            result -> {
              promise.resolve(tokenResultToMap(result));
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
            });
  }

  @Override
  public void getDigitalCredentialPayload(String nonce, Promise promise) {
    fpnv.getDigitalCredentialPayload(nonce)
        .addOnSuccessListener(
            getExecutor(),
            payload -> {
              promise.resolve(payload);
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
            });
  }

  @Override
  public void exchangeCredentialResponseForPhoneNumber(String dcApiResponse, Promise promise) {
    fpnv.exchangeCredentialResponseForPhoneNumber(dcApiResponse)
        .addOnSuccessListener(
            getExecutor(),
            result -> {
              promise.resolve(tokenResultToMap(result));
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(promise, pnvErrorCode(e), e.getMessage());
            });
  }
}
