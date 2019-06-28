package io.invertase.firebase.messaging;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.google.firebase.messaging.RemoteMessage;

import javax.annotation.Nullable;

public class ReactNativeFirebaseMessagingHeadlessService extends HeadlessJsTaskService {

  @Override
  protected @Nullable
  HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) return null;
    RemoteMessage remoteMessage = intent.getParcelableExtra("message");
    WritableMap writableMap = ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(remoteMessage);
    return new HeadlessJsTaskConfig(
      "ReactNativeFirebaseMessagingHeadlessTask",
      writableMap,
      60000, // TODO allow configuration via firebase.json
      false
    );
  }
}
