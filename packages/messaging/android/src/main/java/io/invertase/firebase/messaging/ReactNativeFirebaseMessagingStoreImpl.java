package io.invertase.firebase.messaging;

import android.util.Log;

import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.invertase.firebase.common.UniversalFirebasePreferences;

import static io.invertase.firebase.messaging.JsonConvert.jsonToReact;
import static io.invertase.firebase.messaging.JsonConvert.reactToJSON;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap;

public class ReactNativeFirebaseMessagingStoreImpl implements ReactNativeFirebaseMessagingStore {

  private static final String S_KEY_ALL_NOTIFICATION_IDS = "all_notification_ids";
  private static final int MAX_SIZE_NOTIFICATIONS = 100;

  @Override
  public void storeFirebaseMessage(RemoteMessage remoteMessage) {
    try {
      String remoteMessageString = reactToJSON(remoteMessageToWritableMap(remoteMessage)).toString();
      Log.d("storeFirebaseMessage", remoteMessageString);
      UniversalFirebasePreferences.getSharedInstance().setStringValue(remoteMessage.getMessageId(), remoteMessageString);
      String notifications = UniversalFirebasePreferences.getSharedInstance().getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
      notifications += remoteMessage.getMessageId() + ",";
      UniversalFirebasePreferences.getSharedInstance().setStringValue(S_KEY_ALL_NOTIFICATION_IDS, notifications);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  @Override
  public RemoteMessage getFirebaseMessage(String remoteMessageId) {
    String remoteMessageString = UniversalFirebasePreferences.getSharedInstance().getStringValue(remoteMessageId, null);
    if (remoteMessageString != null) {
      Log.d("getFirebaseMessage", remoteMessageString);
      try {
        WritableMap readableMap = jsonToReact(new JSONObject(remoteMessageString));
        readableMap.putString("to", remoteMessageId);//fake to
        return remoteMessageFromReadableMap(readableMap);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  @Override
  public void clearFirebaseMessage(String remoteMessageId) {
    UniversalFirebasePreferences preferences = UniversalFirebasePreferences.getSharedInstance();
    preferences.remove(remoteMessageId);
    // check and remove old notifications message
    String notifications = preferences.getStringValue(S_KEY_ALL_NOTIFICATION_IDS, "");
    if (!notifications.isEmpty()) {
      notifications = notifications.replace(remoteMessageId + ",", ""); // remove from list
    }
    List<String> allNotificationList = convertToArray(notifications);
    if (allNotificationList.size() > MAX_SIZE_NOTIFICATIONS) {
      List<String> newNotificationList = allNotificationList.subList(allNotificationList.size() - MAX_SIZE_NOTIFICATIONS, allNotificationList.size());
      List<String> oldNotificationList = allNotificationList.subList(0, allNotificationList.size() - MAX_SIZE_NOTIFICATIONS);
      for (String messageId : oldNotificationList) {
        preferences.remove(messageId);
      }
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, convertToString(newNotificationList));
    } else {
      preferences.setStringValue(S_KEY_ALL_NOTIFICATION_IDS, convertToString(allNotificationList));
    }
  }

  private String convertToString(List<String> list) {
    StringBuilder sb = new StringBuilder();
    String delim = "";
    for (String s : list) {
      sb.append(delim);
      sb.append(s);
      delim = ",";
    }
    return sb.toString();
  }

  private List<String> convertToArray(String string) {
    return new ArrayList<>(Arrays.asList(string.split(",")));
  }

}