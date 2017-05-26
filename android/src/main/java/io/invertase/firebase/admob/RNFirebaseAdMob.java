package io.invertase.firebase.admob;


import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.google.android.gms.ads.AdRequest;
import com.google.firebase.database.ServerValue;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;

import io.invertase.firebase.Utils;
import io.invertase.firebase.admob.RNFirebaseAdmobInterstitial;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class RNFirebaseAdMob extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseAdmob";

  public ReactApplicationContext getContext() {
    return getReactApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  private ReactApplicationContext context;
  private HashMap<String, RNFirebaseAdmobInterstitial> interstitials = new HashMap<>();

  public RNFirebaseAdMob(ReactApplicationContext reactContext) {
    super(reactContext);
    context = reactContext;
    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void interstitialLoadAd(String adUnit, ReadableMap request) {
    RNFirebaseAdmobInterstitial interstitial = getOrCreateInterstitial(adUnit);
    AdRequest.Builder requestBuilder = new AdRequest.Builder();

    if (request.hasKey("testDevice")) {
      requestBuilder.addTestDevice(AdRequest.DEVICE_ID_EMULATOR);
    }

    ReadableArray keywords = request.getArray("keywords");
    List<Object> keywordsList = Utils.recursivelyDeconstructReadableArray(keywords);

    for (Object word : keywordsList) {
      requestBuilder.addKeyword((String) word);
    }

    interstitial.loadAd(requestBuilder.build());
  }

  @ReactMethod
  public void interstitialShowAd(String adUnit) {
    RNFirebaseAdmobInterstitial interstitial = getOrCreateInterstitial(adUnit);
    interstitial.show();
  }

  private RNFirebaseAdmobInterstitial getOrCreateInterstitial(String adUnit) {
    if (interstitials.containsKey(adUnit)) {
      return interstitials.get(adUnit);
    }
    RNFirebaseAdmobInterstitial interstitial = new RNFirebaseAdmobInterstitial(adUnit, this);
    interstitials.put(adUnit, interstitial);
    return interstitial;
  }



  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("DEVICE_ID_EMULATOR", AdRequest.DEVICE_ID_EMULATOR);
    return constants;
  }
}
