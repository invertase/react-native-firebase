package io.invertase.firebase.messaging

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.common.ReactNativeFirebaseEvent
import io.invertase.firebase.common.SharedUtils

/**
 * Maps FCM [RemoteMessage] values / send lifecycle signals to React Native events and maps.
 *
 * Java callers keep the historical class name and static method shape (`@JvmStatic`). Helpers that
 * were package-private in Java are public `@JvmStatic` (Kotlin has no package-private) so
 * same-package Java static imports continue to compile unchanged.
 */
open class ReactNativeFirebaseMessagingSerializer {
  companion object {
    private const val KEY_TOKEN = "token"
    private const val KEY_COLLAPSE_KEY = "collapseKey"
    private const val KEY_DATA = "data"
    private const val KEY_FROM = "from"
    private const val KEY_MESSAGE_ID = "messageId"
    private const val KEY_MESSAGE_TYPE = "messageType"
    private const val KEY_SENT_TIME = "sentTime"
    private const val KEY_ERROR = "error"
    private const val KEY_TO = "to"
    private const val KEY_TTL = "ttl"
    private const val KEY_PRIORITY = "priority"
    private const val KEY_ORIGINAL_PRIORITY = "originalPriority"
    private const val EVENT_MESSAGE_SENT = "messaging_message_sent"
    private const val EVENT_MESSAGES_DELETED = "messaging_message_deleted"
    private const val EVENT_MESSAGE_RECEIVED = "messaging_message_received"
    private const val EVENT_NOTIFICATION_OPENED = "messaging_notification_opened"
    private const val EVENT_MESSAGE_SEND_ERROR = "messaging_message_send_error"
    private const val EVENT_NEW_TOKEN = "messaging_token_refresh"

    @JvmStatic
    fun messagesDeletedToEvent(): ReactNativeFirebaseEvent = ReactNativeFirebaseEvent(EVENT_MESSAGES_DELETED, Arguments.createMap())

    @JvmStatic
    fun messageSentToEvent(messageId: String?): ReactNativeFirebaseEvent {
      val eventBody = Arguments.createMap()
      eventBody.putString(KEY_MESSAGE_ID, messageId)
      return ReactNativeFirebaseEvent(EVENT_MESSAGE_SENT, eventBody)
    }

    @JvmStatic
    fun messageSendErrorToEvent(
      messageId: String?,
      sendError: Exception?,
    ): ReactNativeFirebaseEvent {
      val eventBody = Arguments.createMap()
      eventBody.putString(KEY_MESSAGE_ID, messageId)
      eventBody.putMap(KEY_ERROR, SharedUtils.getExceptionMap(sendError))
      return ReactNativeFirebaseEvent(EVENT_MESSAGE_SEND_ERROR, eventBody)
    }

    /** [openEvent] stays boxed `Boolean` for Java callers (`Boolean?` → JVM `Boolean`). */
    @JvmStatic
    fun remoteMessageToEvent(
      remoteMessage: RemoteMessage,
      openEvent: Boolean?,
    ): ReactNativeFirebaseEvent =
      ReactNativeFirebaseEvent(
        if (openEvent!!) EVENT_NOTIFICATION_OPENED else EVENT_MESSAGE_RECEIVED,
        remoteMessageToWritableMap(remoteMessage),
      )

    @JvmStatic
    fun remoteMessageMapToEvent(
      remoteMessageMap: WritableMap,
      openEvent: Boolean?,
    ): ReactNativeFirebaseEvent =
      ReactNativeFirebaseEvent(
        if (openEvent!!) EVENT_NOTIFICATION_OPENED else EVENT_MESSAGE_RECEIVED,
        remoteMessageMap,
      )

    @JvmStatic
    fun newTokenToTokenEvent(newToken: String?): ReactNativeFirebaseEvent {
      val eventBody = Arguments.createMap()
      eventBody.putString(KEY_TOKEN, newToken)
      return ReactNativeFirebaseEvent(EVENT_NEW_TOKEN, eventBody)
    }

    @JvmStatic
    fun remoteMessageToWritableMap(remoteMessage: RemoteMessage): WritableMap {
      val messageMap = Arguments.createMap()
      val dataMap = Arguments.createMap()

      if (remoteMessage.collapseKey != null) {
        messageMap.putString(KEY_COLLAPSE_KEY, remoteMessage.collapseKey)
      }

      if (remoteMessage.from != null) {
        messageMap.putString(KEY_FROM, remoteMessage.from)
      }

      if (remoteMessage.to != null) {
        messageMap.putString(KEY_TO, remoteMessage.to)
      }

      if (remoteMessage.messageId != null) {
        messageMap.putString(KEY_MESSAGE_ID, remoteMessage.messageId)
      }

      if (remoteMessage.messageType != null) {
        messageMap.putString(KEY_MESSAGE_TYPE, remoteMessage.messageType)
      }

      if (remoteMessage.data.size > 0) {
        for (entry in remoteMessage.data.entries) {
          dataMap.putString(entry.key, entry.value)
        }
      }

      messageMap.putMap(KEY_DATA, dataMap)
      messageMap.putDouble(KEY_TTL, remoteMessage.ttl.toDouble())
      messageMap.putDouble(KEY_SENT_TIME, remoteMessage.sentTime.toDouble())
      messageMap.putInt(KEY_PRIORITY, remoteMessage.priority)
      messageMap.putInt(KEY_ORIGINAL_PRIORITY, remoteMessage.originalPriority)

      if (remoteMessage.notification != null) {
        messageMap.putMap(
          "notification",
          remoteMessageNotificationToWritableMap(remoteMessage.notification!!),
        )
      }

      return messageMap
    }

    @JvmStatic
    fun remoteMessageNotificationToWritableMap(notification: RemoteMessage.Notification): WritableMap {
      val notificationMap = Arguments.createMap()
      val androidNotificationMap = Arguments.createMap()

      if (notification.title != null) {
        notificationMap.putString("title", notification.title)
      }

      if (notification.titleLocalizationKey != null) {
        notificationMap.putString("titleLocKey", notification.titleLocalizationKey)
      }

      if (notification.titleLocalizationArgs != null) {
        notificationMap.putArray(
          "titleLocArgs",
          Arguments.fromJavaArgs(notification.titleLocalizationArgs),
        )
      }

      if (notification.body != null) {
        notificationMap.putString("body", notification.body)
      }

      if (notification.bodyLocalizationKey != null) {
        notificationMap.putString("bodyLocKey", notification.bodyLocalizationKey)
      }

      if (notification.bodyLocalizationArgs != null) {
        notificationMap.putArray(
          "bodyLocArgs",
          Arguments.fromJavaArgs(notification.bodyLocalizationArgs),
        )
      }

      if (notification.channelId != null) {
        androidNotificationMap.putString("channelId", notification.channelId)
      }

      if (notification.clickAction != null) {
        androidNotificationMap.putString("clickAction", notification.clickAction)
      }

      if (notification.color != null) {
        androidNotificationMap.putString("color", notification.color)
      }

      if (notification.icon != null) {
        androidNotificationMap.putString("smallIcon", notification.icon)
      }

      if (notification.imageUrl != null) {
        androidNotificationMap.putString("imageUrl", notification.imageUrl!!.toString())
      }

      if (notification.link != null) {
        androidNotificationMap.putString("link", notification.link!!.toString())
      }

      if (notification.notificationCount != null) {
        androidNotificationMap.putInt("count", notification.notificationCount!!)
      }

      if (notification.notificationPriority != null) {
        androidNotificationMap.putInt("priority", notification.notificationPriority!!)
      }

      if (notification.sound != null) {
        androidNotificationMap.putString("sound", notification.sound)
      }

      if (notification.ticker != null) {
        androidNotificationMap.putString("ticker", notification.ticker)
      }

      if (notification.visibility != null) {
        androidNotificationMap.putInt("visibility", notification.visibility!!)
      }

      notificationMap.putMap("android", androidNotificationMap)
      return notificationMap
    }

    @JvmStatic
    fun remoteMessageFromReadableMap(readableMap: ReadableMap): RemoteMessage {
      // Match Java: pass ReadableMap.getString results through even when null/absent.
      val builder = RemoteMessage.Builder(nullableAsPlatformType(readableMap.getString(KEY_TO)))

      if (readableMap.hasKey(KEY_TTL)) {
        builder.setTtl(readableMap.getInt(KEY_TTL))
      }

      if (readableMap.hasKey(KEY_MESSAGE_ID)) {
        builder.setMessageId(nullableAsPlatformType(readableMap.getString(KEY_MESSAGE_ID)))
      }

      if (readableMap.hasKey(KEY_MESSAGE_TYPE)) {
        builder.setMessageType(nullableAsPlatformType(readableMap.getString(KEY_MESSAGE_TYPE)))
      }

      if (readableMap.hasKey(KEY_COLLAPSE_KEY)) {
        builder.setCollapseKey(nullableAsPlatformType(readableMap.getString(KEY_COLLAPSE_KEY)))
      }

      if (readableMap.hasKey(KEY_DATA)) {
        val messageData = readableMap.getMap(KEY_DATA)
        val iterator = messageData!!.keySetIterator()

        while (iterator.hasNextKey()) {
          val key = iterator.nextKey()
          builder.addData(
            nullableAsPlatformType(key),
            nullableAsPlatformType(messageData.getString(key)),
          )
        }
      }

      return builder.build()
    }

    /** Preserve Java null-pass-through into Firebase APIs that declare non-null Kotlin types. */
    private fun <T> nullableAsPlatformType(value: T?): T = value as T
  }
}
