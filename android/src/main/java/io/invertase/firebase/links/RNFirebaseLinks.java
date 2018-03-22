package io.invertase.firebase.links;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.WritableMap;
import com.google.firebase.appinvite.FirebaseAppInvite;
import com.google.firebase.dynamiclinks.DynamicLink;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.ShortDynamicLink;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.OnFailureListener;

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
  public void createDynamicLink(final ReadableMap parameters, final Promise promise) {
    try {
      Map<String, Object> metaData = Utils.recursivelyDeconstructReadableMap(parameters);

      DynamicLink.Builder builder = getDynamicLinkBuilderFromMap(metaData);
      Uri link = builder.buildDynamicLink().getUri();

      Log.d(TAG, "created dynamic link: " + link.toString());
      promise.resolve(link.toString());
    } catch (Exception ex) {
      Log.e(TAG, "create dynamic link failure " + ex.getMessage());
      promise.reject("links/failure", ex.getMessage(), ex);
    }
  }

  @ReactMethod
  public void createShortDynamicLink(final ReadableMap parameters, final Promise promise) {
    try {
      Map<String, Object> metaData = Utils.recursivelyDeconstructReadableMap(parameters);

      DynamicLink.Builder builder = getDynamicLinkBuilderFromMap(metaData);

      Task<ShortDynamicLink> shortLinkTask = getShortDynamicLinkTask(builder, metaData)
        .addOnCompleteListener(new OnCompleteListener<ShortDynamicLink>() {
          @Override
          public void onComplete(@NonNull Task<ShortDynamicLink> task) {
            if (task.isSuccessful()) {
              Uri shortLink = task.getResult().getShortLink();
              Log.d(TAG, "created short dynamic link: " + shortLink.toString());
              promise.resolve(shortLink.toString());
            } else {
              Log.e(TAG, "create short dynamic link failure " + task.getException().getMessage());
              promise.reject("links/failure", task.getException().getMessage(), task.getException());
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
        FirebaseDynamicLinks.getInstance()
          .getDynamicLink(getCurrentActivity().getIntent())
          .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
            @Override
            public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
              if (pendingDynamicLinkData != null
                && !isInvitation(pendingDynamicLinkData)) {

                mInitialLink = pendingDynamicLinkData.getLink().toString();
              }
              Log.d(TAG, "getInitialLink: link is: " + mInitialLink);
              mInitialLinkInitialized = true;
              promise.resolve(mInitialLink);
            }
          })
          .addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
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
    FirebaseDynamicLinks.getInstance()
      .getDynamicLink(intent)
      .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
        @Override
        public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
          if (pendingDynamicLinkData != null
            && !isInvitation(pendingDynamicLinkData)) {
            String link = pendingDynamicLinkData.getLink().toString();
            Utils.sendEvent(getReactApplicationContext(), "links_link_received", link);
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
    return pendingDynamicLinkData.zzcbj().getString("com.google.firebase.appinvite.fdl.extension.InvitationId") != null;
  }

  private DynamicLink.Builder getDynamicLinkBuilderFromMap(final Map<String, Object> metaData) {
    DynamicLink.Builder parametersBuilder = FirebaseDynamicLinks.getInstance().createDynamicLink();
    try {
      parametersBuilder.setLink(Uri.parse((String) metaData.get("link")));
      parametersBuilder.setDynamicLinkDomain((String) metaData.get("dynamicLinkDomain"));
      setAndroidParameters(metaData, parametersBuilder);
      setIosParameters(metaData, parametersBuilder);
      setSocialMetaTagParameters(metaData, parametersBuilder);
    } catch (Exception e) {
      Log.e(TAG, "error while building parameters " + e.getMessage());
      throw e;
    }
    return parametersBuilder;
  }

  private Task<ShortDynamicLink> getShortDynamicLinkTask(final DynamicLink.Builder builder, final Map<String, Object> metaData) {
    Map<String, Object> suffix = (Map<String, Object>) metaData.get("suffix");
    if (suffix != null) {
      String option = (String) suffix.get("option");
      if ("SHORT".equals(option)) {
        return builder.buildShortDynamicLink(ShortDynamicLink.Suffix.SHORT);
      } else if ("UNGUESSABLE".equals(option)) {
        return builder.buildShortDynamicLink(ShortDynamicLink.Suffix.UNGUESSABLE);
      }
    }
    return builder.buildShortDynamicLink();
  }


  private void setAndroidParameters(final Map<String, Object> metaData, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> androidParameters = (Map<String, Object>) metaData.get("androidInfo");
    if (androidParameters != null) {
      DynamicLink.AndroidParameters.Builder androidParametersBuilder =
        new DynamicLink.AndroidParameters.Builder((String) androidParameters.get("androidPackageName"));

      if (androidParameters.containsKey("androidFallbackLink")) {
        androidParametersBuilder.setFallbackUrl(Uri.parse((String) androidParameters.get("androidFallbackLink")));
      }
      if (androidParameters.containsKey("androidMinPackageVersionCode")) {
        androidParametersBuilder.setMinimumVersion(Integer.parseInt((String) androidParameters.get("androidMinPackageVersionCode")));
      }
      parametersBuilder.setAndroidParameters(androidParametersBuilder.build());
    }
  }

  private void setIosParameters(final Map<String, Object> metaData, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> iosParameters = (Map<String, Object>) metaData.get("iosInfo");
    if (iosParameters != null) {
      DynamicLink.IosParameters.Builder iosParametersBuilder =
        new DynamicLink.IosParameters.Builder((String) iosParameters.get("iosBundleId"));

      if (iosParameters.containsKey("iosAppStoreId")) {
        iosParametersBuilder.setAppStoreId((String) iosParameters.get("iosAppStoreId"));
      }
      if (iosParameters.containsKey("iosCustomScheme")) {
        iosParametersBuilder.setCustomScheme((String) iosParameters.get("iosCustomScheme"));
      }
      if (iosParameters.containsKey("iosFallbackLink")) {
        iosParametersBuilder.setFallbackUrl(Uri.parse((String) iosParameters.get("iosFallbackLink")));
      }
      if (iosParameters.containsKey("iosIpadBundleId")) {
        iosParametersBuilder.setIpadBundleId((String) iosParameters.get("iosIpadBundleId"));
      }
      if (iosParameters.containsKey("iosIpadFallbackLink")) {
        iosParametersBuilder.setIpadFallbackUrl(Uri.parse((String) iosParameters.get("iosIpadFallbackLink")));
      }
      if (iosParameters.containsKey("iosMinPackageVersionCode")) {
        iosParametersBuilder.setMinimumVersion((String) iosParameters.get("iosMinPackageVersionCode"));
      }
      parametersBuilder.setIosParameters(iosParametersBuilder.build());
    }
  }

  private void setSocialMetaTagParameters(final Map<String, Object> metaData, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> socialMetaTagParameters = (Map<String, Object>) metaData.get("socialMetaTagInfo");
    if (socialMetaTagParameters != null) {
      DynamicLink.SocialMetaTagParameters.Builder socialMetaTagParametersBuilder =
        new DynamicLink.SocialMetaTagParameters.Builder();

      if (socialMetaTagParameters.containsKey("socialDescription")) {
        socialMetaTagParametersBuilder.setDescription((String) socialMetaTagParameters.get("socialDescription"));
      }
      if (socialMetaTagParameters.containsKey("socialImageLink")) {
        socialMetaTagParametersBuilder.setImageUrl(Uri.parse((String) socialMetaTagParameters.get("socialImageLink")));
      }
      if (socialMetaTagParameters.containsKey("socialTitle")) {
        socialMetaTagParametersBuilder.setTitle((String) socialMetaTagParameters.get("socialTitle"));
      }
      parametersBuilder.setSocialMetaTagParameters(socialMetaTagParametersBuilder.build());
    }
  }
}
