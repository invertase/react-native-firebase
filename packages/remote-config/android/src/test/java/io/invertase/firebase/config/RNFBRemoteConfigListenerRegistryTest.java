package io.invertase.firebase.config;

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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import io.invertase.firebase.common.RNFBHandleCollisionException;
import org.junit.Test;

/**
 * JVM coverage for {@link RNFBRemoteConfigListenerRegistry}. Does not instantiate {@code
 * NativeRNFBTurboConfig} (React Native / Firebase) — D12.
 */
public class RNFBRemoteConfigListenerRegistryTest {

  private static final class FakeHandle implements ConfigUpdateListenerHandle {
    int removeCount;

    @Override
    public void remove() {
      removeCount++;
    }
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle handle = new FakeHandle();
    registry.put("app", handle);
    assertSame(handle, registry.get("app"));
    assertSame(handle, registry.take("app"));
    assertNull(registry.get("app"));
    assertEquals(0, handle.removeCount);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle first = new FakeHandle();
    registry.put("app", first);
    try {
      registry.put("app", new FakeHandle());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("app"));
      assertSame(first, registry.get("app"));
    }
  }

  @Test
  public void get_whenFree_isNull() {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    assertNull(registry.get("app"));
  }

  @Test
  public void get_whenOccupied_returnsHandle() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle first = new FakeHandle();
    registry.put("app", first);
    assertSame(first, registry.get("app"));
  }

  @Test
  public void putOrDiscard_collision_removesIncoming() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle first = new FakeHandle();
    FakeHandle duplicate = new FakeHandle();
    registry.put("app", first);
    assertFalse(registry.putOrDiscard("app", duplicate));
    assertEquals(1, duplicate.removeCount);
    assertEquals(0, first.removeCount);
    assertSame(first, registry.get("app"));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle handle = new FakeHandle();
    assertTrue(registry.putOrDiscard("app", handle));
    assertSame(handle, registry.get("app"));
    assertEquals(0, handle.removeCount);
  }

  @Test
  public void putOrDiscard_collision_nullIncoming_isNoOp() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle first = new FakeHandle();
    registry.put("app", first);
    assertFalse(registry.putOrDiscard("app", null));
    assertSame(first, registry.get("app"));
  }

  @Test
  public void takeAndRemove_removesAfterTake() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle handle = new FakeHandle();
    registry.put("app", handle);
    registry.takeAndRemove("app");
    assertEquals(1, handle.removeCount);
    assertNull(registry.get("app"));
  }

  @Test
  public void takeAndRemove_missingKey_isNoOp() {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    registry.takeAndRemove("missing");
    assertNull(registry.get("missing"));
  }

  @Test
  public void takeAllAndRemove_removesSnapshotAndLeavesEmpty() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle a = new FakeHandle();
    FakeHandle b = new FakeHandle();
    registry.put("a", a);
    registry.put("b", b);
    registry.takeAllAndRemove();
    assertEquals(1, a.removeCount);
    assertEquals(1, b.removeCount);
    assertNull(registry.get("a"));
    assertNull(registry.get("b"));
  }

  @Test
  public void takeAllAndRemove_empty_isNoOp() {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    registry.takeAllAndRemove();
    assertNull(registry.get("app"));
  }

  @Test
  public void takeAllAndRemove_nullHandle_isNoOp() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    registry.put("app", null);
    registry.takeAllAndRemove();
    assertNull(registry.get("app"));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBRemoteConfigListenerRegistry registry = new RNFBRemoteConfigListenerRegistry();
    FakeHandle first = new FakeHandle();
    FakeHandle second = new FakeHandle();
    registry.put("app", first);
    assertSame(first, registry.take("app"));
    registry.put("app", second);
    assertSame(second, registry.get("app"));
    assertEquals(0, first.removeCount);
  }
}
