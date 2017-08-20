package io.invertase.firebase.links;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import com.google.firebase.dynamiclinks.DynamicLink;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.ShortDynamicLink;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import io.invertase.firebase.Utils;

public class RNFirebaseLinks extends ReactContextBaseJavaModule implements ActivityEventListener {
  private final static String TAG = RNFirebaseLinks.class.getCanonicalName();
  private String initialLink = null;

  public RNFirebaseLinks(ReactApplicationContext reactContext) {
    super(reactContext);
    getReactApplicationContext().addActivityEventListener(this);
    registerLinksHandler();
  }

  @Override
  public String getName() {
    return "RNFirebaseLinks";
  }

  @ReactMethod
  public void getInitialLink(Promise promise) {
    promise.resolve(initialLink);
  }

  private void registerLinksHandler() {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      return;
    }

    FirebaseDynamicLinks.getInstance()
      .getDynamicLink(activity.getIntent())
      .addOnSuccessListener(activity, new OnSuccessListener<PendingDynamicLinkData>() {
        @Override
        public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
          // Get deep link from result (may be null if no link is found)
          if (pendingDynamicLinkData != null) {
            Uri deepLinkUri = pendingDynamicLinkData.getLink();
            String deepLink = deepLinkUri.toString();
            // TODO: Validate that this is called when opening from a deep link
            if (initialLink == null) {
              initialLink = deepLink;
            }
            Utils.sendEvent(getReactApplicationContext(), "dynamic_link_received", deepLink);
          }
        }
      })
      .addOnFailureListener(activity, new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception e) {
          Log.w(TAG, "getDynamicLink:onFailure", e);
        }
      });
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // Not required for this module
  }

  @Override
  public void onNewIntent(Intent intent) {
    // TODO: Do I need to re-register the links handler for each new intent?
  }

  @ReactMethod
  public void createLink(final ReadableMap parameters, final Promise promise) {
      try {
        DynamicLink link = buildDynamicLinkFromMap(parameters);

        promise.resolve(link.getUri().toString());
        Log.d(TAG,link.getUri().toString());
    }
    catch(Exception ex) {
      promise.reject("Could not build dynamic link", ex);
    }
  }

  /**
   * Converts a RN ReadableMap into a DynamicLink instance
   *
   * @param parameters
   * @return
   */
  private DynamicLink buildDynamicLinkFromMap(ReadableMap parameters) {
    DynamicLink.Builder parametersBuilder = FirebaseDynamicLinks.getInstance().createDynamicLink();

    try {
      Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(parameters);

      parametersBuilder.setLink(Uri.parse((String)m.get("link")));
      parametersBuilder.setDynamicLinkDomain((String)m.get("domain"));

      setAndroidParameters(m, parametersBuilder);
      setIosParameters(m, parametersBuilder);
      //setNavigationInfoParameters(m, parametersBuilder);
      setSocialMetaTagParameters(m, parametersBuilder);
      setGoogleAnalyticsParameters(m, parametersBuilder);
      setItunesConnectAnalyticsParameters(m, parametersBuilder);

    } catch (Exception e) {
      Log.e(TAG, "error while building parameters " + e.getMessage());
    }

    return parametersBuilder.buildDynamicLink();
  }

  private void setAndroidParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> androidParameters = (Map<String, Object>) m.get("androidParameters");
    if (androidParameters != null) {
      DynamicLink.AndroidParameters.Builder androidParametersBuilder =
        androidParameters.containsKey("packageName") ?
        new DynamicLink.AndroidParameters.Builder((String)androidParameters.get("packageName")) :
        new DynamicLink.AndroidParameters.Builder();

      if (androidParameters.containsKey("fallbackUrl")) {
        androidParametersBuilder.setFallbackUrl(Uri.parse((String)androidParameters.get("fallbackUrl")));
      }
      if (androidParameters.containsKey("minimumVersion")) {
        androidParametersBuilder.setMinimumVersion(((Double)androidParameters.get("minimumVersion")).intValue());
      }
      parametersBuilder.setAndroidParameters(androidParametersBuilder.build());
    }
  }

  private void setIosParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> iosParameters = (Map<String, Object>) m.get("iosParameters");
    //TODO: see what happens if bundleId is missing
    if (iosParameters != null && iosParameters.containsKey("bundleId")) {
      DynamicLink.IosParameters.Builder iosParametersBuilder = new DynamicLink.IosParameters.Builder((String)iosParameters.get("bundleId"));
      if (iosParameters.containsKey("appStoreId")) {
        iosParametersBuilder.setAppStoreId((String)iosParameters.get("appStoreId"));
      }
      if (iosParameters.containsKey("customScheme")) {
        iosParametersBuilder.setCustomScheme((String)iosParameters.get("customScheme"));
      }
      if (iosParameters.containsKey("fallbackUrl")) {
        iosParametersBuilder.setFallbackUrl(Uri.parse((String)iosParameters.get("fallbackUrl")));
      }
      if (iosParameters.containsKey("ipadBundleId")) {
        iosParametersBuilder.setIpadBundleId((String)iosParameters.get("ipadBundleId"));
      }
      if (iosParameters.containsKey("ipadFallbackUrl")) {
        iosParametersBuilder.setIpadFallbackUrl(Uri.parse((String)iosParameters.get("ipadFallbackUrl")));
      }
      if (iosParameters.containsKey("minimumVersion")) {
        iosParametersBuilder.setMinimumVersion((String)iosParameters.get("minimumVersion"));
      }
      parametersBuilder.setIosParameters(iosParametersBuilder.build());
    }
  }

  // private void setNavigationInfoParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
  //   Map<String, Object> navigationInfoParameters = (Map<String, Object>) m.get("navigationInfoParameters");
  //   if (navigationInfoParameters != null) {
  //     DynamicLink.NavigationInfoParameters.Builder navigationInfoParametersBuilder =
  //       new DynamicLink.NavigationInfoParameters.Builder();
  //
  //     if (navigationInfoParameters.containsKey("forcedRedirectEnabled")) {
  //       navigationInfoParametersBuilder.setForcedRedirectEnabled((boolean)navigationInfoParameters.get("forcedRedirectEnabled"));
  //     }
  //     parametersBuilder.setNavigationInfoParameters(navigationInfoParametersBuilder.build());
  //   }
  // }

  private void setSocialMetaTagParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> socialMetaTagParameters = (Map<String, Object>) m.get("socialMetaTagParameters");
    if (socialMetaTagParameters != null) {
      DynamicLink.SocialMetaTagParameters.Builder socialMetaTagParametersBuilder =
        new DynamicLink.SocialMetaTagParameters.Builder();

      if (socialMetaTagParameters.containsKey("description")) {
        socialMetaTagParametersBuilder.setDescription((String)socialMetaTagParameters.get("description"));
      }
      if (socialMetaTagParameters.containsKey("imageUrl")) {
        socialMetaTagParametersBuilder.setImageUrl(Uri.parse((String)socialMetaTagParameters.get("imageUrl")));
      }
      if (socialMetaTagParameters.containsKey("title")) {
        socialMetaTagParametersBuilder.setTitle((String)socialMetaTagParameters.get("title"));
      }
      parametersBuilder.setSocialMetaTagParameters(socialMetaTagParametersBuilder.build());
    }
  }

  private void setGoogleAnalyticsParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> googleAnalyticsParameters = (Map<String, Object>) m.get("googleAnalyticsParameters");
    if (googleAnalyticsParameters != null) {
      DynamicLink.GoogleAnalyticsParameters.Builder googleAnalyticsParametersBuilder =
        new DynamicLink.GoogleAnalyticsParameters.Builder();

      if (googleAnalyticsParameters.containsKey("campaign")) {
        googleAnalyticsParametersBuilder.setCampaign((String)googleAnalyticsParameters.get("campaign"));
      }
      if (googleAnalyticsParameters.containsKey("content")) {
        googleAnalyticsParametersBuilder.setContent((String)googleAnalyticsParameters.get("content"));
      }
      if (googleAnalyticsParameters.containsKey("medium")) {
        googleAnalyticsParametersBuilder.setMedium((String)googleAnalyticsParameters.get("medium"));
      }
      if (googleAnalyticsParameters.containsKey("source")) {
        googleAnalyticsParametersBuilder.setSource((String)googleAnalyticsParameters.get("source"));
      }
      if (googleAnalyticsParameters.containsKey("term")) {
        googleAnalyticsParametersBuilder.setTerm((String)googleAnalyticsParameters.get("term"));
      }
      parametersBuilder.setGoogleAnalyticsParameters(googleAnalyticsParametersBuilder.build());
    }
  }

  private void setItunesConnectAnalyticsParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> itunesConnectAnalyticsParameters = (Map<String, Object>) m.get("itunesConnectAnalyticsParameters");
    if (itunesConnectAnalyticsParameters != null) {
      DynamicLink.ItunesConnectAnalyticsParameters.Builder itunesConnectAnalyticsParametersBuilder =
        new DynamicLink.ItunesConnectAnalyticsParameters.Builder();

      if (itunesConnectAnalyticsParameters.containsKey("affiliateToken")) {
        itunesConnectAnalyticsParametersBuilder.setAffiliateToken((String)itunesConnectAnalyticsParameters.get("affiliateToken"));
      }
      if (itunesConnectAnalyticsParameters.containsKey("campaignToken")) {
        itunesConnectAnalyticsParametersBuilder.setCampaignToken((String)itunesConnectAnalyticsParameters.get("campaignToken"));
      }
      if (itunesConnectAnalyticsParameters.containsKey("providerToken")) {
        itunesConnectAnalyticsParametersBuilder.setProviderToken((String)itunesConnectAnalyticsParameters.get("providerToken"));
      }
      parametersBuilder.setItunesConnectAnalyticsParameters(itunesConnectAnalyticsParametersBuilder.build());
    }
  }
}
