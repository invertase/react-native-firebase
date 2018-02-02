package io.invertase.firebase.messaging;

import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class RNFirebaseMessagingService extends FirebaseMessagingService {
  private static final String TAG = "RNFMessagingService";
  public static final String MESSAGE_EVENT = "messaging-message";

  @Override
  public void onMessageReceived(RemoteMessage message) {
    Log.d(TAG, "onMessageReceived event received");

    // Build an Intent to pass the token to the RN Application
    Intent messageEvent = new Intent(MESSAGE_EVENT);
    messageEvent.putExtra("message", message);

    // Broadcast it so it is only available to the RN Application
    LocalBroadcastManager.getInstance(this).sendBroadcast(messageEvent);
  }
}
