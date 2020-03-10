package io.invertase.firebase.invites;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.appinvite.AppInviteInvitation;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.appinvite.FirebaseAppInvite;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import io.invertase.firebase.Utils;

public class RNFirebaseInvites extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
  private static final String TAG = "RNFirebaseInvites";
  private static final int REQUEST_INVITE = 17517;
  private boolean mInitialInvitationInitialized = false;
  private String mInitialDeepLink = null;
  private String mInitialInvitationId = null;
  private Promise mPromise = null;

  public RNFirebaseInvites(ReactApplicationContext context) {
    super(context);
    getReactApplicationContext().addActivityEventListener(this);
  }

  @Override
  public String getName() {
    return "RNFirebaseInvites";
  }

  @ReactMethod
  public void getInitialInvitation(final Promise promise) {
    if (mInitialInvitationInitialized) {
      if (mInitialDeepLink != null || mInitialInvitationId != null) {
        promise.resolve(buildInvitationMap(mInitialDeepLink, mInitialInvitationId));
      } else {
        promise.resolve(null);
      }
    } else {
      if (getCurrentActivity() != null) {
        FirebaseDynamicLinks
          .getInstance()
          .getDynamicLink(getCurrentActivity().getIntent())
          .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
            @Override
            public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
              if (pendingDynamicLinkData != null) {
                FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(
                  pendingDynamicLinkData);
                if (invite == null) {
                  promise.resolve(null);
                  return;
                }

                mInitialDeepLink = pendingDynamicLinkData
                  .getLink()
                  .toString();
                mInitialInvitationId = invite.getInvitationId();
                promise.resolve(buildInvitationMap(
                  mInitialDeepLink,
                  mInitialInvitationId
                ));
              } else {
                promise.resolve(null);
              }
              mInitialInvitationInitialized = true;
            }
          })
          .addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@Nonnull Exception e) {
              Log.e(TAG, "getInitialInvitation: failed to resolve invitation", e);
              promise.reject(
                "invites/initial-invitation-error",
                e.getMessage(),
                e
              );
            }
          });
      } else {
        Log.d(TAG, "getInitialInvitation: activity is null");
        promise.resolve(null);
      }
    }
  }

  @ReactMethod
  public void sendInvitation(ReadableMap invitationMap, Promise promise) {
    if (!invitationMap.hasKey("message")) {
      promise.reject(
        "invites/invalid-invitation",
        "The supplied invitation is missing a 'message' field"
      );
      return;
    }
    if (!invitationMap.hasKey("title")) {
      promise.reject(
        "invites/invalid-invitation",
        "The supplied invitation is missing a 'title' field"
      );
      return;
    }

    AppInviteInvitation.IntentBuilder ib = new AppInviteInvitation.IntentBuilder(invitationMap.getString(
      "title"));
    if (invitationMap.hasKey("androidMinimumVersionCode")) {
      Double androidMinimumVersionCode = invitationMap.getDouble("androidMinimumVersionCode");
      ib = ib.setAndroidMinimumVersionCode(androidMinimumVersionCode.intValue());
    }
    if (invitationMap.hasKey("callToActionText")) {
      ib = ib.setCallToActionText(invitationMap.getString("callToActionText"));
    }
    if (invitationMap.hasKey("customImage")) {
      ib = ib.setCustomImage(Uri.parse(invitationMap.getString("customImage")));
    }
    if (invitationMap.hasKey("deepLink")) {
      ib = ib.setDeepLink(Uri.parse(invitationMap.getString("deepLink")));
    }
    if (invitationMap.hasKey("iosClientId")) {
      ib = ib.setOtherPlatformsTargetApplication(
        AppInviteInvitation.IntentBuilder.PlatformMode.PROJECT_PLATFORM_IOS,
        invitationMap.getString("iosClientId")
      );
    }
    ib = ib.setMessage(invitationMap.getString("message"));

    // Android specific properties
    if (invitationMap.hasKey("android")) {
      ReadableMap androidMap = invitationMap.getMap("android");

      if (androidMap.hasKey("additionalReferralParameters")) {
        Map<String, String> arpMap = new HashMap<>();
        ReadableMap arpReadableMap = androidMap.getMap("additionalReferralParameters");
        ReadableMapKeySetIterator iterator = arpReadableMap.keySetIterator();
        while (iterator.hasNextKey()) {
          String key = iterator.nextKey();
          arpMap.put(key, arpReadableMap.getString(key));
        }
        ib = ib.setAdditionalReferralParameters(arpMap);
      }
      if (androidMap.hasKey("emailHtmlContent")) {
        ib = ib.setEmailHtmlContent(androidMap.getString("emailHtmlContent"));
      }
      if (androidMap.hasKey("emailSubject")) {
        ib = ib.setEmailSubject(androidMap.getString("emailSubject"));
      }
      if (androidMap.hasKey("googleAnalyticsTrackingId")) {
        ib = ib.setGoogleAnalyticsTrackingId(androidMap.getString("googleAnalyticsTrackingId"));
      }
    }

    Intent invitationIntent = ib.build();
    // Save the promise for later
    this.mPromise = promise;

    // Start the intent
    this
      .getCurrentActivity()
      .startActivityForResult(invitationIntent, REQUEST_INVITE);
  }

  //////////////////////////////////////////////////////////////////////
  // Start ActivityEventListener methods
  //////////////////////////////////////////////////////////////////////
  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    if (requestCode == REQUEST_INVITE) {
      if (resultCode == Activity.RESULT_OK) {
        String[] ids = AppInviteInvitation.getInvitationIds(resultCode, data);
        mPromise.resolve(Arguments.fromList(Arrays.asList(ids)));
      } else if (resultCode == Activity.RESULT_CANCELED) {
        mPromise.reject("invites/invitation-cancelled", "Invitation cancelled");
      } else {
        mPromise.reject("invites/invitation-error", "Invitation failed to send");
      }
      // Clear the promise
      mPromise = null;
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks
      .getInstance()
      .getDynamicLink(intent)
      .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
        @Override
        public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
          if (pendingDynamicLinkData != null) {
            FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(
              pendingDynamicLinkData);
            if (invite == null) {
              // this is a dynamic link, not an invitation
              return;
            }

            String deepLink = pendingDynamicLinkData
              .getLink()
              .toString();
            String invitationId = invite.getInvitationId();
            WritableMap invitationMap = buildInvitationMap(
              deepLink,
              invitationId
            );
            Utils.sendEvent(
              getReactApplicationContext(),
              "invites_invitation_received",
              invitationMap
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
    mInitialDeepLink = null;
    mInitialInvitationId = null;
    mInitialInvitationInitialized = false;
  }
  //////////////////////////////////////////////////////////////////////
  // End LifecycleEventListener methods
  //////////////////////////////////////////////////////////////////////

  private WritableMap buildInvitationMap(String deepLink, String invitationId) {
    WritableMap invitationMap = Arguments.createMap();
    invitationMap.putString("deepLink", deepLink);
    invitationMap.putString("invitationId", invitationId);

    return invitationMap;
  }
}
