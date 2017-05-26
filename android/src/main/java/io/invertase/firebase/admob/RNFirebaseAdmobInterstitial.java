package io.invertase.firebase.admob;


import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;

class RNFirebaseAdmobInterstitial {

  private InterstitialAd interstitialAd;
  private RNFirebaseAdMob adMob;

  RNFirebaseAdmobInterstitial(String adUnit, RNFirebaseAdMob adMobInstance) {
    adMob = adMobInstance;
    interstitialAd = new InterstitialAd(adMob.getContext());
    interstitialAd.setAdUnitId(adUnit);
  }

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
}
