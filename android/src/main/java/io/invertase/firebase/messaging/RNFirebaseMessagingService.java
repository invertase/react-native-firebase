package io.invertase.firebase.messaging;

import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class RNFirebaseMessagingService extends FirebaseMessagingService {
  private static final String TAG = "RNFMessagingService";
  public static final String MESSAGE_EVENT = "messaging-message";
  public static final String REMOTE_NOTIFICATION_EVENT = "notifications-remote-notification";

  @Override
  public void onMessageReceived(RemoteMessage message) {
    Log.d(TAG, "onMessageReceived event received");

    Intent event;

    if (message.getNotification() != null) {
      // It's a notification, pass to the notification module
      event = new Intent(REMOTE_NOTIFICATION_EVENT);
      event.putExtra("notification", message);
    } else {
      // It's a data message, pass to the messaging module
      event = new Intent(MESSAGE_EVENT);
      event.putExtra("message", message);
    }

    // Broadcast it so it is only available to the RN Application
    LocalBroadcastManager.getInstance(this).sendBroadcast(event);
  }
}
