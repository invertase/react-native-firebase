package io.invertase.firebase.admob;

import android.support.annotation.Nullable;
import android.view.View;

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
import com.google.android.gms.ads.NativeExpressAdView;
import com.google.android.gms.ads.VideoController;
import com.google.android.gms.ads.VideoOptions;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RNFirebaseAdMobNativeExpress extends SimpleViewManager<ReactViewGroup> implements View.OnLayoutChangeListener {

  public static final String REACT_CLASS = "RNFirebaseAdMobNativeExpress";
  public static final String BANNER_EVENT = "bannerEvent";

  public enum Events {
    EVENT_AD_SIZE_CHANGE("onSizeChange"),
    EVENT_AD_LOADED("onAdLoaded"),
    EVENT_AD_FAILED_TO_LOAD("onAdFailedToLoad"),
    EVENT_AD_OPENED("onAdOpened"),
    EVENT_AD_CLOSED("onAdClosed"),
    EVENT_AD_LEFT_APPLICATION("onAdLeftApplication"),
    EVENT_AD_VIDEO_END("onVideoEnd"),
    EVENT_AD_VIDEO_CONTENT("hasVideoContent");

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
  private AdRequest.Builder request;
  private VideoOptions.Builder videoOptions;
  private String size;

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  /**
   * Create & return view instance
   * @param themedReactContext
   * @return
   */
  @Override
  public ReactViewGroup createViewInstance(ThemedReactContext themedReactContext) {
    context = themedReactContext;
    viewGroup = new ReactViewGroup(themedReactContext);
    emitter = themedReactContext.getJSModule(RCTEventEmitter.class);

    NativeExpressAdView adView = new NativeExpressAdView(context);
    viewGroup.addView(adView);
    setAdListener();

    return viewGroup;
  }

  NativeExpressAdView getAdView() {
    return (NativeExpressAdView) viewGroup.getChildAt(0);
  }

  /**
   * Declare custom events
   * @return
   */
  @Override
  public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
    builder.put(BANNER_EVENT, MapBuilder.of("registrationName", BANNER_EVENT));
    return builder.build();
  }

  /**
   * If the React View changes, reset the Ad size
   * @param view
   * @param left
   * @param top
   * @param right
   * @param bottom
   * @param oldLeft
   * @param oldTop
   * @param oldRight
   * @param oldBottom
   */
  @Override
  public void onLayoutChange(View view, final int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight, int oldBottom) {
    // If the view has changed at all, recalculate what banner we need
    if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
      setSize(viewGroup, null);
    }
  }

  /**
   * Handle unitId prop
   * @param view
   * @param value
   */
  @ReactProp(name = "unitId")
  public void setUnitId(final ReactViewGroup view, final String value) {
    NativeExpressAdView adViewView = getAdView();
    adViewView.setAdUnitId(value);
    requestAd();
  }

  /**
   * Handle request prop
   * @param view
   * @param map
   */
  @ReactProp(name = "request")
  public void setRequest(final ReactViewGroup view, final ReadableMap map) {
    request = RNFirebaseAdMobUtils.buildRequest(map);
    requestAd();
  }

  /**
   * Handle video prop
   * @param view
   * @param map
   */
  @ReactProp(name = "video")
  public void setVideoOptions(final ReactViewGroup view, final ReadableMap map) {
    videoOptions = RNFirebaseAdMobUtils.buildVideoOptions(map);
    requestAd();
  }

  /**
   * Handle size prop
   * @param view
   * @param value
   */
  @ReactProp(name = "size")
  public void setSize(final ReactViewGroup view, final @Nullable String value) {
    if (value != null) {
      size = value;
    }

    AdSize adSize = RNFirebaseAdMobUtils.stringToAdSize(size);
    NativeExpressAdView adViewView = getAdView();
    adViewView.setAdSize(adSize);

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

    sendEvent(Events.EVENT_AD_SIZE_CHANGE.toString(), payload);
    requestAd();
  }

  /**
   * Loads a new ad into a viewGroup
   */
  void requestAd() {
    NativeExpressAdView adView = getAdView();

    if (adView.getAdSize() == null || adView.getAdUnitId() == null || request == null || videoOptions == null) {
      return;
    }

    AdRequest adRequest = request.build();
    adView.setVideoOptions(videoOptions.build());
    adView.loadAd(adRequest);
  }

  /**
   * Listen to Ad events
   */
  void setAdListener() {
    final NativeExpressAdView adView = getAdView();

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        int left = adView.getLeft();
        int top = adView.getTop();

        int width = adView.getAdSize().getWidthInPixels(context);
        int height = adView.getAdSize().getHeightInPixels(context);

        adView.measure(width, height);
        adView.layout(left, top, left + width, top + height);

        VideoController vc = adView.getVideoController();
        WritableMap payload = Arguments.createMap();

        payload.putBoolean(Events.EVENT_AD_VIDEO_CONTENT.toString(), vc.hasVideoContent());
        payload.putInt("width", width);
        payload.putInt("height", height);
        payload.putInt("left", left);
        payload.putInt("top", top);

        if (vc.hasVideoContent()) {
          vc.setVideoLifecycleCallbacks(new VideoController.VideoLifecycleCallbacks() {
            public void onVideoEnd() {
              sendEvent(Events.EVENT_AD_VIDEO_END.toString(), null);
            }
          });
        }

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
   * @param type
   * @param payload
   */
  void sendEvent(String type, final @Nullable WritableMap payload) {
    WritableMap event = Arguments.createMap();
    event.putString("type", type);

    if (payload != null) {
      event.putMap("payload", payload);
    }

    int id = viewGroup.getId();
    emitter.receiveEvent(viewGroup.getId(), BANNER_EVENT, event);
  }
}
