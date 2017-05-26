package io.invertase.firebase.admob;

import android.support.annotation.Nullable;
import android.view.View;

import com.facebook.react.bridge.Arguments;
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

public class RNFirebaseAdMobBanner extends SimpleViewManager<ReactViewGroup> implements View.OnLayoutChangeListener {

  public static final String REACT_CLASS = "RNFirebaseAdMobBanner";
  public static final String BANNER_EVENT = "bannerEvent";

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
  private String size;
  private Boolean testing = false;

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

    attachAdViewToViewGroup();
    return viewGroup;
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
    AdView adViewView = (AdView) view.getChildAt(0);
    adViewView.setAdUnitId(value);
    requestAd();
  }

  /**
   * Handle testing prop
   * @param view
   * @param value
   */
  @ReactProp(name = "testing")
  public void setUnitId(final ReactViewGroup view, final Boolean value) {
    testing = value;
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

    AdSize adSize = propToAdSize(size.toUpperCase());
    AdView adViewView = (AdView) view.getChildAt(0);
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
   * Creates a new instance of the AdView and attaches it to the
   * current ReactViewGroup
   */
  void attachAdViewToViewGroup() {
    removeAdFromViewGroup();

    final AdView adView = new AdView(context);
    viewGroup.addView(adView);
    setAdListener();
  }

  /**
   * Removes the AdView from the ViewGroup
   */
  void removeAdFromViewGroup() {
    AdView adView = (AdView) viewGroup.getChildAt(0);
    viewGroup.removeAllViews();

    if (adView != null) {
      adView.destroy();
    }
  }

  /**
   * Loads a new ad into a viewGroup
   */
  void requestAd() {
    AdView adView = (AdView) viewGroup.getChildAt(0);

    if (adView.getAdSize() == null || adView.getAdUnitId() == null) {
      return;
    }

    AdRequest.Builder adRequestBuilder = new AdRequest.Builder();

    // If the prop testing is set, assign the emulators device ID
    if (testing) {
      adRequestBuilder.addTestDevice(AdRequest.DEVICE_ID_EMULATOR);
    }

    AdRequest adRequest = adRequestBuilder.build();
    adView.loadAd(adRequest);
  }

  /**
   * Listen to Ad events
   */
  void setAdListener() {
    final AdView adView = (AdView) viewGroup.getChildAt(0);

    adView.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        int left = adView.getLeft();
        int top = adView.getTop();

        int width = adView.getAdSize().getWidthInPixels(context);
        int height = adView.getAdSize().getHeightInPixels(context);

        adView.measure(width, height);
        adView.layout(left, top, left + width, top + height);

        sendEvent(Events.EVENT_AD_LOADED.toString(), null);
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

    emitter.receiveEvent(viewGroup.getId(), BANNER_EVENT, event);
  }

  /**
   * Map the size prop to the AdSize
   * @param prop
   * @return
   */
  AdSize propToAdSize(String prop) {
    switch (prop) {
      default:
      case "BANNER":
        return AdSize.BANNER;
      case "LARGE_BANNER":
        return AdSize.LARGE_BANNER;
      case "MEDIUM_RECTANGLE":
        return AdSize.MEDIUM_RECTANGLE;
      case "FULL_BANNER":
        return AdSize.FULL_BANNER;
      case "LEADERBOARD":
        return AdSize.LEADERBOARD;
      case "SMART_BANNER":
        return AdSize.SMART_BANNER;
    }
  }
}
