package io.invertase.firebase.messaging;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import java.util.ArrayList;

import android.os.Bundle;
import android.util.Log;

/**
 * Set alarms for scheduled notification after system reboot.
 */
public class RNFirebaseSystemBootEventReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i("FCMSystemBootReceiver", "Received reboot event");
        RNFirebaseLocalMessagingHelper helper = new RNFirebaseLocalMessagingHelper((Application) context.getApplicationContext());
        ArrayList<Bundle> bundles = helper.getScheduledLocalNotifications();
        for(Bundle bundle: bundles){
            helper.sendNotificationScheduled(bundle);
        }
    }
}
