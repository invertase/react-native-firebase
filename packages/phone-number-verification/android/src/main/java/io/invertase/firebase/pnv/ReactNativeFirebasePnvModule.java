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

import android.app.Activity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.pnv.FirebasePhoneNumberVerification;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebasePnvModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Pnv";

  private final FirebasePhoneNumberVerification fpnv;

  ReactNativeFirebasePnvModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    fpnv = FirebasePhoneNumberVerification.getInstance();
  }

  @ReactMethod
  public void enableTestSession(String token, Promise promise) {
    try {
      fpnv.enableTestSession(token);
      promise.resolve(null);
    } catch (Exception e) {
      rejectPromiseWithCodeAndMessage(
          promise, "enable-test-session-failed", e.getMessage());
    }
  }

  @ReactMethod
  public void getVerificationSupportInfo(Promise promise) {
    fpnv.getVerificationSupportInfo()
        .addOnSuccessListener(
            getExecutor(),
            results -> {
              WritableArray supportInfoArray = Arguments.createArray();
              for (int i = 0; i < results.size(); i++) {
                WritableMap info = Arguments.createMap();
                info.putBoolean("isSupported", results.get(i).isSupported());
                supportInfoArray.pushMap(info);
              }
              promise.resolve(supportInfoArray);
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(
                  promise, "get-support-info-failed", e.getMessage());
            });
  }

  @ReactMethod
  public void getVerifiedPhoneNumber(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      rejectPromiseWithCodeAndMessage(
          promise, "no-activity", "Could not get current activity");
      return;
    }
    fpnv.getVerifiedPhoneNumber(activity)
        .addOnSuccessListener(
            getExecutor(),
            result -> {
              WritableMap resultMap = Arguments.createMap();
              resultMap.putString("phoneNumber", result.getPhoneNumber());
              resultMap.putString("token", result.getToken());
              promise.resolve(resultMap);
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(
                  promise, "verification-failed", e.getMessage());
            });
  }

  @ReactMethod
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
              rejectPromiseWithCodeAndMessage(
                  promise, "get-payload-failed", e.getMessage());
            });
  }

  @ReactMethod
  public void exchangeCredentialResponseForPhoneNumber(String dcApiResponse, Promise promise) {
    fpnv.exchangeCredentialResponseForPhoneNumber(dcApiResponse)
        .addOnSuccessListener(
            getExecutor(),
            result -> {
              WritableMap resultMap = Arguments.createMap();
              resultMap.putString("phoneNumber", result.getPhoneNumber());
              resultMap.putString("token", result.getToken());
              promise.resolve(resultMap);
            })
        .addOnFailureListener(
            getExecutor(),
            e -> {
              rejectPromiseWithCodeAndMessage(
                  promise, "exchange-failed", e.getMessage());
            });
  }
}
