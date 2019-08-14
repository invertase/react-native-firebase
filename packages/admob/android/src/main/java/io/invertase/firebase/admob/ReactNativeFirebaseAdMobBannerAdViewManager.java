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

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.view.ReactViewGroup;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;

import javax.annotation.Nonnull;

public class ReactNativeFirebaseAdMobBannerAdViewManager extends SimpleViewManager<ReactViewGroup> {

  public static final String REACT_CLASS = "RNFBBannerAd";
  private AdView adView;

  @Nonnull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Nonnull
  @Override
  protected ReactViewGroup createViewInstance(@Nonnull ThemedReactContext reactContext) {
    ReactViewGroup viewGroup = new ReactViewGroup(reactContext);
    adView = new AdView(reactContext);

    adView.setAdUnitId("ca-app-pub-3940256099942544/6300978111");

    adView.setAdSize(AdSize.SMART_BANNER);
    AdRequest adRequest = new AdRequest.Builder().build();

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        Log.d("ELLIOT", "LOADED");
        // Code to be executed when an ad finishes loading.
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

    viewGroup.addView(adView);

    return viewGroup;
  }
}
