package com.invertase.testing

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingStoreImpl

/** Test-app TurboModule: platform-specific probes no-op on unsupported platforms. */
class NativeRNFBTesting(reactContext: ReactApplicationContext) :
  NativeRNFBTestingSpec(reactContext) {

  override fun messagingPreservesExistingDelegate(promise: Promise) {
    promise.resolve(false)
  }

  override fun completesNonFCMRemoteNotification(promise: Promise) {
    promise.resolve(false)
  }

  override fun serializeMessagingUserInfo(userInfo: ReadableMap, promise: Promise) {
    // iOS-only serializer probe — Android messaging RemoteMessage path is covered elsewhere.
    promise.resolve(Arguments.createMap())
  }

  override fun messagingStoreSupportsDisabledStorage(promise: Promise) {
    val preferences =
      reactApplicationContext.getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE)
    val maxNotificationSize =
      ReactNativeFirebaseMessagingStoreImpl::class.java.getDeclaredField("maxNotificationSize")
    val retainedMessage =
      RemoteMessage.Builder("testing@fcm.googleapis.com")
        .setMessageId(RETAINED_MESSAGE_ID)
        .build()
    val discardedMessage =
      RemoteMessage.Builder("testing@fcm.googleapis.com")
        .setMessageId(DISCARDED_MESSAGE_ID)
        .build()

    try {
      preferences
        .edit()
        .remove(ALL_NOTIFICATION_IDS)
        .remove(RETAINED_MESSAGE_ID)
        .remove(DISCARDED_MESSAGE_ID)
        .putInt(MAX_STORED_NOTIFICATIONS, 1)
        .apply()
      maxNotificationSize.isAccessible = true
      maxNotificationSize.setInt(null, -1)

      val store = ReactNativeFirebaseMessagingStoreImpl()
      store.storeFirebaseMessage(retainedMessage)

      preferences.edit().putInt(MAX_STORED_NOTIFICATIONS, 0).apply()
      maxNotificationSize.setInt(null, -1)
      store.storeFirebaseMessage(discardedMessage)
      promise.resolve(
        store.getFirebaseMessageMap(RETAINED_MESSAGE_ID) == null &&
          store.getFirebaseMessageMap(DISCARDED_MESSAGE_ID) == null,
      )
    } catch (e: Exception) {
      promise.reject("messaging_store_failed", "Failed to disable notification storage", e)
    } finally {
      preferences
        .edit()
        .remove(MAX_STORED_NOTIFICATIONS)
        .remove(ALL_NOTIFICATION_IDS)
        .remove(RETAINED_MESSAGE_ID)
        .remove(DISCARDED_MESSAGE_ID)
        .apply()
      maxNotificationSize.setInt(null, -1)
    }
  }

  companion object {
    private const val PREFERENCES_FILE = "io.invertase.firebase"
    private const val MAX_STORED_NOTIFICATIONS = "messaging_max_stored_notifications"
    private const val ALL_NOTIFICATION_IDS = "all_notification_ids"
    private const val RETAINED_MESSAGE_ID = "rnfb-retained-storage-test"
    private const val DISCARDED_MESSAGE_ID = "rnfb-disabled-storage-test"
  }
}
