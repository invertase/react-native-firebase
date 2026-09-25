package io.invertase.firebase.messaging;

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.net.Uri;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import java.util.Collections;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link ReactNativeFirebaseMessagingSerializer}. Does not instantiate Receiver /
 * Service / TurboModule / real React Native bridge — AndroidTest-AD-1 / D12. {@link
 * Arguments#createMap()} is stubbed via mockito-mockstatic (SoLoader). Robolectric is required for
 * {@link RemoteMessage.Builder} ({@code TextUtils}) on the JVM.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseMessagingSerializerTest {

  @Test
  public void messagesDeletedToEvent_usesDeletedEventName() {
    WritableMap empty = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(empty);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.messagesDeletedToEvent();

      assertEquals("messaging_message_deleted", event.getEventName());
      assertSame(empty, event.getEventBody());
    }
  }

  @Test
  public void messageSentToEvent_putsMessageIdOnBody() {
    WritableMap body = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(body);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.messageSentToEvent("mid-1");

      assertEquals("messaging_message_sent", event.getEventName());
      verify(body).putString("messageId", "mid-1");
      assertSame(body, event.getEventBody());
    }
  }

  @Test
  public void messageSendErrorToEvent_usesSharedUtilsExceptionMap() {
    WritableMap body = mock(WritableMap.class);
    WritableMap errorMap = mock(WritableMap.class);
    Exception sendError = new Exception("send failed");
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      // SharedUtils.getExceptionMap also calls Arguments.createMap() — second stub is the error map.
      when(Arguments.createMap()).thenReturn(body, errorMap);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.messageSendErrorToEvent("mid-err", sendError);

      assertEquals("messaging_message_send_error", event.getEventName());
      verify(body).putString("messageId", "mid-err");
      verify(errorMap).putString("code", "unknown");
      verify(errorMap).putString("message", "send failed");
      verify(body).putMap("error", errorMap);
    }
  }

  @Test
  public void remoteMessageMapToEvent_openVsNotOpenEventNames() {
    WritableMap map = mock(WritableMap.class);

    ReactNativeFirebaseEvent opened =
        ReactNativeFirebaseMessagingSerializer.remoteMessageMapToEvent(map, Boolean.TRUE);
    assertEquals("messaging_notification_opened", opened.getEventName());
    assertSame(map, opened.getEventBody());

    ReactNativeFirebaseEvent received =
        ReactNativeFirebaseMessagingSerializer.remoteMessageMapToEvent(map, Boolean.FALSE);
    assertEquals("messaging_message_received", received.getEventName());
    assertSame(map, received.getEventBody());
  }

  @Test
  public void newTokenToTokenEvent_putsToken() {
    WritableMap body = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(body);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.newTokenToTokenEvent("tok-abc");

      assertEquals("messaging_token_refresh", event.getEventName());
      verify(body).putString("token", "tok-abc");
    }
  }

  @Test
  public void remoteMessageFromReadableMap_roundTripsBuilderFields() {
    ReadableMap readable = mock(ReadableMap.class);
    ReadableMap data = mock(ReadableMap.class);
    ReadableMapKeySetIterator iterator = mock(ReadableMapKeySetIterator.class);

    when(readable.getString("to")).thenReturn("topic-dest");
    when(readable.hasKey("ttl")).thenReturn(true);
    when(readable.getInt("ttl")).thenReturn(42);
    when(readable.hasKey("messageId")).thenReturn(true);
    when(readable.getString("messageId")).thenReturn("mid-rt");
    when(readable.hasKey("messageType")).thenReturn(true);
    when(readable.getString("messageType")).thenReturn("type-a");
    when(readable.hasKey("collapseKey")).thenReturn(true);
    when(readable.getString("collapseKey")).thenReturn("ck");
    when(readable.hasKey("data")).thenReturn(true);
    when(readable.getMap("data")).thenReturn(data);
    when(data.keySetIterator()).thenReturn(iterator);
    when(iterator.hasNextKey()).thenReturn(true, false);
    when(iterator.nextKey()).thenReturn("k1");
    when(data.getString("k1")).thenReturn("v1");

    RemoteMessage built =
        ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap(readable);

    assertEquals("topic-dest", built.getTo());
    assertEquals(42, built.getTtl());
    assertEquals("mid-rt", built.getMessageId());
    assertEquals("type-a", built.getMessageType());
    assertEquals("ck", built.getCollapseKey());
    assertEquals("v1", built.getData().get("k1"));
  }

  @Test
  public void remoteMessageFromReadableMap_omitsOptionalKeysWhenAbsent() {
    ReadableMap readable = mock(ReadableMap.class);
    when(readable.getString("to")).thenReturn("dest-only");
    when(readable.hasKey(anyString())).thenReturn(false);

    RemoteMessage built =
        ReactNativeFirebaseMessagingSerializer.remoteMessageFromReadableMap(readable);

    assertEquals("dest-only", built.getTo());
    assertTrue(built.getData().isEmpty());
  }

  @Test
  public void remoteMessageToWritableMap_mapsBuilderBuiltMessage() {
    RemoteMessage remoteMessage =
        new RemoteMessage.Builder("dest")
            .setMessageId("mid-w")
            .setMessageType("mt")
            .setCollapseKey("ck")
            .setTtl(9)
            .addData("a", "b")
            .build();

    WritableMap messageMap = mock(WritableMap.class);
    WritableMap dataMap = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(messageMap, dataMap);

      WritableMap result =
          ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(remoteMessage);

      assertSame(messageMap, result);
      verify(messageMap).putString("collapseKey", "ck");
      verify(messageMap).putString("to", "dest");
      verify(messageMap).putString("messageId", "mid-w");
      verify(messageMap).putString("messageType", "mt");
      verify(dataMap).putString("a", "b");
      verify(messageMap).putMap("data", dataMap);
      verify(messageMap).putDouble(eq("ttl"), eq(9.0));
      verify(messageMap).putDouble(eq("sentTime"), anyDouble());
      verify(messageMap).putInt(eq("priority"), anyInt());
      verify(messageMap).putInt(eq("originalPriority"), anyInt());
      verify(messageMap, never()).putMap(eq("notification"), any());
    }
  }

  @Test
  public void remoteMessageToEvent_openVsReceived_andMapsBody() {
    RemoteMessage remoteMessage = new RemoteMessage.Builder("dest").setMessageId("mid-e").build();
    WritableMap messageMap = mock(WritableMap.class);
    WritableMap dataMap = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(messageMap, dataMap, messageMap, dataMap);

      ReactNativeFirebaseEvent opened =
          ReactNativeFirebaseMessagingSerializer.remoteMessageToEvent(remoteMessage, Boolean.TRUE);
      assertEquals("messaging_notification_opened", opened.getEventName());
      assertSame(messageMap, opened.getEventBody());

      ReactNativeFirebaseEvent received =
          ReactNativeFirebaseMessagingSerializer.remoteMessageToEvent(remoteMessage, Boolean.FALSE);
      assertEquals("messaging_message_received", received.getEventName());
    }
  }

  @Test
  public void remoteMessageNotificationToWritableMap_mapsPresentFields() {
    RemoteMessage.Notification notification = mock(RemoteMessage.Notification.class);
    Uri imageUri = mock(Uri.class);
    Uri linkUri = mock(Uri.class);
    when(imageUri.toString()).thenReturn("https://example.test/img.png");
    when(linkUri.toString()).thenReturn("https://example.test/link");
    WritableMap notificationMap = mock(WritableMap.class);
    WritableMap androidMap = mock(WritableMap.class);

    when(notification.getTitle()).thenReturn("Title");
    when(notification.getTitleLocalizationKey()).thenReturn("title_key");
    when(notification.getTitleLocalizationArgs()).thenReturn(new String[] {"t1"});
    when(notification.getBody()).thenReturn("Body");
    when(notification.getBodyLocalizationKey()).thenReturn("body_key");
    when(notification.getBodyLocalizationArgs()).thenReturn(new String[] {"b1"});
    when(notification.getChannelId()).thenReturn("chan");
    when(notification.getClickAction()).thenReturn("CLICK");
    when(notification.getColor()).thenReturn("#fff");
    when(notification.getIcon()).thenReturn("ic");
    when(notification.getImageUrl()).thenReturn(imageUri);
    when(notification.getLink()).thenReturn(linkUri);
    when(notification.getNotificationCount()).thenReturn(3);
    when(notification.getNotificationPriority()).thenReturn(1);
    when(notification.getSound()).thenReturn("default");
    when(notification.getTicker()).thenReturn("tick");
    when(notification.getVisibility()).thenReturn(0);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(notificationMap, androidMap);
      // WritableNativeArray needs SoLoader; stub via Answer returning a WritableArray mock.
      arguments
          .when(() -> Arguments.fromJavaArgs(any()))
          .thenAnswer(invocation -> mock(com.facebook.react.bridge.WritableArray.class));

      WritableMap result =
          ReactNativeFirebaseMessagingSerializer.remoteMessageNotificationToWritableMap(
              notification);

      assertSame(notificationMap, result);
      verify(notificationMap).putString("title", "Title");
      verify(notificationMap).putString("titleLocKey", "title_key");
      verify(notificationMap).putArray(eq("titleLocArgs"), any());
      verify(notificationMap).putString("body", "Body");
      verify(notificationMap).putString("bodyLocKey", "body_key");
      verify(notificationMap).putArray(eq("bodyLocArgs"), any());
      verify(androidMap).putString("channelId", "chan");
      verify(androidMap).putString("clickAction", "CLICK");
      verify(androidMap).putString("color", "#fff");
      verify(androidMap).putString("smallIcon", "ic");
      verify(androidMap).putString("imageUrl", "https://example.test/img.png");
      verify(androidMap).putString("link", "https://example.test/link");
      verify(androidMap).putInt("count", 3);
      verify(androidMap).putInt("priority", 1);
      verify(androidMap).putString("sound", "default");
      verify(androidMap).putString("ticker", "tick");
      verify(androidMap).putInt("visibility", 0);
      verify(notificationMap).putMap("android", androidMap);
    }
  }

  @Test
  public void remoteMessageNotificationToWritableMap_omitsNullOptionalFields() {
    RemoteMessage.Notification notification = mock(RemoteMessage.Notification.class);
    WritableMap notificationMap = mock(WritableMap.class);
    WritableMap androidMap = mock(WritableMap.class);

    when(notification.getTitle()).thenReturn(null);
    when(notification.getTitleLocalizationKey()).thenReturn(null);
    when(notification.getTitleLocalizationArgs()).thenReturn(null);
    when(notification.getBody()).thenReturn(null);
    when(notification.getBodyLocalizationKey()).thenReturn(null);
    when(notification.getBodyLocalizationArgs()).thenReturn(null);
    when(notification.getChannelId()).thenReturn(null);
    when(notification.getClickAction()).thenReturn(null);
    when(notification.getColor()).thenReturn(null);
    when(notification.getIcon()).thenReturn(null);
    when(notification.getImageUrl()).thenReturn(null);
    when(notification.getLink()).thenReturn(null);
    when(notification.getNotificationCount()).thenReturn(null);
    when(notification.getNotificationPriority()).thenReturn(null);
    when(notification.getSound()).thenReturn(null);
    when(notification.getTicker()).thenReturn(null);
    when(notification.getVisibility()).thenReturn(null);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(notificationMap, androidMap);

      ReactNativeFirebaseMessagingSerializer.remoteMessageNotificationToWritableMap(notification);

      verify(notificationMap, never()).putString(eq("title"), anyString());
      verify(notificationMap, never()).putString(eq("body"), anyString());
      verify(androidMap, never()).putString(anyString(), anyString());
      verify(androidMap, never()).putInt(anyString(), anyInt());
      verify(notificationMap).putMap("android", androidMap);
    }
  }

  @Test
  public void remoteMessageToWritableMap_includesNotificationWhenPresent() {
    RemoteMessage remoteMessage = mock(RemoteMessage.class);
    RemoteMessage.Notification notification = mock(RemoteMessage.Notification.class);
    WritableMap messageMap = mock(WritableMap.class);
    WritableMap dataMap = mock(WritableMap.class);
    WritableMap notificationMap = mock(WritableMap.class);
    WritableMap androidMap = mock(WritableMap.class);

    when(remoteMessage.getCollapseKey()).thenReturn(null);
    when(remoteMessage.getFrom()).thenReturn("sender");
    when(remoteMessage.getTo()).thenReturn(null);
    when(remoteMessage.getMessageId()).thenReturn(null);
    when(remoteMessage.getMessageType()).thenReturn(null);
    when(remoteMessage.getData()).thenReturn(Collections.emptyMap());
    when(remoteMessage.getTtl()).thenReturn(0);
    when(remoteMessage.getSentTime()).thenReturn(0L);
    when(remoteMessage.getPriority()).thenReturn(0);
    when(remoteMessage.getOriginalPriority()).thenReturn(0);
    when(remoteMessage.getNotification()).thenReturn(notification);
    when(notification.getTitle()).thenReturn(null);
    when(notification.getTitleLocalizationKey()).thenReturn(null);
    when(notification.getTitleLocalizationArgs()).thenReturn(null);
    when(notification.getBody()).thenReturn(null);
    when(notification.getBodyLocalizationKey()).thenReturn(null);
    when(notification.getBodyLocalizationArgs()).thenReturn(null);
    when(notification.getChannelId()).thenReturn(null);
    when(notification.getClickAction()).thenReturn(null);
    when(notification.getColor()).thenReturn(null);
    when(notification.getIcon()).thenReturn(null);
    when(notification.getImageUrl()).thenReturn(null);
    when(notification.getLink()).thenReturn(null);
    when(notification.getNotificationCount()).thenReturn(null);
    when(notification.getNotificationPriority()).thenReturn(null);
    when(notification.getSound()).thenReturn(null);
    when(notification.getTicker()).thenReturn(null);
    when(notification.getVisibility()).thenReturn(null);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap())
          .thenReturn(messageMap, dataMap, notificationMap, androidMap);

      ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(remoteMessage);

      verify(messageMap).putString("from", "sender");
      verify(messageMap, never()).putString(eq("collapseKey"), anyString());
      verify(messageMap, never()).putString(eq("to"), anyString());
      verify(messageMap).putMap("notification", notificationMap);
    }
  }

  @Test
  public void javaStaticShape_publicEventMethodsRemainStatic() throws Exception {
    // Cover default constructor bytecode on the outer class (static API is the real surface).
    assertNotNull(new ReactNativeFirebaseMessagingSerializer());

    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("messagesDeletedToEvent")
                .getModifiers()));
    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("messageSentToEvent", String.class)
                .getModifiers()));
    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("messageSendErrorToEvent", String.class, Exception.class)
                .getModifiers()));
    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("remoteMessageToEvent", RemoteMessage.class, Boolean.class)
                .getModifiers()));
    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("remoteMessageMapToEvent", WritableMap.class, Boolean.class)
                .getModifiers()));
    assertTrue(
        java.lang.reflect.Modifier.isStatic(
            ReactNativeFirebaseMessagingSerializer.class
                .getMethod("newTokenToTokenEvent", String.class)
                .getModifiers()));
    assertNotNull(
        ReactNativeFirebaseMessagingSerializer.class.getDeclaredMethod(
            "remoteMessageToWritableMap", RemoteMessage.class));
    assertNotNull(
        ReactNativeFirebaseMessagingSerializer.class.getDeclaredMethod(
            "remoteMessageFromReadableMap", ReadableMap.class));
  }
}
