package io.invertase.firebase.links;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.appinvite.FirebaseAppInvite;
import com.google.firebase.dynamiclinks.DynamicLink;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;
import com.google.firebase.dynamiclinks.ShortDynamicLink;

import javax.annotation.Nonnull;

import io.invertase.firebase.Utils;

public class RNFirebaseLinks extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
  private final static String TAG = RNFirebaseLinks.class.getCanonicalName();
  private String mInitialLink = null;
  private boolean mInitialLinkInitialized = false;

  public RNFirebaseLinks(ReactApplicationContext reactContext) {
    super(reactContext);
    getReactApplicationContext().addActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
  }

  @Override
  public String getName() {
    return "RNFirebaseLinks";
  }

  @ReactMethod
  public void createDynamicLink(final ReadableMap linkData, final Promise promise) {
    try {
      DynamicLink.Builder builder = getDynamicLinkBuilder(linkData);
      String link = builder
        .buildDynamicLink()
        .getUri()
        .toString();
      Log.d(TAG, "created dynamic link: " + link);
      promise.resolve(link);
    } catch (Exception ex) {
      Log.e(TAG, "create dynamic link failure " + ex.getMessage());
      promise.reject("links/failure", ex.getMessage(), ex);
    }
  }

  @ReactMethod
  public void createShortDynamicLink(
    final ReadableMap linkData,
    final String type,
    final Promise promise
  ) {
    try {
      DynamicLink.Builder builder = getDynamicLinkBuilder(linkData);
      Task<ShortDynamicLink> shortLinkTask;
      if ("SHORT".equals(type)) {
        shortLinkTask = builder.buildShortDynamicLink(ShortDynamicLink.Suffix.SHORT);
      } else if ("UNGUESSABLE".equals(type)) {
        shortLinkTask = builder.buildShortDynamicLink(ShortDynamicLink.Suffix.UNGUESSABLE);
      } else {
        shortLinkTask = builder.buildShortDynamicLink();
      }

      shortLinkTask.addOnCompleteListener(new OnCompleteListener<ShortDynamicLink>() {
        @Override
        public void onComplete(@Nonnull Task<ShortDynamicLink> task) {
          if (task.isSuccessful()) {
            String shortLink = task
              .getResult()
              .getShortLink()
              .toString();
            Log.d(TAG, "created short dynamic link: " + shortLink);
            promise.resolve(shortLink);
          } else {
            Log.e(
              TAG,
              "create short dynamic link failure " + task
                .getException()
                .getMessage()
            );
            promise.reject(
              "links/failure",
              task
                .getException()
                .getMessage(),
              task.getException()
            );
          }
        }
      });
    } catch (Exception ex) {
      Log.e(TAG, "create short dynamic link failure " + ex.getMessage());
      promise.reject("links/failure", ex.getMessage(), ex);
    }
  }

  @ReactMethod
  public void getInitialLink(final Promise promise) {
    if (mInitialLinkInitialized) {
      promise.resolve(mInitialLink);
    } else {
      if (getCurrentActivity() != null) {
        FirebaseDynamicLinks
          .getInstance()
          .getDynamicLink(getCurrentActivity().getIntent())
          .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
            @Override
            public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
              if (pendingDynamicLinkData != null
                && !isInvitation(pendingDynamicLinkData)) {

                mInitialLink = pendingDynamicLinkData
                  .getLink()
                  .toString();
              }
              Log.d(TAG, "getInitialLink: link is: " + mInitialLink);
              mInitialLinkInitialized = true;
              promise.resolve(mInitialLink);
            }
          })
          .addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@Nonnull Exception e) {
              Log.e(TAG, "getInitialLink: failed to resolve link", e);
              promise.reject("link/initial-link-error", e.getMessage(), e);
            }
          });
      } else {
        Log.d(TAG, "getInitialLink: activity is null");
        promise.resolve(null);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  // Start ActivityEventListener methods
  //////////////////////////////////////////////////////////////////////
  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // Not required for this module
  }

  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks
      .getInstance()
      .getDynamicLink(intent)
      .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
        @Override
        public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
          if (pendingDynamicLinkData != null
            && !isInvitation(pendingDynamicLinkData)) {
            String link = pendingDynamicLinkData
              .getLink()
              .toString();
            Utils.sendEvent(
              getReactApplicationContext(),
              "links_link_received",
              link
            );
          }
        }
      });
  }
  //////////////////////////////////////////////////////////////////////
  // End ActivityEventListener methods
  //////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////
  // Start LifecycleEventListener methods
  //////////////////////////////////////////////////////////////////////
  @Override
  public void onHostResume() {
    // Not required for this module
  }

  @Override
  public void onHostPause() {
    // Not required for this module
  }

  @Override
  public void onHostDestroy() {
    mInitialLink = null;
    mInitialLinkInitialized = false;
  }
  //////////////////////////////////////////////////////////////////////
  // End LifecycleEventListener methods
  //////////////////////////////////////////////////////////////////////

  // Looks at the internals of the link data to detect whether it's an invitation or not
  private boolean isInvitation(PendingDynamicLinkData pendingDynamicLinkData) {
    FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(pendingDynamicLinkData);
    if (invite != null && invite.getInvitationId() != null && !invite
      .getInvitationId()
      .isEmpty()) {
      return true;
    }
    return false;
  }

  private DynamicLink.Builder getDynamicLinkBuilder(final ReadableMap linkData) {
    DynamicLink.Builder builder = FirebaseDynamicLinks
      .getInstance()
      .createDynamicLink();
    try {
      builder.setLink(Uri.parse(linkData.getString("link")));
      builder.setDomainUriPrefix(linkData.getString("domainURIPrefix"));
      setAnalyticsParameters(linkData.getMap("analytics"), builder);
      setAndroidParameters(linkData.getMap("android"), builder);
      setIosParameters(linkData.getMap("ios"), builder);
      setITunesParameters(linkData.getMap("itunes"), builder);
      setNavigationParameters(linkData.getMap("navigation"), builder);
      setSocialParameters(linkData.getMap("social"), builder);
    } catch (Exception e) {
      Log.e(TAG, "error while building parameters " + e.getMessage());
      throw e;
    }
    return builder;
  }

  private void setAnalyticsParameters(
    final ReadableMap analyticsData,
    final DynamicLink.Builder builder
  ) {
    DynamicLink.GoogleAnalyticsParameters.Builder analyticsParameters = new DynamicLink.GoogleAnalyticsParameters.Builder();

    if (analyticsData.hasKey("campaign")) {
      analyticsParameters.setCampaign(analyticsData.getString("campaign"));
    }
    if (analyticsData.hasKey("content")) {
      analyticsParameters.setContent(analyticsData.getString("content"));
    }
    if (analyticsData.hasKey("medium")) {
      analyticsParameters.setMedium(analyticsData.getString("medium"));
    }
    if (analyticsData.hasKey("source")) {
      analyticsParameters.setSource(analyticsData.getString("source"));
    }
    if (analyticsData.hasKey("term")) {
      analyticsParameters.setTerm(analyticsData.getString("term"));
    }
    builder.setGoogleAnalyticsParameters(analyticsParameters.build());
  }

  private void setAndroidParameters(
    final ReadableMap androidData,
    final DynamicLink.Builder builder
  ) {
    if (androidData.hasKey("packageName")) {
      DynamicLink.AndroidParameters.Builder androidParameters = new DynamicLink.AndroidParameters.Builder(
        androidData.getString("packageName"));

      if (androidData.hasKey("fallbackUrl")) {
        androidParameters.setFallbackUrl(Uri.parse(androidData.getString("fallbackUrl")));
      }
      if (androidData.hasKey("minimumVersion")) {
        androidParameters.setMinimumVersion(Integer.parseInt(androidData.getString("minimumVersion")));
      }
      builder.setAndroidParameters(androidParameters.build());
    }
  }

  private void setIosParameters(final ReadableMap iosData, final DynamicLink.Builder builder) {
    if (iosData.hasKey("bundleId")) {
      DynamicLink.IosParameters.Builder iosParameters =
        new DynamicLink.IosParameters.Builder(iosData.getString("bundleId"));

      if (iosData.hasKey("appStoreId")) {
        iosParameters.setAppStoreId(iosData.getString("appStoreId"));
      }
      if (iosData.hasKey("customScheme")) {
        iosParameters.setCustomScheme(iosData.getString("customScheme"));
      }
      if (iosData.hasKey("fallbackUrl")) {
        iosParameters.setFallbackUrl(Uri.parse(iosData.getString("fallbackUrl")));
      }
      if (iosData.hasKey("iPadBundleId")) {
        iosParameters.setIpadBundleId(iosData.getString("iPadBundleId"));
      }
      if (iosData.hasKey("iPadFallbackUrl")) {
        iosParameters.setIpadFallbackUrl(Uri.parse(iosData.getString("iPadFallbackUrl")));
      }
      if (iosData.hasKey("minimumVersion")) {
        iosParameters.setMinimumVersion(iosData.getString("minimumVersion"));
      }
      builder.setIosParameters(iosParameters.build());
    }
  }

  private void setITunesParameters(
    final ReadableMap itunesData,
    final DynamicLink.Builder builder
  ) {
    DynamicLink.ItunesConnectAnalyticsParameters.Builder itunesParameters = new DynamicLink.ItunesConnectAnalyticsParameters.Builder();

    if (itunesData.hasKey("affiliateToken")) {
      itunesParameters.setAffiliateToken(itunesData.getString("affiliateToken"));
    }
    if (itunesData.hasKey("campaignToken")) {
      itunesParameters.setCampaignToken(itunesData.getString("campaignToken"));
    }
    if (itunesData.hasKey("providerToken")) {
      itunesParameters.setProviderToken(itunesData.getString("providerToken"));
    }
    builder.setItunesConnectAnalyticsParameters(itunesParameters.build());
  }

  private void setNavigationParameters(
    final ReadableMap navigationData,
    final DynamicLink.Builder builder
  ) {
    DynamicLink.NavigationInfoParameters.Builder navigationParameters = new DynamicLink.NavigationInfoParameters.Builder();

    if (navigationData.hasKey("forcedRedirectEnabled")) {
      navigationParameters.setForcedRedirectEnabled(navigationData.getBoolean(
        "forcedRedirectEnabled"));
    }
    builder.setNavigationInfoParameters(navigationParameters.build());
  }

  private void setSocialParameters(
    final ReadableMap socialData,
    final DynamicLink.Builder builder
  ) {
    DynamicLink.SocialMetaTagParameters.Builder socialParameters = new DynamicLink.SocialMetaTagParameters.Builder();

    if (socialData.hasKey("descriptionText")) {
      socialParameters.setDescription(socialData.getString("descriptionText"));
    }
    if (socialData.hasKey("imageUrl")) {
      socialParameters.setImageUrl(Uri.parse(socialData.getString("imageUrl")));
    }
    if (socialData.hasKey("title")) {
      socialParameters.setTitle(socialData.getString("title"));
    }
    builder.setSocialMetaTagParameters(socialParameters.build());
  }
}
