package io.invertase.firebase.messaging;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.facebook.react.HeadlessJsTaskService;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.SharedUtils;
import java.util.HashMap;

public class ReactNativeFirebaseMessagingReceiver extends BroadcastReceiver {
  private static final String TAG = "RNFirebaseMsgReceiver";
  static HashMap<String, RemoteMessage> notifications = new HashMap<>();

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(TAG, "broadcast received for message");
    if (ReactNativeFirebaseApp.getApplicationContext() == null) {
      ReactNativeFirebaseApp.setApplicationContext(context.getApplicationContext());
    }
    if (intent.getExtras() == null) {
      Log.e(TAG, "broadcast intent received with no extras");
      return;
    }
    RemoteMessage remoteMessage = new RemoteMessage(intent.getExtras());
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

    // Add a RemoteMessage if the message contains a notification payload
    if (remoteMessage.getNotification() != null) {
      notifications.put(remoteMessage.getMessageId(), remoteMessage);
      ReactNativeFirebaseMessagingStoreHelper.getInstance()
          .getMessagingStore()
          .storeFirebaseMessage(remoteMessage);
    }

    //  |-> ---------------------
    //      App in Foreground
    //   ------------------------
    if (SharedUtils.isAppInForeground(context)) {
      emitter.sendEvent(
          ReactNativeFirebaseMessagingSerializer.remoteMessageToEvent(remoteMessage, false));
      return;
    }

    //  |-> ---------------------
    //    App in Background/Quit
    //   ------------------------

    try {
      Intent backgroundIntent =
          new Intent(context, ReactNativeFirebaseMessagingHeadlessService.class);
      backgroundIntent.putExtra("message", remoteMessage);
      ComponentName name = context.startService(backgroundIntent);
      if (name != null) {
        HeadlessJsTaskService.acquireWakeLockNow(context);
      }
    } catch (IllegalStateException ex) {
      // By default, data only messages are "default" priority and cannot trigger Headless tasks
      Log.e(TAG, "Background messages only work if the message priority is set to 'high'", ex);
    }
  }
}
