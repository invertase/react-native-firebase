package io.invertase.firebase.messaging;

import java.util.Map;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

public class MessagingService extends FirebaseMessagingService {

  private static final String TAG = "MessagingService";

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    Log.d(TAG, "Remote message received");
    Intent i = new Intent("io.invertase.firebase.messaging.ReceiveNotification");
    i.putExtra("data", remoteMessage);
    handleBadge(remoteMessage);
    buildLocalNotification(remoteMessage);
    sendOrderedBroadcast(i, null);
  }

  private void handleBadge(RemoteMessage remoteMessage) {
    BadgeHelper badgeHelper = new BadgeHelper(this);
    if (remoteMessage.getData() == null) {
      return;
    }

    Map data = remoteMessage.getData();
    if (data.get("badge") == null) {
      return;
    }

    try {
      int badgeCount = Integer.parseInt((String)data.get("badge"));
      badgeHelper.setBadgeCount(badgeCount);
    } catch (Exception e) {
      Log.e(TAG, "Badge count needs to be an integer", e);
    }
  }

  private void buildLocalNotification(RemoteMessage remoteMessage) {
    if(remoteMessage.getData() == null){
      return;
    }
    Map<String, String> data = remoteMessage.getData();
    String customNotification = data.get("custom_notification");
    if(customNotification != null){
      try {
        Bundle bundle = BundleJSONConverter.convertToBundle(new JSONObject(customNotification));
        RNFirebaseLocalMessagingHelper helper = new RNFirebaseLocalMessagingHelper(this.getApplication());
        helper.sendNotification(bundle);
      } catch (JSONException e) {
        e.printStackTrace();
      }

    }
  }
}
