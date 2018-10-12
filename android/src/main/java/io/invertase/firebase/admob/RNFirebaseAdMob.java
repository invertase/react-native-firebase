package io.invertase.firebase.admob;


import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.MobileAds;

import java.util.HashMap;
import java.util.Map;


public class RNFirebaseAdMob extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseAdMob";
  private HashMap<String, RNFirebaseAdmobInterstitial> interstitials = new HashMap<>();
  private HashMap<String, RNFirebaseAdMobRewardedVideo> rewardedVideos = new HashMap<>();

  RNFirebaseAdMob(ReactApplicationContext reactContext) {
    super(reactContext);
    Log.d(TAG, "New instance");
  }

  ReactApplicationContext getContext() {
    return getReactApplicationContext();
  }

  Activity getActivity() {
    return getCurrentActivity();
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void initialize(String appId) {
    MobileAds.initialize(this.getContext(), appId);
  }

  @ReactMethod
  public void openDebugMenu(String appId) {
    MobileAds.openDebugMenu(getActivity(), appId);
  }

  @ReactMethod
  public void interstitialLoadAd(String adUnit, ReadableMap request) {
    RNFirebaseAdmobInterstitial interstitial = getOrCreateInterstitial(adUnit);
    interstitial.loadAd(RNFirebaseAdMobUtils
                          .buildRequest(request)
                          .build());
  }

  @ReactMethod
  public void interstitialShowAd(String adUnit) {
    RNFirebaseAdmobInterstitial interstitial = getOrCreateInterstitial(adUnit);
    interstitial.show();
  }

  @ReactMethod
  public void rewardedVideoLoadAd(String adUnit, ReadableMap request) {
    RNFirebaseAdMobRewardedVideo rewardedVideo = getOrCreateRewardedVideo(adUnit);
    rewardedVideo.loadAd(RNFirebaseAdMobUtils
                           .buildRequest(request)
                           .build());
  }

  @ReactMethod
  public void rewardedVideoShowAd(String adUnit) {
    RNFirebaseAdMobRewardedVideo rewardedVideo = getOrCreateRewardedVideo(adUnit);
    rewardedVideo.show();
  }

  /**
   * @param adUnit
   * @return
   */
  private RNFirebaseAdmobInterstitial getOrCreateInterstitial(String adUnit) {
    if (interstitials.containsKey(adUnit)) {
      return interstitials.get(adUnit);
    }
    RNFirebaseAdmobInterstitial interstitial = new RNFirebaseAdmobInterstitial(adUnit, this);
    interstitials.put(adUnit, interstitial);
    return interstitial;
  }

  /**
   * @param adUnit
   * @return
   */
  private RNFirebaseAdMobRewardedVideo getOrCreateRewardedVideo(String adUnit) {
    if (rewardedVideos.containsKey(adUnit)) {
      return rewardedVideos.get(adUnit);
    }
    RNFirebaseAdMobRewardedVideo rewardedVideo = new RNFirebaseAdMobRewardedVideo(adUnit, this);
    rewardedVideos.put(adUnit, rewardedVideo);
    return rewardedVideo;
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("DEVICE_ID_EMULATOR", AdRequest.DEVICE_ID_EMULATOR);
    return constants;
  }
}
