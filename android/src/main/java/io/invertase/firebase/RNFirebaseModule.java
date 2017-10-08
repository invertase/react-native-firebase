package io.invertase.firebase;

import android.util.Log;
import android.app.Activity;
import android.content.IntentSender;

import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;

// react
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

// play services
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@SuppressWarnings("WeakerAccess")
public class RNFirebaseModule extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebase";

  public RNFirebaseModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return TAG;
  }


  @ReactMethod
  public void initializeApp(String appName, ReadableMap options, Callback callback) {
    FirebaseOptions.Builder builder = new FirebaseOptions.Builder();

    builder.setApiKey(options.getString("apiKey"));
    builder.setApplicationId(options.getString("appId"));
    builder.setProjectId(options.getString("projectId"));
    builder.setDatabaseUrl(options.getString("databaseURL"));
    builder.setStorageBucket(options.getString("storageBucket"));
    builder.setGcmSenderId(options.getString("messagingSenderId"));
    // todo firebase sdk has no client id setter

    FirebaseApp.initializeApp(getReactApplicationContext(), builder.build(), appName);

    WritableMap response = Arguments.createMap();
    response.putString("result", "success");
    callback.invoke(null, response);
  }

  @ReactMethod
  public void deleteApp(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);

    if (firebaseApp == null) {
      promise.resolve(null);
    } else {
      // todo ? not implemented on firebase sdk
      promise.reject(
        "app/delete-app-failed",
        "Failed to delete app. The android Firebase SDK currently does not support this functionality"
      );
    }
  }

  /**
   * @return
   */
  private WritableMap getPlayServicesStatus() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    final int status = gapi.isGooglePlayServicesAvailable(getReactApplicationContext());
    WritableMap result = Arguments.createMap();
    result.putInt("status", status);
    if (status == ConnectionResult.SUCCESS) {
      result.putBoolean("isAvailable", true);
    } else {
      result.putBoolean("isAvailable", false);
      result.putString("error", gapi.getErrorString(status));
      result.putBoolean("isUserResolvableError", gapi.isUserResolvableError(status));
      result.putBoolean("hasResolution", new ConnectionResult(status).hasResolution());
    }
    return result;
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  public void promptForPlayServices() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    int status = gapi.isGooglePlayServicesAvailable(getReactApplicationContext());

    if (status != ConnectionResult.SUCCESS && gapi.isUserResolvableError(status)) {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        gapi.getErrorDialog(activity, status, status).show();
      }
    }
  }

  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  public void resolutionForPlayServices() {
    int status = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(getReactApplicationContext());
    ConnectionResult connectionResult = new ConnectionResult(status);

    if (!connectionResult.isSuccess() && connectionResult.hasResolution()) {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        try {
          connectionResult.startResolutionForResult(activity, status);
        } catch (IntentSender.SendIntentException error) {
          Log.d(TAG, "resolutionForPlayServices", error);
        }
      }
    }
  }


  /**
   * Prompt the device user to update play services
   */
  @ReactMethod
  public void makePlayServicesAvailable() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    int status = gapi.isGooglePlayServicesAvailable(getReactApplicationContext());

    if (status != ConnectionResult.SUCCESS) {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        gapi.makeGooglePlayServicesAvailable(activity);
      }
    }
  }


  @Override
  public Map<String, Object> getConstants() {
    FirebaseApp firebaseApp;

    Map<String, Object> constants = new HashMap<>();
    List<Map<String, Object>> appMapsList = new ArrayList<>();
    List<FirebaseApp> firebaseAppList = FirebaseApp.getApps(getReactApplicationContext());

    // TODO no way to get client id currently from app options - firebase sdk issue
    for (FirebaseApp app : firebaseAppList) {
      String appName = app.getName();
      FirebaseOptions appOptions = app.getOptions();
      Map<String, Object> appProps = new HashMap<>();

      appProps.put("name", appName);
      appProps.put("apiKey", appOptions.getApiKey());
      appProps.put("appId", appOptions.getApplicationId());
      appProps.put("projectId", appOptions.getProjectId());
      appProps.put("databaseURL", appOptions.getDatabaseUrl());
      appProps.put("messagingSenderId", appOptions.getGcmSenderId());
      appProps.put("storageBucket", appOptions.getStorageBucket());

      appMapsList.add(appProps);
    }

    constants.put("apps", appMapsList);
    constants.put("playServicesAvailability", getPlayServicesStatus());
    return constants;
  }
}
