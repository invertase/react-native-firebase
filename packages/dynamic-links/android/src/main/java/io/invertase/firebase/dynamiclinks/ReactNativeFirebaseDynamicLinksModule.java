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

import javax.annotation.Nullable;
import java.util.Objects;

public class ReactNativeFirebaseDynamicLinksModule extends ReactNativeFirebaseModule implements ActivityEventListener, LifecycleEventListener {
  private static final String TAG = "DynamicLinks";
  private static final String SHORT_LINK_TYPE_SHORT = "SHORT";
  private static final String SHORT_LINK_TYPE_UNGUESSABLE = "UNGUESSABLE";
  private String initialLinkValue = null;
  private boolean gotInitialLink = false;

  ReactNativeFirebaseDynamicLinksModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    getReactApplicationContext().addActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    getReactApplicationContext().removeActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
  }

  @ReactMethod
  public void buildLink(ReadableMap dynamicLinkMap, Promise promise) {
    Tasks
      .call(getExecutor(), () -> createDynamicLinkBuilder(dynamicLinkMap).buildDynamicLink().getUri().toString())
      .addOnCompleteListener(getExecutor(), (task) -> {
        if (task.isSuccessful()) {
          promise.resolve(task.getResult());
        } else {
          Log.e(TAG, "RNFB: Unknown error while building Dynamic Link " + task.getException().getMessage());
          rejectPromiseWithCodeAndMessage(promise, "build-failed", task.getException().getMessage());
        }
      });
  }

  @ReactMethod
  public void buildShortLink(ReadableMap dynamicLinkMap, String shortLinkType, Promise promise) {
    Tasks
      .call(getExecutor(), () -> {
        DynamicLink.Builder builder = createDynamicLinkBuilder(dynamicLinkMap);
        if (SHORT_LINK_TYPE_SHORT.equals(shortLinkType)) {
          return Tasks.await(builder.buildShortDynamicLink(ShortDynamicLink.Suffix.SHORT));
        }

        if (SHORT_LINK_TYPE_UNGUESSABLE.equals(shortLinkType)) {
          return Tasks.await(builder.buildShortDynamicLink(ShortDynamicLink.Suffix.UNGUESSABLE));
        }

        return Tasks.await(builder.buildShortDynamicLink());
      })
      .addOnCompleteListener(getExecutor(), (task) -> {
        if (task.isSuccessful()) {
          // TODO implement after v6
          // WritableMap shortLinkMap = Arguments.createMap();
          // WritableArray shortLinkWarnings = Arguments.createArray();
          // List<? extends ShortDynamicLink.Warning> warningsList = task.getResult().getWarnings();
          // for (ShortDynamicLink.Warning warning : warningsList) {
          //   shortLinkWarnings.pushString(warning.getMessage());
          // }
          // shortLinkMap.putArray("warnings", shortLinkWarnings);
          // shortLinkMap.putString("link", task.getResult().getShortLink().toString());

          promise.resolve(task.getResult().getShortLink().toString());
        } else {
          Log.e(TAG, "RNFB: Unknown error while building Dynamic Link " + task.getException().getMessage());
          rejectPromiseWithCodeAndMessage(promise, "build-failed", task.getException().getMessage());
        }
      });
  }

  @ReactMethod
  public void getInitialLink(Promise promise) {
    if (gotInitialLink) {
      promise.resolve(initialLinkValue);
      return;
    }

    Activity currentActivity = getCurrentActivity();
    if (currentActivity == null) {
      promise.resolve(null);
      return;
    }

    FirebaseDynamicLinks.getInstance()
      .getDynamicLink(currentActivity.getIntent())
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          gotInitialLink = true;

          PendingDynamicLinkData pendingDynamicLinkData = task.getResult();
          if (pendingDynamicLinkData != null) {
            initialLinkValue = pendingDynamicLinkData.getLink().toString();
          }

          promise.resolve(initialLinkValue);
        } else {
          rejectPromiseWithCodeAndMessage(promise, "initial-link-error", task.getException().getMessage());
        }
      });
  }

  private DynamicLink.Builder createDynamicLinkBuilder(final ReadableMap dynamicLinkMap) {
    DynamicLink.Builder builder = FirebaseDynamicLinks.getInstance().createDynamicLink();

    builder.setLink(Uri.parse(dynamicLinkMap.getString("link")));
    builder.setDomainUriPrefix(Objects.requireNonNull(dynamicLinkMap.getString("domainUriPrefix")));

    buildIosParameters(dynamicLinkMap.getMap("ios"), builder);
    buildItunesParameters(dynamicLinkMap.getMap("itunes"), builder);
    buildSocialParameters(dynamicLinkMap.getMap("social"), builder);
    buildAndroidParameters(dynamicLinkMap.getMap("android"), builder);
    buildAnalyticsParameters(dynamicLinkMap.getMap("analytics"), builder);
    buildNavigationParameters(dynamicLinkMap.getMap("navigation"), builder);

    return builder;
  }

  private void buildAnalyticsParameters(
    @Nullable ReadableMap analyticsMap,
    DynamicLink.Builder builder
  ) {
    if (analyticsMap == null) return;
    DynamicLink.GoogleAnalyticsParameters.Builder analyticsBuilder = new DynamicLink.GoogleAnalyticsParameters.Builder();

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
    @Nullable ReadableMap androidMap,
    DynamicLink.Builder builder
  ) {
    if (androidMap == null) return;
    DynamicLink.AndroidParameters.Builder androidBuilder = new DynamicLink.AndroidParameters.Builder(
      Objects.requireNonNull(androidMap.getString("packageName"))
    );

    if (androidMap.hasKey("fallbackUrl")) {
      androidBuilder.setFallbackUrl(Uri.parse(androidMap.getString("fallbackUrl")));
    }

    if (androidMap.hasKey("minimumVersion")) {
      androidBuilder.setMinimumVersion(
        Integer.parseInt(
          Objects.requireNonNull(androidMap.getString("minimumVersion"))
        )
      );
    }

    builder.setAndroidParameters(androidBuilder.build());
  }

  private void buildIosParameters(@Nullable ReadableMap iosMap, DynamicLink.Builder builder) {
    if (iosMap == null) return;

    DynamicLink.IosParameters.Builder iosBuilder = new DynamicLink.IosParameters.Builder(
      Objects.requireNonNull(iosMap.getString("bundleId"))
    );

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

  private void buildItunesParameters(
    @Nullable ReadableMap iTunesMap,
    DynamicLink.Builder builder
  ) {
    if (iTunesMap == null) return;
    DynamicLink.ItunesConnectAnalyticsParameters.Builder iTunesBuilder = new DynamicLink.ItunesConnectAnalyticsParameters.Builder();

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
    @Nullable ReadableMap navigationMap,
    DynamicLink.Builder builder
  ) {
    if (navigationMap == null) return;
    DynamicLink.NavigationInfoParameters.Builder navigationBuilder = new DynamicLink.NavigationInfoParameters.Builder();

    if (navigationMap.hasKey("forcedRedirectEnabled")) {
      navigationBuilder.setForcedRedirectEnabled(
        navigationMap.getBoolean("forcedRedirectEnabled")
      );
    }

    builder.setNavigationInfoParameters(navigationBuilder.build());
  }

  private void buildSocialParameters(
    @Nullable ReadableMap socialMap,
    DynamicLink.Builder builder
  ) {
    if (socialMap == null) return;
    DynamicLink.SocialMetaTagParameters.Builder socialBuilder = new DynamicLink.SocialMetaTagParameters.Builder();

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
    initialLinkValue = null;
    gotInitialLink = false;
  }

  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks
      .getInstance()
      .getDynamicLink(intent)
      .addOnCompleteListener(task -> {
        if (task.isSuccessful()) {
          PendingDynamicLinkData pendingDynamicLinkData = task.getResult();
          if (pendingDynamicLinkData != null) {
            WritableMap body = Arguments.createMap();
            body.putString("url", pendingDynamicLinkData.getLink().toString());
            ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(new ReactNativeFirebaseEvent(
              "dynamic_links_link_received",
              body
            ));
          }
        } else {
          Log.e(TAG, "RNFB: An unknown exception occurred calling getDynamicLink", task.getException());
        }
      });
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
  }

  @Override
  public void onHostResume() {
  }

  @Override
  public void onHostPause() {
  }
}
