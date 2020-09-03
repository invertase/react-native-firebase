package io.invertase.firebase.messaging;

import android.util.Log;

import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import io.invertase.firebase.common.UniversalFirebasePreferences;

import static io.invertase.firebase.messaging.JsonConvert.jsonToReact;
import static io.invertase.firebase.messaging.JsonConvert.reactToJSON;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap;
import static io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap;

public class ReactNativeFirebaseMessagingStoreImpl implements ReactNativeFirebaseMessagingStore {

  @Override
  public void storeFirebaseMessage(RemoteMessage remoteMessage) {
    try {
      String remoteMessageString = reactToJSON(remoteMessageToWritableMap(remoteMessage)).toString();
      Log.d("storeFirebaseMessage", remoteMessageString);
      UniversalFirebasePreferences.getSharedInstance().setStringValue(remoteMessage.getMessageId(), remoteMessageString);
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
    UniversalFirebasePreferences.getSharedInstance().remove(remoteMessageId);
  }

}
