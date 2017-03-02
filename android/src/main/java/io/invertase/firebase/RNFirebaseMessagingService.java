package io.invertase.firebase;

import android.content.Intent;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.SendException;

import io.invertase.firebase.messaging.RNFirebaseMessaging;

public class RNFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "FSMessagingService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "Remote message received");
        // debug
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
        }

        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }

        Intent i = new Intent(RNFirebaseMessaging.INTENT_NAME_NOTIFICATION);
        i.putExtra("data", remoteMessage);
        sendOrderedBroadcast(i, null);

    }

    @Override
    public void onMessageSent(String msgId) {
        // Called when an upstream message has been successfully sent to the GCM connection server.
        Log.d(TAG, "upstream message has been successfully sent");
        Intent i = new Intent(RNFirebaseMessaging.INTENT_NAME_SEND);
        i.putExtra("msgId", msgId);
        sendOrderedBroadcast(i, null);
    }

    @Override
    public void onSendError(String msgId, Exception exception) {
        // Called when there was an error sending an upstream message.
        Log.d(TAG, "error sending an upstream message");
        Intent i = new Intent(RNFirebaseMessaging.INTENT_NAME_SEND);
        i.putExtra("msgId", msgId);
        i.putExtra("hasError", true);
        SendException sendException = (SendException) exception;
        i.putExtra("errorCode", sendException.getErrorCode());
        switch(sendException.getErrorCode()){
            case SendException.ERROR_INVALID_PARAMETERS:
                i.putExtra("errorMessage", "Message was sent with invalid parameters.");
                break;
            case SendException.ERROR_SIZE:
                i.putExtra("errorMessage", "Message exceeded the maximum payload size.");
                break;
            case SendException.ERROR_TOO_MANY_MESSAGES:
                i.putExtra("errorMessage", "App has too many pending messages so this one was dropped.");
                break;
            case SendException.ERROR_TTL_EXCEEDED:
                i.putExtra("errorMessage", "Message time to live (TTL) was exceeded before the message could be sent.");
                break;
            case SendException.ERROR_UNKNOWN:
            default:
                i.putExtra("errorMessage", "Unknown error.");
                break;
        }
        sendOrderedBroadcast(i, null);
    }
}
