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


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;

import java.util.HashMap;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAdMobInterstitialModule extends ReactNativeFirebaseModule {
  private static HashMap<String, InterstitialAd> interstitialAdHashMap = new HashMap<>();

  private static final String SERVICE = "AdmobInterstitial";

  public ReactNativeFirebaseAdMobInterstitialModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE);
  }

  private InterstitialAd getInterstitialAd(String adUnitId) {
    if (interstitialAdHashMap.containsKey(adUnitId)) {
      return interstitialAdHashMap.get(adUnitId);
    }

    InterstitialAd interstitialAd = new InterstitialAd(getApplicationContext());
    interstitialAd.setAdUnitId(adUnitId);

    interstitialAdHashMap.put(adUnitId, interstitialAd);
    return interstitialAd;
  }

  // todo make common
  private void sendAdEvent(String type, String adUnitId, String event) {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    // { type: "interstital", adUnitId, event: clicked, opened etc }

//    emitter.sendEvent(new ReactNativeFirebaseTransactionEvent(
//      ReactNativeFirebaseTransactionEvent.EVENT_TRANSACTION,
//      updatesMap,
//      app,
//      transactionId
//    ));
  }

  @ReactMethod
  public void interstitialRequestAd(String appName, String adUnitId, ReadableMap adRequestOptions, Promise promise) {
    InterstitialAd interstitialAd = getInterstitialAd(adUnitId);
    // TODO adRequest options
    interstitialAd.loadAd(new AdRequest.Builder().build());

    interstitialAd.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        promise.resolve(null);
      }

      @Override
      public void onAdFailedToLoad(int errorCode) {
        // TODO
        rejectPromiseWithCodeAndMessage(promise, "request-failed", "doop");
        // Code to be executed when an ad request fails.
      }

      @Override
      public void onAdOpened() {
        // Code to be executed when the ad is displayed.
      }

      @Override
      public void onAdClicked() {
        // Code to be executed when the user clicks on an ad.
      }

      @Override
      public void onAdLeftApplication() {
        // Code to be executed when the user has left the app.
      }

      @Override
      public void onAdClosed() {
        // Code to be executed when the interstitial ad is closed.
      }
    });
  }

  @ReactMethod
  public void interstitialShow(String appName, String adUnitId, Promise promise) {
    if (!interstitialAdHashMap.containsKey(adUnitId)) {
      // todo
      rejectPromiseWithCodeAndMessage(promise, "show-ad-failed", "Ad has not been requested for this id");
      return;
    }

    InterstitialAd interstitialAd = getInterstitialAd(adUnitId);

    if (!interstitialAd.isLoaded()) {
      // todo
      rejectPromiseWithCodeAndMessage(promise, "show-ad-failed", "Ad has not been loaded yet");
      return;
    }

    interstitialAd.show();
    promise.resolve(null);
  }
}
