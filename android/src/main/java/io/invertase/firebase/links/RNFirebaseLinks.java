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

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.OnFailureListener;

import io.invertase.firebase.Utils;

public class RNFirebaseLinks extends ReactContextBaseJavaModule implements ActivityEventListener {
  private final static String TAG = RNFirebaseLinks.class.getCanonicalName();
  private String initialLink = null;

  public RNFirebaseLinks(ReactApplicationContext reactContext) {
    super(reactContext);
    //getReactApplicationContext().addActivityEventListener(this);
    //registerLinksHandler();
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
  public void createDynamicLink(final ReadableMap parameters, final Promise promise) {
    try {
      Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(parameters);

      DynamicLink.Builder builder = getDynamicLinkBuilderFromMap(m);
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
      Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(parameters);

      DynamicLink.Builder builder = getDynamicLinkBuilderFromMap(m);

      Task<ShortDynamicLink> shortLinkTask = getShortDynamicLinkTask(builder, m)
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

  private Task<ShortDynamicLink> getShortDynamicLinkTask(final DynamicLink.Builder builder, final Map<String, Object> m) {
    Map<String, Object> suffixParameters = (Map<String, Object>) m.get("suffix");
    if (suffixParameters != null) {
      String option = (String) suffixParameters.get("option");
      if ("SHORT".equals(option)) {
        return builder.buildShortDynamicLink(ShortDynamicLink.Suffix.SHORT);
      } else if ("UNGUESSABLE".equals(option)) {
        return builder.buildShortDynamicLink(ShortDynamicLink.Suffix.UNGUESSABLE);
      }
    }
    return builder.buildShortDynamicLink();
  }

  private DynamicLink.Builder getDynamicLinkBuilderFromMap(final Map<String, Object> m) {
    DynamicLink.Builder parametersBuilder = FirebaseDynamicLinks.getInstance().createDynamicLink();

    try {
      parametersBuilder.setLink(Uri.parse((String) m.get("link")));
      parametersBuilder.setDynamicLinkDomain((String) m.get("dynamicLinkDomain"));

      setAndroidParameters(m, parametersBuilder);
      setIosParameters(m, parametersBuilder);
      setSocialMetaTagParameters(m, parametersBuilder);

    } catch (Exception e) {
      Log.e(TAG, "error while building parameters " + e.getMessage());
    }

    return parametersBuilder;
  }

  private void setAndroidParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> androidParameters = (Map<String, Object>) m.get("androidInfo");
    if (androidParameters != null) {
      DynamicLink.AndroidParameters.Builder androidParametersBuilder =
        androidParameters.containsKey("androidPackageName") ?
          new DynamicLink.AndroidParameters.Builder((String) androidParameters.get("androidPackageName")) :
          new DynamicLink.AndroidParameters.Builder();

      if (androidParameters.containsKey("androidFallbackLink")) {
        androidParametersBuilder.setFallbackUrl(Uri.parse((String) androidParameters.get("androidFallbackLink")));
      }
      if (androidParameters.containsKey("androidMinPackageVersionCode")) {
        androidParametersBuilder.setMinimumVersion(((Double) androidParameters.get("androidMinPackageVersionCode")).intValue());
      }
      parametersBuilder.setAndroidParameters(androidParametersBuilder.build());
    }
  }

  private void setIosParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> iosParameters = (Map<String, Object>) m.get("iosInfo");
    //TODO: see what happens if bundleId is missing
    if (iosParameters != null && iosParameters.containsKey("iosBundleId")) {
      DynamicLink.IosParameters.Builder iosParametersBuilder = new DynamicLink.IosParameters.Builder((String) iosParameters.get("iosBundleId"));
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

  private void setSocialMetaTagParameters(final Map<String, Object> m, final DynamicLink.Builder parametersBuilder) {
    Map<String, Object> socialMetaTagParameters = (Map<String, Object>) m.get("socialMetaTagInfo");
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
