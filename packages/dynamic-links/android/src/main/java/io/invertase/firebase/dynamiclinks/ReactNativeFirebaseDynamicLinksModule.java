package io.invertase.firebase.dynamiclinks;

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

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.bridge.*;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.dynamiclinks.DynamicLink;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;
import com.google.firebase.dynamiclinks.ShortDynamicLink;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.Objects;
import javax.annotation.Nullable;

public class ReactNativeFirebaseDynamicLinksModule extends ReactNativeFirebaseModule
    implements ActivityEventListener, LifecycleEventListener {
  private static final String TAG = "DynamicLinks";
  private static final String SHORT_LINK_TYPE_SHORT = "SHORT";
  private static final String SHORT_LINK_TYPE_UNGUESSABLE = "UNGUESSABLE";

  private String initialLinkUrl = null;
  private int initialLinkMinimumVersion = 0;

  /** Ensures calls to getInitialLink only tries to retrieve the link from getDynamicLink once. */
  private boolean gotInitialLink = false;
  /**
   * Used by getInitialLink to check if the activity has been resumed. "host" refers to the host
   * activity, in terms of {@link LifeCycleEventListener#onHostResume()}
   */
  private boolean hostResumed = false;
  /**
   * Used by getInitialLink to check the current activity's intent flags to verify that the app
   * hasn't been resumed from the Overview (history) screen.
   */
  private boolean launchedFromHistory = false;
  /**
   * Holds the Promise that was passed to getInitialLink if getInitialLink was called before {@link
   * com.facebook.react.common.LifecycleState#RESUMED} Lifecycle state.
   */
  private Promise initialPromise = null;

  ReactNativeFirebaseDynamicLinksModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    getReactApplicationContext().addActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    getReactApplicationContext().removeActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
    super.onCatalystInstanceDestroy();
  }

  @ReactMethod
  public void buildLink(ReadableMap dynamicLinkMap, Promise promise) {
    Tasks.call(
            getExecutor(),
            () -> createDynamicLinkBuilder(dynamicLinkMap).buildDynamicLink().getUri().toString())
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                promise.resolve(task.getResult());
              } else {
                Log.e(TAG, "RNFB: Unknown error while building Dynamic Link ", task.getException());
                rejectPromiseWithCodeAndMessage(
                    promise, "build-failed", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void buildShortLink(ReadableMap dynamicLinkMap, String shortLinkType, Promise promise) {
    Tasks.call(
            getExecutor(),
            () -> {
              DynamicLink.Builder builder = createDynamicLinkBuilder(dynamicLinkMap);
              if (SHORT_LINK_TYPE_SHORT.equals(shortLinkType)) {
                return Tasks.await(builder.buildShortDynamicLink(ShortDynamicLink.Suffix.SHORT));
              }

              if (SHORT_LINK_TYPE_UNGUESSABLE.equals(shortLinkType)) {
                return Tasks.await(
                    builder.buildShortDynamicLink(ShortDynamicLink.Suffix.UNGUESSABLE));
              }

              return Tasks.await(builder.buildShortDynamicLink());
            })
        .addOnCompleteListener(
            getExecutor(),
            (task) -> {
              if (task.isSuccessful()) {
                // TODO implement after v6
                // WritableMap shortLinkMap = Arguments.createMap();
                // WritableArray shortLinkWarnings = Arguments.createArray();
                // List<? extends ShortDynamicLink.Warning> warningsList =
                // task.getResult().getWarnings();
                // for (ShortDynamicLink.Warning warning : warningsList) {
                //   shortLinkWarnings.pushString(warning.getMessage());
                // }
                // shortLinkMap.putArray("warnings", shortLinkWarnings);
                // shortLinkMap.putString("link", task.getResult().getShortLink().toString());

                promise.resolve(task.getResult().getShortLink().toString());
              } else {
                Log.e(
                    TAG,
                    "RNFB: Unknown error while building Dynamic Link "
                        + task.getException().getMessage());
                rejectPromiseWithCodeAndMessage(
                    promise, "build-failed", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void getInitialLink(Promise promise) {
    // Check if getDynamicLink() has already completed successfully.
    // This ensures the initial link is returned once, if found.
    if (gotInitialLink) {
      promise.resolve(null);
      return;
    }

    // Check for the case where getInitialLink
    // runs before the LifeCycleState is RESUMED (e.g. BEFORE_CREATE or BEFORE_RESUME).
    if (!hostResumed) {
      // Use initialPromise to store the Promise that was passed and
      // run it when LifeCycleState changes to RESUMED in onHostResume.
      initialPromise = promise;
      return;
    }

    Activity currentActivity = getCurrentActivity();
    // Shouldn't happen anymore, left as a guard.
    if (currentActivity == null) {
      promise.resolve(null);
      return;
    }

    Intent currentIntent = currentActivity.getIntent();
    if (currentIntent == null) {
      promise.resolve(null);
      return;
    }

    // Verify if the app was resumed from the Overview (history) screen.
    launchedFromHistory =
        (currentIntent != null)
            && ((currentIntent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0);

    FirebaseDynamicLinks.getInstance()
        .getDynamicLink(currentIntent)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                // Flag that the getDynamicLink() completed successfully,
                // preventing future calls to from receiving the link, as if the link had been
                // cleared.
                gotInitialLink = true;
                PendingDynamicLinkData pendingDynamicLinkData = task.getResult();
                WritableMap initialLinkUtmParameters = new WritableNativeMap();

                if (pendingDynamicLinkData != null) {
                  initialLinkUrl = pendingDynamicLinkData.getLink().toString();
                  initialLinkMinimumVersion = pendingDynamicLinkData.getMinimumAppVersion();
                  initialLinkUtmParameters =
                      Arguments.makeNativeMap(pendingDynamicLinkData.getUtmParameters());
                }

                // Guard against the scenario where the app was launched using a dynamic link,
                // then, the app was backgrounded using the Back button, and resumed from the
                // Overview (screen).
                if (initialLinkUrl != null && !launchedFromHistory) {
                  promise.resolve(
                      dynamicLinkToWritableMap(
                          initialLinkUrl, initialLinkMinimumVersion, initialLinkUtmParameters));
                } else {
                  promise.resolve(null);
                }
              } else {
                rejectPromiseWithCodeAndMessage(
                    promise, "initial-link-error", task.getException().getMessage());
              }
            });
  }

  @ReactMethod
  public void resolveLink(String link, Promise promise) {
    try {
      FirebaseDynamicLinks.getInstance()
          .getDynamicLink(Uri.parse(link))
          .addOnCompleteListener(
              task -> {
                if (task.isSuccessful()) {
                  PendingDynamicLinkData linkData = task.getResult();
                  // Note: link == null if link invalid, isSuccessful is only false on processing
                  // error
                  if (linkData != null
                      && linkData.getLink() != null
                      && linkData.getLink().toString() != null) {
                    String linkUrl = linkData.getLink().toString();
                    int linkMinimumVersion = linkData.getMinimumAppVersion();
                    Bundle linkUtmParameters = linkData.getUtmParameters();
                    promise.resolve(
                        dynamicLinkToWritableMap(
                            linkUrl,
                            linkMinimumVersion,
                            Arguments.makeNativeMap(linkUtmParameters)));
                  } else {
                    rejectPromiseWithCodeAndMessage(promise, "not-found", "Dynamic link not found");
                  }
                } else {
                  rejectPromiseWithCodeAndMessage(
                      promise, "resolve-link-error", task.getException().getMessage());
                }
              });
    } catch (Exception e) {
      // This would be very unexpected, but crashing is even less expected
      rejectPromiseWithCodeAndMessage(promise, "resolve-link-error", "Unknown resolve failure");
    }
  }

  private WritableMap dynamicLinkToWritableMap(
      String url, int minVersion, WritableMap utmParameters) {
    WritableMap writableMap = Arguments.createMap();

    writableMap.putString("url", url);

    if (minVersion == 0) {
      writableMap.putNull("minimumAppVersion");
    } else {
      writableMap.putInt("minimumAppVersion", minVersion);
    }

    writableMap.putMap("utmParameters", utmParameters);

    return writableMap;
  }

  private DynamicLink.Builder createDynamicLinkBuilder(final ReadableMap dynamicLinkMap) {
    DynamicLink.Builder builder = FirebaseDynamicLinks.getInstance().createDynamicLink();

    builder.setLink(Uri.parse(dynamicLinkMap.getString("link")));
    builder.setDomainUriPrefix(Objects.requireNonNull(dynamicLinkMap.getString("domainUriPrefix")));

    if (dynamicLinkMap.hasKey("ios")) {
      buildIosParameters(dynamicLinkMap.getMap("ios"), builder);
    }

    if (dynamicLinkMap.hasKey("itunes")) {
      buildItunesParameters(dynamicLinkMap.getMap("itunes"), builder);
    }

    if (dynamicLinkMap.hasKey("social")) {
      buildSocialParameters(dynamicLinkMap.getMap("social"), builder);
    }

    if (dynamicLinkMap.hasKey("android")) {
      buildAndroidParameters(dynamicLinkMap.getMap("android"), builder);
    }

    if (dynamicLinkMap.hasKey("analytics")) {
      buildAnalyticsParameters(dynamicLinkMap.getMap("analytics"), builder);
    }

    if (dynamicLinkMap.hasKey("navigation")) {
      buildNavigationParameters(dynamicLinkMap.getMap("navigation"), builder);
    }

    if (dynamicLinkMap.hasKey("otherPlatform")) {
      if (dynamicLinkMap.getMap("otherPlatform").hasKey("fallbackUrl")) {
        String OTHER_PLATFORM_LINK_KEY = "ofl";
        String linkUrl = String.valueOf(builder.buildDynamicLink().getUri());
        linkUrl +=
            '&'
                + OTHER_PLATFORM_LINK_KEY
                + '='
                + dynamicLinkMap.getMap("otherPlatform").getString("fallbackUrl");
        builder.setLongLink(Uri.parse(linkUrl));
      }
    }

    return builder;
  }

  private void buildAnalyticsParameters(
      @Nullable ReadableMap analyticsMap, DynamicLink.Builder builder) {
    if (analyticsMap == null) return;
    DynamicLink.GoogleAnalyticsParameters.Builder analyticsBuilder =
        new DynamicLink.GoogleAnalyticsParameters.Builder();

    if (analyticsMap.hasKey("campaign")) {
      analyticsBuilder.setCampaign(analyticsMap.getString("campaign"));
    }

    if (analyticsMap.hasKey("content")) {
      analyticsBuilder.setContent(analyticsMap.getString("content"));
    }

    if (analyticsMap.hasKey("medium")) {
      analyticsBuilder.setMedium(analyticsMap.getString("medium"));
    }

    if (analyticsMap.hasKey("source")) {
      analyticsBuilder.setSource(analyticsMap.getString("source"));
    }

    if (analyticsMap.hasKey("term")) {
      analyticsBuilder.setTerm(analyticsMap.getString("term"));
    }

    builder.setGoogleAnalyticsParameters(analyticsBuilder.build());
  }

  private void buildAndroidParameters(
      @Nullable ReadableMap androidMap, DynamicLink.Builder builder) {
    if (androidMap == null) return;
    DynamicLink.AndroidParameters.Builder androidBuilder =
        new DynamicLink.AndroidParameters.Builder(
            Objects.requireNonNull(androidMap.getString("packageName")));

    if (androidMap.hasKey("fallbackUrl")) {
      androidBuilder.setFallbackUrl(Uri.parse(androidMap.getString("fallbackUrl")));
    }

    if (androidMap.hasKey("minimumVersion")) {
      androidBuilder.setMinimumVersion(
          Integer.parseInt(Objects.requireNonNull(androidMap.getString("minimumVersion"))));
    }

    builder.setAndroidParameters(androidBuilder.build());
  }

  private void buildIosParameters(@Nullable ReadableMap iosMap, DynamicLink.Builder builder) {
    if (iosMap == null) return;

    DynamicLink.IosParameters.Builder iosBuilder =
        new DynamicLink.IosParameters.Builder(Objects.requireNonNull(iosMap.getString("bundleId")));

    if (iosMap.hasKey("appStoreId")) {
      iosBuilder.setAppStoreId(iosMap.getString("appStoreId"));
    }

    if (iosMap.hasKey("customScheme")) {
      iosBuilder.setCustomScheme(iosMap.getString("customScheme"));
    }

    if (iosMap.hasKey("fallbackUrl")) {
      iosBuilder.setFallbackUrl(Uri.parse(iosMap.getString("fallbackUrl")));
    }

    if (iosMap.hasKey("iPadBundleId")) {
      iosBuilder.setIpadBundleId(iosMap.getString("iPadBundleId"));
    }

    if (iosMap.hasKey("iPadFallbackUrl")) {
      iosBuilder.setIpadFallbackUrl(Uri.parse(iosMap.getString("iPadFallbackUrl")));
    }

    if (iosMap.hasKey("minimumVersion")) {
      iosBuilder.setMinimumVersion(iosMap.getString("minimumVersion"));
    }

    builder.setIosParameters(iosBuilder.build());
  }

  private void buildItunesParameters(@Nullable ReadableMap iTunesMap, DynamicLink.Builder builder) {
    if (iTunesMap == null) return;
    DynamicLink.ItunesConnectAnalyticsParameters.Builder iTunesBuilder =
        new DynamicLink.ItunesConnectAnalyticsParameters.Builder();

    if (iTunesMap.hasKey("affiliateToken")) {
      iTunesBuilder.setAffiliateToken(iTunesMap.getString("affiliateToken"));
    }

    if (iTunesMap.hasKey("campaignToken")) {
      iTunesBuilder.setCampaignToken(iTunesMap.getString("campaignToken"));
    }

    if (iTunesMap.hasKey("providerToken")) {
      iTunesBuilder.setProviderToken(iTunesMap.getString("providerToken"));
    }

    builder.setItunesConnectAnalyticsParameters(iTunesBuilder.build());
  }

  private void buildNavigationParameters(
      @Nullable ReadableMap navigationMap, DynamicLink.Builder builder) {
    if (navigationMap == null) return;
    DynamicLink.NavigationInfoParameters.Builder navigationBuilder =
        new DynamicLink.NavigationInfoParameters.Builder();

    if (navigationMap.hasKey("forcedRedirectEnabled")) {
      navigationBuilder.setForcedRedirectEnabled(navigationMap.getBoolean("forcedRedirectEnabled"));
    }

    builder.setNavigationInfoParameters(navigationBuilder.build());
  }

  private void buildSocialParameters(@Nullable ReadableMap socialMap, DynamicLink.Builder builder) {
    if (socialMap == null) return;
    DynamicLink.SocialMetaTagParameters.Builder socialBuilder =
        new DynamicLink.SocialMetaTagParameters.Builder();

    if (socialMap.hasKey("descriptionText")) {
      socialBuilder.setDescription(socialMap.getString("descriptionText"));
    }

    if (socialMap.hasKey("imageUrl")) {
      socialBuilder.setImageUrl(Uri.parse(socialMap.getString("imageUrl")));
    }

    if (socialMap.hasKey("title")) {
      socialBuilder.setTitle(socialMap.getString("title"));
    }

    builder.setSocialMetaTagParameters(socialBuilder.build());
  }

  @Override
  public void onHostDestroy() {
    initialLinkUrl = null;
    gotInitialLink = false;
    initialLinkMinimumVersion = 0;
    launchedFromHistory = false;
    initialPromise = null;
    hostResumed = false;
  }

  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks.getInstance()
        .getDynamicLink(intent)
        .addOnCompleteListener(
            task -> {
              if (task.isSuccessful()) {
                PendingDynamicLinkData pendingDynamicLinkData = task.getResult();
                if (pendingDynamicLinkData != null) {
                  ReactNativeFirebaseEventEmitter.getSharedInstance()
                      .sendEvent(
                          new ReactNativeFirebaseEvent(
                              "dynamic_links_link_received",
                              dynamicLinkToWritableMap(
                                  pendingDynamicLinkData.getLink().toString(),
                                  pendingDynamicLinkData.getMinimumAppVersion(),
                                  Arguments.makeNativeMap(
                                      pendingDynamicLinkData.getUtmParameters()))));
                }
              } else {
                Log.e(
                    TAG,
                    "RNFB: An unknown exception occurred calling getDynamicLink",
                    task.getException());
              }
            });
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {}

  @Override
  public void onHostResume() {
    // Flag state is resumed.
    hostResumed = true;
    // Check if getInitialLink was called before LifeCycleState was RESUMED
    // and there's a pending Promise.
    if (initialPromise != null) {
      // Call getInitialLink getInitialLink with the Promise that was passed in the original call.
      getInitialLink(initialPromise);
      // Clear the Promise
      initialPromise = null;
    }
  }

  @Override
  public void onHostPause() {
    // Flag state is not resumed.
    hostResumed = false;
  }
}
