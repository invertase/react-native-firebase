package io.invertase.firebase.invites;

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

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.appinvite.AppInviteInvitation;
import com.google.firebase.appinvite.FirebaseAppInvite;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseInvitesModule extends ReactNativeFirebaseModule implements ActivityEventListener, LifecycleEventListener {
  private static final String TAG = "Invites";
  private static final int REQUEST_INVITE = 17517;
  private Promise mPromise = null;
  private String mInitialDeepLink = null;
  private String mInitialInvitationId = null;
  private boolean mInitialInvitationInitialized = false;

  ReactNativeFirebaseInvitesModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    getReactApplicationContext().addActivityEventListener(this);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    getReactApplicationContext().removeActivityEventListener(this);
  }

  @ReactMethod
  public void getInitialInvitation(final Promise promise) {
    if (mInitialInvitationInitialized) {
      if (mInitialDeepLink != null || mInitialInvitationId != null) {
        promise.resolve(buildInvitationMap(mInitialDeepLink, mInitialInvitationId));
      } else {
        promise.resolve(null);
      }
      return;
    }

    if (getCurrentActivity() == null) {
      promise.resolve(null);
      return;
    }

    Intent intent = getCurrentActivity().getIntent();

    FirebaseDynamicLinks.getInstance().getDynamicLink(intent).addOnCompleteListener(task -> {
      if (!task.isSuccessful()) {
        String message = Objects.requireNonNull(task.getException()).getMessage();
        rejectPromiseWithCodeAndMessage(promise, "initial-invitation-error", message);
        return;
      }

      PendingDynamicLinkData linkData = task.getResult();
      mInitialInvitationInitialized = true;

      if (linkData == null) {
        promise.resolve(null);
        return;
      }

      FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(linkData);

      if (invite == null) {
        promise.resolve(null);
        return;
      }

      mInitialInvitationId = invite.getInvitationId();
      mInitialDeepLink = linkData.getLink().toString();
      promise.resolve(buildInvitationMap(mInitialDeepLink, mInitialInvitationId));
    });
  }

  @ReactMethod
  public void sendInvitation(ReadableMap invitationMap, Promise promise) {
    this.mPromise = promise;
    String title = Objects.requireNonNull(invitationMap.getString("title"));
    AppInviteInvitation.IntentBuilder intentBuilder = new AppInviteInvitation.IntentBuilder(title);

    if (invitationMap.hasKey("androidMinimumVersionCode")) {
      Double androidMinimumVersionCode = invitationMap.getDouble("androidMinimumVersionCode");
      intentBuilder.setAndroidMinimumVersionCode(androidMinimumVersionCode.intValue());
    }

    if (invitationMap.hasKey("callToActionText")) {
      intentBuilder.setCallToActionText(Objects.requireNonNull(invitationMap.getString(
        "callToActionText")));
    }

    if (invitationMap.hasKey("customImage")) {
      intentBuilder.setCustomImage(Uri.parse(invitationMap.getString("customImage")));
    }

    if (invitationMap.hasKey("deepLink")) {
      intentBuilder.setDeepLink(Uri.parse(invitationMap.getString("deepLink")));
    }

    if (invitationMap.hasKey("iosClientId")) {
      intentBuilder.setOtherPlatformsTargetApplication(
        AppInviteInvitation.IntentBuilder.PlatformMode.PROJECT_PLATFORM_IOS,
        invitationMap.getString("iosClientId")
      );
    }

    intentBuilder.setMessage(invitationMap.getString("message"));

    if (invitationMap.hasKey("android")) {
      ReadableMap androidMap = Objects.requireNonNull(invitationMap.getMap("android"));

      if (androidMap.hasKey("additionalReferralParameters")) {
        Map<String, String> arpMap = new HashMap<>();
        ReadableMap arpReadableMap = Objects.requireNonNull(androidMap.getMap(
          "additionalReferralParameters"));
        ReadableMapKeySetIterator iterator = arpReadableMap.keySetIterator();

        while (iterator.hasNextKey()) {
          String key = iterator.nextKey();
          arpMap.put(key, arpReadableMap.getString(key));
        }

        intentBuilder.setAdditionalReferralParameters(arpMap);
      }

      if (androidMap.hasKey("emailHtmlContent")) {
        intentBuilder.setEmailHtmlContent(androidMap.getString("emailHtmlContent"));
      }

      if (androidMap.hasKey("emailSubject")) {
        intentBuilder.setEmailSubject(androidMap.getString("emailSubject"));
      }

      if (androidMap.hasKey("googleAnalyticsTrackingId")) {
        intentBuilder.setGoogleAnalyticsTrackingId(androidMap.getString("googleAnalyticsTrackingId"));
      }
    }

    Intent invitationIntent = intentBuilder.build();
    Activity currentActivity = this.getCurrentActivity();

    if (currentActivity != null) {
      currentActivity.startActivityForResult(invitationIntent, REQUEST_INVITE);
    }
  }

  @Override
  public void onActivityResult(
    Activity activity,
    int requestCode,
    int resultCode,
    Intent intentData
  ) {
    if (requestCode != REQUEST_INVITE) return;
    if (mPromise == null) return;

    if (resultCode == Activity.RESULT_OK) {
      String[] ids = AppInviteInvitation.getInvitationIds(resultCode, intentData);
      mPromise.resolve(Arguments.fromList(Arrays.asList(ids)));
    } else if (resultCode == Activity.RESULT_CANCELED) {
      rejectPromiseWithCodeAndMessage(mPromise, "invitation-cancelled", "Invitation cancelled");
    } else {
      rejectPromiseWithCodeAndMessage(mPromise, "invitation-error", "Invitation failed to send");
    }

    mPromise = null;
  }


  // TODO(salakar) can getInitialLink be replaced with on new intent first received
  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks.getInstance().getDynamicLink(intent).addOnCompleteListener(task -> {
      if (!task.isSuccessful()) {
        // TODO(salakar) emit error event
        return;
      }

      PendingDynamicLinkData linkData = task.getResult();
      if (linkData == null) return;

      FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(linkData);
      if (invite == null) return;

      String inviteId = invite.getInvitationId();
      String deepLink = linkData.getLink().toString();
      WritableMap inviteMap = buildInvitationMap(deepLink, inviteId);
      ReactNativeFirebaseLinksOnLinkEvent event = new ReactNativeFirebaseLinksOnLinkEvent(
        inviteMap);
      ReactNativeFirebaseEventEmitter.getSharedInstance().sendEvent(event);
    });
  }

  @Override
  public void onHostResume() {
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
    mInitialDeepLink = null;
    mInitialInvitationId = null;
    mInitialInvitationInitialized = false;
  }


  private WritableMap buildInvitationMap(String deepLink, String invitationId) {
    WritableMap invitationMap = Arguments.createMap();
    // TODO(salakar) clickTimestamp
    invitationMap.putString("deepLink", deepLink);
    invitationMap.putString("invitationId", invitationId);
    return invitationMap;
  }
}
