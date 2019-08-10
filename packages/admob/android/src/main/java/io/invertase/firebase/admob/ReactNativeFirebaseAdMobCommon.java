package io.invertase.firebase.admob;

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


import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.gms.ads.AdRequest;

import java.util.ArrayList;
import java.util.Objects;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.database.ReactNativeFirebaseAdMobEvent;

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;

public class ReactNativeFirebaseAdMobCommon {

  static public AdRequest buildAdRequest(ReadableMap adRequestOptions) {
    AdRequest.Builder builder = new AdRequest.Builder();

    if (adRequestOptions.hasKey("requestNonPersonalizedAdsOnly") && adRequestOptions.getBoolean("requestNonPersonalizedAdsOnly")) {
      Bundle extras = new Bundle();
      extras.putString("npa", "1");

      builder.addNetworkExtrasBundle(AdMobAdapter.class, extras);
    }

    if (adRequestOptions.hasKey("keywords")) {
      ArrayList<Object> keywords = Objects.requireNonNull(adRequestOptions.getArray("keywords"))
        .toArrayList();

      for (Object keyword : keywords) {
        builder.addKeyword((String) keyword);
      }
    }

    if (adRequestOptions.hasKey("testDevices")) {
      ArrayList<Object> devices = Objects.requireNonNull(adRequestOptions.getArray("testDevices"))
        .toArrayList();

      for (Object device : devices) {
        String id = (String) device;

        if (id.equals("EMULATOR")) {
          builder.addTestDevice(AdRequest.DEVICE_ID_EMULATOR);
        } else {
          builder.addTestDevice(id);
        }
      }
    }

    if (adRequestOptions.hasKey("contentUrl")) {
      builder.setContentUrl(Objects.requireNonNull(adRequestOptions.getString("contentUrl")));
    }

    if (adRequestOptions.hasKey("location")) {
      ReadableArray location = adRequestOptions.getArray("location");
      // todo how? https://developer.android.com/reference/android/location/Location.html
    }

    if (adRequestOptions.hasKey("requestAgent")) {
      builder.setRequestAgent(Objects.requireNonNull(adRequestOptions.getString("requestAgent")));
    }

    return builder.build();
  }

  static public void sendAdEvent(String event, int requestId, String type, String adUnitId, @Nullable WritableMap error) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    WritableMap eventBody = Arguments.createMap();
    eventBody.putString("type", type);

    if (error != null) {
      eventBody.putMap("error", error);
    }

    emitter.sendEvent(new ReactNativeFirebaseAdMobEvent(
      event,
      requestId,
      adUnitId,
      eventBody
    ));
  }

  static public void sendAdEvent(String event, int requestId, String type, String adUnitId, @Nullable WritableMap error, @Nullable WritableMap data) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    WritableMap eventBody = Arguments.createMap();
    eventBody.putString("type", type);

    if (error != null) {
      eventBody.putMap("error", error);
    }

    if (data != null) {
      eventBody.putMap("data", data);
    }

    emitter.sendEvent(new ReactNativeFirebaseAdMobEvent(
      event,
      requestId,
      adUnitId,
      eventBody
    ));
  }

  static public String[] getCodeAndMessageFromAdErrorCode(int errorCode) {
    String code = "unknown";
    String message = "An unknown error occurred";

    switch (errorCode) {
      case AdRequest.ERROR_CODE_INTERNAL_ERROR:
        code = "internal-error";
        message = "Something happened internally; for instance, an invalid response was received from the ad server.";
        break;
      case AdRequest.ERROR_CODE_INVALID_REQUEST:
        code = "invalid-request";
        message = "The ad request was invalid; for instance, the ad unit ID was incorrect.";
        break;
      case AdRequest.ERROR_CODE_NETWORK_ERROR:
        code = "network-error";
        message = "The ad request was unsuccessful due to network connectivity.";
        break;
      case AdRequest.ERROR_CODE_NO_FILL:
        code = "no-fill";
        message = "The ad request was successful, but no ad was returned due to lack of ad inventory.";
        break;
    }

    String[] codeAndMessage = new String[2];
    codeAndMessage[0] = code;
    codeAndMessage[1] = message;
    return codeAndMessage;
  }

}
