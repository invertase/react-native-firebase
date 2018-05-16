package io.invertase.firebase.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class RNFirebaseNotificationTimeoutReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    String notificationId = intent.getStringExtra("notificationId");
    new RNFirebaseNotificationManager(context).removeDeliveredNotification(notificationId);
  }
}
