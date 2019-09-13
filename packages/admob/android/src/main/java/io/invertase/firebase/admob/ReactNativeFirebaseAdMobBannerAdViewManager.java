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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.views.view.ReactViewGroup;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;

import javax.annotation.Nonnull;
import java.util.Map;

public class ReactNativeFirebaseAdMobBannerAdViewManager extends SimpleViewManager<ReactViewGroup> {
  private static final String REACT_CLASS = "ReactNativeFirebaseAdMobBannerView";
  private String EVENT_AD_LOADED = "onAdLoaded";
  private String EVENT_AD_FAILED_TO_LOAD = "onAdFailedToLoad";
  private String EVENT_AD_OPENED = "onAdOpened";
  private String EVENT_AD_CLOSED = "onAdClosed";
  private String EVENT_AD_LEFT_APPLICATION = "onAdLeftApplication";

  private Boolean requested = false;
  private AdRequest request;
  private AdSize size;
  private String unitId;

  @Nonnull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Nonnull
  @Override
  public ReactViewGroup createViewInstance(@Nonnull ThemedReactContext themedReactContext) {
    ReactViewGroup viewGroup = new ReactViewGroup(themedReactContext);
    AdView adView = new AdView(themedReactContext);
    viewGroup.addView(adView);
    setAdListener(viewGroup);
    return viewGroup;
  }

  private AdView getAdView(ReactViewGroup viewGroup) {
    return (AdView) viewGroup.getChildAt(0);
  }

  private void resetAdView(ReactViewGroup reactViewGroup) {
    AdView oldAdView = getAdView(reactViewGroup);
    AdView newAdView = new AdView(reactViewGroup.getContext());
    reactViewGroup.removeViewAt(0);
    if (oldAdView != null) oldAdView.destroy();
    reactViewGroup.addView(newAdView);
    setAdListener(reactViewGroup);
  }

  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
    builder.put("onNativeEvent", MapBuilder.of("registrationName", "onNativeEvent"));
    return builder.build();
  }

  @ReactProp(name = "unitId")
  public void setUnitId(ReactViewGroup reactViewGroup, String value) {
    unitId = value;
    requestAd(reactViewGroup);
  }

  @ReactProp(name = "request")
  public void setRequest(ReactViewGroup reactViewGroup, ReadableMap value) {
    request = ReactNativeFirebaseAdMobCommon.buildAdRequest(value);
    requestAd(reactViewGroup);
  }

  @ReactProp(name = "size")
  public void setSize(ReactViewGroup reactViewGroup, String value) {
    size = ReactNativeFirebaseAdMobCommon.stringToAdSize(value);

    int width;
    int height;
    WritableMap payload = Arguments.createMap();

    if (size == AdSize.SMART_BANNER) {
      width = (int) PixelUtil.toDIPFromPixel(size.getWidthInPixels(reactViewGroup.getContext()));
      height = (int) PixelUtil.toDIPFromPixel(size.getHeightInPixels(reactViewGroup.getContext()));
    } else {
      width = size.getWidth();
      height = size.getHeight();
    }

    payload.putDouble("width", width);
    payload.putDouble("height", height);

    if (size != AdSize.FLUID) {
      sendEvent(reactViewGroup, "onSizeChange", payload);
    }
    requestAd(reactViewGroup);
  }

  private void setAdListener(ReactViewGroup reactViewGroup) {
    final AdView adView = getAdView(reactViewGroup);

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        int top;
        int left;
        int width;
        int height;

        if (size == AdSize.FLUID) {
          top = 0;
          left = 0;
          width = reactViewGroup.getWidth();
          height = reactViewGroup.getHeight();
        } else {
          top = adView.getTop();
          left = adView.getLeft();
          width = adView.getAdSize().getWidthInPixels(reactViewGroup.getContext());
          height = adView.getAdSize().getHeightInPixels(reactViewGroup.getContext());
        }

        // TODO size=FLUID not loading ad, height of child FrameLayout incorrect?
        adView.measure(width, height);
        adView.layout(left, top, left + width, top + height);

        WritableMap payload = Arguments.createMap();

        if (size != AdSize.FLUID) {
          payload.putInt("width", (int) PixelUtil.toDIPFromPixel(width) + 1);
          payload.putInt("height", (int) PixelUtil.toDIPFromPixel(height) + 1);
        } else {
          payload.putInt("width", (int) PixelUtil.toDIPFromPixel(width));
          payload.putInt("height", (int) PixelUtil.toDIPFromPixel(height));
        }

        sendEvent(reactViewGroup, EVENT_AD_LOADED, payload);
      }

      @Override
      public void onAdFailedToLoad(int errorCode) {
        WritableMap payload = ReactNativeFirebaseAdMobCommon.errorCodeToMap(errorCode);
        sendEvent(reactViewGroup, EVENT_AD_FAILED_TO_LOAD, payload);
      }

      @Override
      public void onAdOpened() {
        sendEvent(reactViewGroup, EVENT_AD_OPENED, null);
      }

      @Override
      public void onAdClosed() {
        sendEvent(reactViewGroup, EVENT_AD_CLOSED, null);
      }

      @Override
      public void onAdLeftApplication() {
        sendEvent(reactViewGroup, EVENT_AD_LEFT_APPLICATION, null);
      }
    });
  }

  private void requestAd(ReactViewGroup reactViewGroup) {
    if (size == null || unitId == null || request == null) {
      return;
    }

    if (requested) {
      resetAdView(reactViewGroup);
    }

    AdView adView = getAdView(reactViewGroup);
    adView.setAdUnitId(unitId);
    adView.setAdSize(size);
    adView.loadAd(request);

    requested = true;
  }

  private void sendEvent(ReactViewGroup reactViewGroup, String type, WritableMap payload) {
    WritableMap event = Arguments.createMap();
    event.putString("type", type);

    if (payload != null) {
      event.merge(payload);
    }

    ((ThemedReactContext) reactViewGroup.getContext())
      .getJSModule(RCTEventEmitter.class)
      .receiveEvent(reactViewGroup.getId(), "onNativeEvent", event);
  }
}
