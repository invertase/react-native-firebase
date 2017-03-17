package io.invertase.firebase.messaging;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class RNFirebaseLocalMessagingPublisher extends BroadcastReceiver {

  @Override
  public void onReceive(Context context, Intent intent) {
    new RNFirebaseLocalMessagingHelper((Application) context.getApplicationContext()).sendNotification(intent.getExtras());
  }
}
