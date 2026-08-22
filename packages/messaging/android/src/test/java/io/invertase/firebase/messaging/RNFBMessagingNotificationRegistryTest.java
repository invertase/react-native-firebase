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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import io.invertase.firebase.common.RNFBHandleCollisionException;
import org.junit.Test;

/**
 * JVM coverage for {@link RNFBMessagingNotificationRegistry}. Does not instantiate {@code
 * ReactNativeFirebaseMessagingReceiver} / {@code NativeRNFBTurboMessaging} (React Native /
 * Firebase) — D12.
 */
public class RNFBMessagingNotificationRegistryTest {

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    registry.put("msg-1", "payload");
    assertSame("payload", registry.get("msg-1"));
    assertSame("payload", registry.take("msg-1"));
    assertNull(registry.get("msg-1"));
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    registry.put("msg-1", "first");
    try {
      registry.put("msg-1", "second");
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("msg-1"));
      assertSame("first", registry.get("msg-1"));
    }
  }

  @Test
  public void get_whenFree_isNull() {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    assertNull(registry.get("missing"));
  }

  @Test
  public void take_whenFree_isNull() {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    assertNull(registry.take("missing"));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    assertTrue(registry.putOrDiscard("msg-1", "payload"));
    assertSame("payload", registry.get("msg-1"));
  }

  @Test
  public void putOrDiscard_collision_keepsExisting() throws Exception {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    registry.put("msg-1", "first");
    assertFalse(registry.putOrDiscard("msg-1", "second"));
    assertSame("first", registry.get("msg-1"));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBMessagingNotificationRegistry<String> registry = new RNFBMessagingNotificationRegistry<>();
    registry.put("msg-1", "first");
    assertSame("first", registry.take("msg-1"));
    registry.put("msg-1", "second");
    assertSame("second", registry.get("msg-1"));
  }
}
