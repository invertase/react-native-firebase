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
import static org.junit.Assert.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.common.ReactNativeFirebaseEvent;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.interfaces.NativeEvent;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for the installation-id (FID) event plumbing: {@link
 * ReactNativeFirebaseMessagingSerializer} event builders and the {@link
 * ReactNativeFirebaseMessagingService} {@code onRegistered} / {@code onUnregistered} callbacks.
 *
 * <p>Robolectric provides the {@code Service} base class and main looper; Mockito replaces the
 * native-backed {@code Arguments.createMap()} and the shared event emitter.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseMessagingInstallationIdEventsTest {

  private WritableMap eventBody;

  @Before
  public void setUp() {
    eventBody = mock(WritableMap.class);
  }

  @Test
  public void registeredToEvent_carriesInstallationId() {
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(eventBody);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.registeredToEvent("fid-1");

      assertEquals("messaging_registered", event.getEventName());
      assertSame(eventBody, event.getEventBody());
      verify(eventBody).putString("installationId", "fid-1");
    }
  }

  @Test
  public void unregisteredToEvent_carriesInstallationId() {
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(eventBody);

      ReactNativeFirebaseEvent event =
          ReactNativeFirebaseMessagingSerializer.unregisteredToEvent("fid-2");

      assertEquals("messaging_unregistered", event.getEventName());
      assertSame(eventBody, event.getEventBody());
      verify(eventBody).putString("installationId", "fid-2");
    }
  }

  @Test
  public void service_onRegistered_emitsRegisteredEvent() {
    NativeEvent event = emitFrom(service -> service.onRegistered("fid-3"));

    assertEquals("messaging_registered", event.getEventName());
    verify(eventBody).putString("installationId", "fid-3");
  }

  @Test
  public void service_onUnregistered_emitsUnregisteredEvent() {
    NativeEvent event = emitFrom(service -> service.onUnregistered("fid-4"));

    assertEquals("messaging_unregistered", event.getEventName());
    verify(eventBody).putString("installationId", "fid-4");
  }

  private interface ServiceCall {
    void run(ReactNativeFirebaseMessagingService service);
  }

  private NativeEvent emitFrom(ServiceCall call) {
    ReactNativeFirebaseEventEmitter emitter = mock(ReactNativeFirebaseEventEmitter.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class);
        MockedStatic<ReactNativeFirebaseEventEmitter> emitters =
            mockStatic(ReactNativeFirebaseEventEmitter.class)) {
      arguments.when(Arguments::createMap).thenReturn(eventBody);
      emitters.when(ReactNativeFirebaseEventEmitter::getSharedInstance).thenReturn(emitter);

      call.run(new ReactNativeFirebaseMessagingService());

      ArgumentCaptor<NativeEvent> captor = ArgumentCaptor.forClass(NativeEvent.class);
      verify(emitter).sendEvent(captor.capture());
      return captor.getValue();
    }
  }
}
