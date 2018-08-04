package io.invertase.firebase.messaging;

import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceIdService;

public class RNFirebaseInstanceIdService extends FirebaseInstanceIdService {
  public static final String TOKEN_REFRESH_EVENT = "messaging-token-refresh";
  private static final String TAG = "RNFInstanceIdService";

  @Override
  public void onTokenRefresh() {
    Log.d(TAG, "onTokenRefresh event received");

    // Build an Intent to pass the token to the RN Application
    Intent tokenRefreshEvent = new Intent(TOKEN_REFRESH_EVENT);

    // Broadcast it so it is only available to the RN Application
    LocalBroadcastManager
      .getInstance(this)
      .sendBroadcast(tokenRefreshEvent);
  }
}
