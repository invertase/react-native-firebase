package io.invertase.firebase.links;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

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
}
