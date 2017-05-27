package io.invertase.firebase.admob;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.ads.AdRequest;

class RNFirebaseAdMobUtils {

  /**
   * Convert common AdMob errors into a standard format
   * @param errorCode
   * @return
   */
  static WritableMap errorCodeToMap(int errorCode) {
    WritableMap map = Arguments.createMap();

    switch (errorCode) {
      case AdRequest.ERROR_CODE_INTERNAL_ERROR:
        map.putString("code", "admob/error-code-internal-error");
        map.putString("message", "Something happened internally; for instance, an invalid response was received from the ad server.");
        break;
      case AdRequest.ERROR_CODE_INVALID_REQUEST:
        map.putString("code", "admob/error-code-invalid-request");
        map.putString("message", "The ad request was invalid; for instance, the ad unit ID was incorrect.");
        break;
      case AdRequest.ERROR_CODE_NETWORK_ERROR:
        map.putString("code", "admob/error-code-network-error");
        map.putString("message", "The ad request was unsuccessful due to network connectivity.");
        break;
      case AdRequest.ERROR_CODE_NO_FILL:
        map.putString("code", "admob/error-code-no-fill");
        map.putString("message", "The ad request was successful, but no ad was returned due to lack of ad inventory.");
        break;
    }

    return map;
  }

}
