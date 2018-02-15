package io.invertase.firebase.messaging;

import android.app.AlarmManager;
import android.app.Application;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.HttpURLConnection;

public class RNFirebaseLocalMessagingHelper {
  private static final long DEFAULT_VIBRATION = 300L;
  private static final String TAG = RNFirebaseLocalMessagingHelper.class.getSimpleName();
  private final static String PREFERENCES_KEY = "ReactNativeSystemNotification";
  private static boolean mIsForeground = false; //this is a hack

  private Context mContext;
  private SharedPreferences sharedPreferences = null;

  public RNFirebaseLocalMessagingHelper(Application context) {
    mContext = context;
    sharedPreferences = mContext.getSharedPreferences(PREFERENCES_KEY, Context.MODE_PRIVATE);
  }

  public void setApplicationForeground(boolean foreground){
    mIsForeground = foreground;
  }

}
