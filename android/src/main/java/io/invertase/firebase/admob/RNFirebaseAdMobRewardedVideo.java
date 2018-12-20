package io.invertase.firebase.admob;


import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.reward.RewardItem;
import com.google.android.gms.ads.reward.RewardedVideoAd;
import com.google.android.gms.ads.reward.RewardedVideoAdListener;

import javax.annotation.Nullable;

import io.invertase.firebase.Utils;

public class RNFirebaseAdMobRewardedVideo implements RewardedVideoAdListener {

  private String adUnit;
  private RNFirebaseAdMob adMob;
  private RewardedVideoAd rewardedVideo;

  RNFirebaseAdMobRewardedVideo(final String adUnitString, final RNFirebaseAdMob adMobInstance) {
    adUnit = adUnitString;
    adMob = adMobInstance;

    rewardedVideo = MobileAds.getRewardedVideoAdInstance(adMob.getContext());

    Activity activity = adMob.getActivity();
    final RNFirebaseAdMobRewardedVideo _this = this;

    if (activity != null) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          rewardedVideo.setRewardedVideoAdListener(_this);
        }
      });
    }
  }

  /**
   * Load an Ad with a AdRequest instance
   *
   * @param adRequest
   */
  void loadAd(final AdRequest adRequest) {
    Activity activity = adMob.getActivity();
    if (activity != null) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          rewardedVideo.loadAd(adUnit, adRequest);
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
          if (rewardedVideo.isLoaded()) {
            rewardedVideo.show();
          }
        }
      });
    }
  }

  @Override
  public void onRewarded(RewardItem reward) {
    WritableMap payload = Arguments.createMap();
    payload.putInt("amount", reward.getAmount());
    payload.putString("type", reward.getType());
    sendEvent("onRewarded", payload);
  }

  @Override
  public void onRewardedVideoAdLeftApplication() {
    sendEvent("onAdLeftApplication", null);
  }

  @Override
  public void onRewardedVideoAdClosed() {
    sendEvent("onAdClosed", null);
  }

  @Override
  public void onRewardedVideoCompleted() {
    sendEvent("onAdCompleted", null);
  }

  @Override
  public void onRewardedVideoAdFailedToLoad(int errorCode) {
    WritableMap payload = RNFirebaseAdMobUtils.errorCodeToMap(errorCode);
    sendEvent("onAdFailedToLoad", payload);
  }

  @Override
  public void onRewardedVideoAdLoaded() {
    sendEvent("onAdLoaded", null);
  }

  @Override
  public void onRewardedVideoAdOpened() {
    sendEvent("onAdOpened", null);
  }

  @Override
  public void onRewardedVideoStarted() {
    sendEvent("onRewardedVideoStarted", null);
  }

  // TODO onResume etc??? https://developers.google.com/admob/android/rewarded-video

  /**
   * Send a native event over the bridge with a type and optional payload
   *
   * @param type
   * @param payload
   */
  private void sendEvent(String type, final @Nullable WritableMap payload) {
    WritableMap map = Arguments.createMap();
    map.putString("type", type);
    map.putString("adUnit", adUnit);

    if (payload != null) {
      map.putMap("payload", payload);
    }

    Utils.sendEvent(adMob.getContext(), "rewarded_video_event", map);
  }
}
