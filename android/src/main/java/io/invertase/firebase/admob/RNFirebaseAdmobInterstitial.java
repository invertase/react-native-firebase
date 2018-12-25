package io.invertase.firebase.admob;


import android.app.Activity;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;

import io.invertase.firebase.Utils;

class RNFirebaseAdmobInterstitial {

  private InterstitialAd interstitialAd;
  private RNFirebaseAdMob adMob;
  private AdListener adListener;
  private String adUnit;

  RNFirebaseAdmobInterstitial(final String adUnitString, final RNFirebaseAdMob adMobInstance) {
    adUnit = adUnitString;
    adMob = adMobInstance;
    interstitialAd = new InterstitialAd(adMob.getContext());
    interstitialAd.setAdUnitId(adUnit);

    adListener = new AdListener() {
      @Override
      public void onAdLoaded() {
        sendEvent("onAdLoaded", null);
      }

      @Override
      public void onAdOpened() {
        sendEvent("onAdOpened", null);
      }

      @Override
      public void onAdLeftApplication() {
        sendEvent("onAdLeftApplication", null);
      }

      @Override
      public void onAdClosed() {
        sendEvent("onAdClosed", null);
      }

      @Override
      public void onAdFailedToLoad(int errorCode) {
        WritableMap payload = RNFirebaseAdMobUtils.errorCodeToMap(errorCode);
        sendEvent("onAdFailedToLoad", payload);
      }
    };

    interstitialAd.setAdListener(adListener);
  }

  /**
   * Load an Ad with a AdRequest instance
   * @param adRequest
   */
  void loadAd(final AdRequest adRequest) {
    Activity activity = adMob.getActivity();
    if (activity != null) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          interstitialAd.loadAd(adRequest);
        }
      });
    }
  }

  /**
   * Show the loaded interstitial, if it's loaded
   */
  void show() {
    Activity activity = adMob.getActivity();
    if (activity != null) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          if (interstitialAd.isLoaded()) {
            interstitialAd.show();
          }
        }
      });
    }
  }

  /**
   * Send a native event over the bridge with a type and optional payload
   * @param type
   * @param payload
   */
  void sendEvent(String type, final @Nullable WritableMap payload) {
    WritableMap map = Arguments.createMap();
    map.putString("type", type);
    map.putString("adUnit", adUnit);

    if (payload != null) {
      map.putMap("payload", payload);
    }

    Utils.sendEvent(adMob.getContext(), "interstitial_event", map);
  }
}
