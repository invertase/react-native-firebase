package io.invertase.firebase.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;

import io.invertase.firebase.Utils;

public class RNFirebaseBackgroundNotificationActionReceiver extends BroadcastReceiver {
  static boolean isBackgroundNotficationIntent(Intent intent) {
    return intent.getExtras() != null && intent.hasExtra("action") && intent.hasExtra("notification");
  }

  static WritableMap toNotificationOpenMap(Intent intent) {
    Bundle extras = intent.getExtras();
    WritableMap notificationMap = Arguments.makeNativeMap(extras.getBundle("notification"));
    WritableMap notificationOpenMap = Arguments.createMap();
    notificationOpenMap.putString("action", extras.getString("action"));
    notificationOpenMap.putMap("notification", notificationMap);
    return notificationOpenMap;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    if (!isBackgroundNotficationIntent(intent)) {
      return;
    }

    if (Utils.isAppInForeground(context)) {
      WritableMap notificationOpenMap = toNotificationOpenMap(intent);

      ReactApplication reactApplication =  (ReactApplication)context.getApplicationContext();
      ReactContext reactContext = reactApplication.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();

      Utils.sendEvent(reactContext, "notifications_notification_opened", notificationOpenMap);
    } else {
      Intent serviceIntent = new Intent(context, RNFirebaseBackgroundNotificationActionsService.class);
      serviceIntent.putExtras(intent.getExtras());
      context.startService(serviceIntent);
      HeadlessJsTaskService.acquireWakeLockNow(context);
    }
  }
}
