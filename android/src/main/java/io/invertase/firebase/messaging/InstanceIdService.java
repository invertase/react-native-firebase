package io.invertase.firebase.messaging;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

public class InstanceIdService extends FirebaseInstanceIdService {

  private static final String TAG = "InstanceIdService";

  /**
   * Called if InstanceID token is updated. This may occur if the security of
   * the previous token had been compromised. This call is initiated by the
   * InstanceID provider.
   */
  @Override
  public void onTokenRefresh() {
    // Get updated InstanceID token.
    String refreshedToken = FirebaseInstanceId.getInstance().getToken();
    Log.d(TAG, "Refreshed token: " + refreshedToken);

    // Broadcast refreshed token
    Intent i = new Intent("io.invertase.firebase.messaging.FCMRefreshToken");
    Bundle bundle = new Bundle();
    bundle.putString("token", refreshedToken);
    i.putExtras(bundle);
    sendBroadcast(i);
  }
}
