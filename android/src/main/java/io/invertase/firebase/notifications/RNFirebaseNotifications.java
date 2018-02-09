package io.invertase.firebase.notifications;

import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RNFirebaseNotifications extends ReactContextBaseJavaModule {
  public RNFirebaseNotifications(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "RNFirebaseNotifications";
  }

  @ReactMethod
  public void sendNotification(Promise promise) {
    //
    NotificationCompat.Builder builder = new NotificationCompat.Builder()
  }
}
