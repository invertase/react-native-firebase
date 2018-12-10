package io.invertase.firebase.modules.utils;

import android.app.Activity;
import android.content.IntentSender;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.common.ContextProvider;
import io.invertase.firebase.common.FirebaseModule;

public class FirebaseUtilsModule extends FirebaseModule {
  private static final String TAG = "FirebaseUtilsModule";
  FirebaseUtilsModule(ContextProvider contextProvider) {
    super(contextProvider);
  }

  public String getName() {
    return TAG;
  }

  Bundle getPlayServicesStatus() {
    Bundle result = new Bundle();
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    final int status = gapi.isGooglePlayServicesAvailable(getApplicationContext());

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
  void promptForPlayServices() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    int status = gapi.isGooglePlayServicesAvailable(getApplicationContext());

    if (status != ConnectionResult.SUCCESS && gapi.isUserResolvableError(status)) {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        gapi
          .getErrorDialog(activity, status, status)
          .show();
      }
    }
  }

  /**
   * Prompt the device user to update play services
   */
  void resolutionForPlayServices() {
    int status = GoogleApiAvailability
      .getInstance()
      .isGooglePlayServicesAvailable(getApplicationContext());

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
  void makePlayServicesAvailable() {
    GoogleApiAvailability gapi = GoogleApiAvailability.getInstance();
    int status = gapi.isGooglePlayServicesAvailable(getApplicationContext());

    if (status != ConnectionResult.SUCCESS) {
      Activity activity = getCurrentActivity();
      if (activity != null) {
        gapi.makeGooglePlayServicesAvailable(activity);
      }
    }
  }


  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    constants.put("playServicesAvailability", getPlayServicesStatus());
    return constants;
  }
}
