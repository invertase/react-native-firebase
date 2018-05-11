package io.invertase.firebase.notifications;

import android.content.Intent;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

import static io.invertase.firebase.notifications.RNFirebaseBackgroundNotificationActionReceiver.isBackgroundNotficationIntent;
import static io.invertase.firebase.notifications.RNFirebaseBackgroundNotificationActionReceiver.toNotificationOpenMap;

public class RNFirebaseBackgroundNotificationActionsService extends HeadlessJsTaskService {
  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    if (isBackgroundNotficationIntent(intent)) {
      WritableMap notificationOpenMap = toNotificationOpenMap(intent);

      return new HeadlessJsTaskConfig(
        "RNFirebaseBackgroundNotificationAction",
        notificationOpenMap,
        60000,
        true
      );
    }
    return null;
  }
}
