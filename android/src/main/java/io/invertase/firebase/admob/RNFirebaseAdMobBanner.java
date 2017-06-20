package io.invertase.firebase.admob;

import android.support.annotation.Nullable;

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

import java.util.Map;

public class RNFirebaseAdMobBanner extends SimpleViewManager<ReactViewGroup> {

  public static final String REACT_CLASS = "RNFirebaseAdMobBanner";
  public static final String BANNER_EVENT = "onBannerEvent";

  public enum Events {
    EVENT_AD_SIZE_CHANGE("onSizeChange"),
    EVENT_AD_LOADED("onAdLoaded"),
    EVENT_AD_FAILED_TO_LOAD("onAdFailedToLoad"),
    EVENT_AD_OPENED("onAdOpened"),
    EVENT_AD_CLOSED("onAdClosed"),
    EVENT_AD_LEFT_APPLICATION("onAdLeftApplication");

    private final String event;

    Events(final String name) {
      event = name;
    }

    @Override
    public String toString() {
      return event;
    }
  }

  private ThemedReactContext context;
  private ReactViewGroup viewGroup;
  private RCTEventEmitter emitter;
  private Boolean requested = false;

  // Internal prop values
  private AdRequest.Builder request;
  private AdSize size;
  private String unitId;


  @Override
  public String getName() {
    return REACT_CLASS;
  }

  /**
   * Create & return view instance
   *
   * @param themedReactContext
   * @return
   */
  @Override
  public ReactViewGroup createViewInstance(ThemedReactContext themedReactContext) {
    context = themedReactContext;
    viewGroup = new ReactViewGroup(themedReactContext);
    emitter = themedReactContext.getJSModule(RCTEventEmitter.class);

    AdView adView = new AdView(context);
    viewGroup.addView(adView);
    setAdListener();

    return viewGroup;
  }

  AdView getAdView() {
    return (AdView) viewGroup.getChildAt(0);
  }

  /**
   * Remove the inner AdView and set a new one
   */
  private void resetAdView() {
    AdView oldAdView = getAdView();
    AdView newAdView = new AdView(context);

    viewGroup.removeViewAt(0);
    if (oldAdView != null) oldAdView.destroy();
    viewGroup.addView(newAdView);
    setAdListener();
  }

  /**
   * Declare custom events
   *
   * @return
   */
  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
    builder.put(BANNER_EVENT, MapBuilder.of("registrationName", BANNER_EVENT));
    return builder.build();
  }

  /**
   * Handle unitId prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "unitId")
  public void setUnitId(ReactViewGroup view, String value) {
    unitId = value;
    requestAd();
  }

  /**
   * Handle request prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "request")
  public void setRequest(ReactViewGroup view, ReadableMap value) {
    request = RNFirebaseAdMobUtils.buildRequest(value);
    requestAd();
  }

  /**
   * Handle size prop
   *
   * @param view
   * @param value
   */
  @ReactProp(name = "size")
  public void setSize(ReactViewGroup view, String value) {
    size = RNFirebaseAdMobUtils.stringToAdSize(value);

    // Send the width & height back to the JS
    int width;
    int height;
    WritableMap payload = Arguments.createMap();

    if (size == AdSize.SMART_BANNER) {
      width = (int) PixelUtil.toDIPFromPixel(size.getWidthInPixels(context));
      height = (int) PixelUtil.toDIPFromPixel(size.getHeightInPixels(context));
    } else {
      width = size.getWidth();
      height = size.getHeight();
    }

    payload.putDouble("width", width);
    payload.putDouble("height", height);

    sendEvent(Events.EVENT_AD_SIZE_CHANGE.toString(), payload);
    requestAd();
  }

  /**
   * Loads a new ad into a viewGroup
   */
  void requestAd() {
    // If the props have not yet been set
    if (size == null || unitId == null || request == null) {
      return;
    }

    // If the banner has already been requested, reset it
    if (requested) {
      resetAdView();
    }

    AdView adView = getAdView();
    adView.setAdUnitId(unitId);
    adView.setAdSize(size);
    AdRequest adRequest = request.build();

    requested = true;
    adView.loadAd(adRequest);
  }

  /**
   * Listen to Ad events
   */
  void setAdListener() {
    final AdView adView = getAdView();

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        int left = adView.getLeft();
        int top = adView.getTop();

        int width = adView.getAdSize().getWidthInPixels(context);
        int height = adView.getAdSize().getHeightInPixels(context);

        adView.measure(width, height);
        adView.layout(left, top, left + width, top + height);

        WritableMap payload = Arguments.createMap();

        payload.putBoolean(RNFirebaseAdMobNativeExpress.Events.EVENT_AD_VIDEO_CONTENT.toString(), false);
        payload.putInt("width", width);
        payload.putInt("height", height);

        sendEvent(Events.EVENT_AD_LOADED.toString(), payload);
      }

      @Override
      public void onAdFailedToLoad(int errorCode) {
        WritableMap payload = RNFirebaseAdMobUtils.errorCodeToMap(errorCode);
        sendEvent(Events.EVENT_AD_FAILED_TO_LOAD.toString(), payload);
      }

      @Override
      public void onAdOpened() {
        sendEvent(Events.EVENT_AD_OPENED.toString(), null);
      }

      @Override
      public void onAdClosed() {
        sendEvent(Events.EVENT_AD_CLOSED.toString(), null);
      }

      @Override
      public void onAdLeftApplication() {
        sendEvent(Events.EVENT_AD_LEFT_APPLICATION.toString(), null);
      }
    });
  }

  /**
   * Sends an event back to the JS component to handle
   *
   * @param type
   * @param payload
   */
  void sendEvent(String type, final @Nullable WritableMap payload) {
    WritableMap event = Arguments.createMap();
    event.putString("type", type);

    if (payload != null) {
      event.putMap("payload", payload);
    }

    emitter.receiveEvent(viewGroup.getId(), BANNER_EVENT, event);
  }
}
