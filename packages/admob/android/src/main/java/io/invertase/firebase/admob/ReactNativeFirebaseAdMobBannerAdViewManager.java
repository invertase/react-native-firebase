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

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;

import java.util.Map;

import javax.annotation.Nonnull;

public class ReactNativeFirebaseAdMobBannerAdViewManager extends SimpleViewManager<AdView> {

  public static final String REACT_CLASS = "RNFBBannerAd";
  private AdView adView;
  private ThemedReactContext context;


  @Nonnull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Nonnull
  @Override
  protected AdView createViewInstance(@Nonnull ThemedReactContext reactContext) {
    context = reactContext;
    adView = new AdView(reactContext);


    adView.setAdUnitId("ca-app-pub-3940256099942544/6300978111");

    adView.setAdSize(AdSize.BANNER);
    AdRequest adRequest = new AdRequest.Builder().build();

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        Log.d("ELLIOT", "LOADED");
        // Code to be executed when an ad finishes loading.
        int left = adView.getLeft();
        int top = adView.getTop();

        int width = adView
          .getAdSize()
          .getWidthInPixels(reactContext);
        int height = adView
          .getAdSize()
          .getHeightInPixels(reactContext);

        adView.measure(width, height);
        adView.layout(left, top, left + width, top + height);

      }

      @Override
      public void onAdFailedToLoad(int errorCode) {
        Log.d("ELLIOT", "ERROR");
        // Code to be executed when an ad request fails.
      }

      @Override
      public void onAdOpened() {
        Log.d("ELLIOT", "OPENED");
        // Code to be executed when an ad opens an overlay that
        // covers the screen.
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
        // Code to be executed when the user is about to return
        // to the app after tapping on an ad.
      }
    });

    adView.loadAd(adRequest);


    return adView;
  }

  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
    builder.put("onNativeEvent", MapBuilder.of("registrationName", "onNativeEvent"));
    return builder.build();
  }

  /**
   * Handle unitId prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "unitId")
  public void setUnitId(AdView view, String value) {
    AdRequest adRequest = new AdRequest.Builder().build();
    view.loadAd(adRequest);

  }

  /**
   * Handle request prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "request")
  public void setRequest(AdView view, ReadableMap value) {
    AdRequest adRequest = new AdRequest.Builder().build();
    view.loadAd(adRequest);
  }

  /**
   * Handle size prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "size")
  public void setSize(AdView view, String value) {
    AdSize adSize = ReactNativeFirebaseAdMobCommon.stringToAdSize(value);

    // Send the width & height back to the JS
    int width;
    int height;
    WritableMap payload = Arguments.createMap();

    if (adSize == AdSize.SMART_BANNER) {
      width = (int) PixelUtil.toDIPFromPixel(adSize.getWidthInPixels(context));
      height = (int) PixelUtil.toDIPFromPixel(adSize.getHeightInPixels(context));
    } else {
      width = adSize.getWidth();
      height = adSize.getHeight();
    }

    payload.putDouble("width", width);
    payload.putDouble("height", height);

    sendEvent("onSizeChange", payload);


//    view.setAdSize(adSize);
//    requestAd();
  }

  private void sendEvent(String type, WritableMap payload) {
    WritableMap event = Arguments.createMap();
    event.putString("type", type);
    event.merge(payload);
    context.getJSModule(RCTEventEmitter.class).receiveEvent(adView.getId(), "onNativeEvent", event);
  }
}
