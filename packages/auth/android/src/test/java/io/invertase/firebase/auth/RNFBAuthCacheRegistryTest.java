package io.invertase.firebase.auth;

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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;

/**
 * JVM coverage for {@link RNFBAuthCacheRegistry}. Does not instantiate {@code NativeRNFBTurboAuth}
 * (React Native / Firebase) — D12.
 */
public class RNFBAuthCacheRegistryTest {

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "payload");
    assertSame("payload", registry.get("k1"));
    assertSame("payload", registry.take("k1"));
    assertNull(registry.get("k1"));
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "first");
    try {
      registry.put("k1", "second");
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("k1"));
      assertSame("first", registry.get("k1"));
    }
  }

  @Test
  public void get_whenFree_isNull() {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    assertNull(registry.get("missing"));
  }

  @Test
  public void take_whenFree_isNull() {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    assertNull(registry.take("missing"));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    assertTrue(registry.putOrDiscard("k1", "payload"));
    assertSame("payload", registry.get("k1"));
  }

  @Test
  public void putOrDiscard_collision_keepsExisting() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "first");
    assertFalse(registry.putOrDiscard("k1", "second"));
    assertSame("first", registry.get("k1"));
  }

  @Test
  public void putReplacing_whenFree_stores() {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.putReplacing("k1", "payload");
    assertSame("payload", registry.get("k1"));
  }

  @Test
  public void putReplacing_whenOccupied_replacesLastWins() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "first");
    registry.putReplacing("k1", "second");
    assertSame("second", registry.get("k1"));
  }

  @Test
  public void putReplacing_sameIdFromTwoThreads_lastWins() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "first");

    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(2);
    AtomicReference<String> winner = new AtomicReference<>();

    Thread t1 =
        new Thread(
            () -> {
              try {
                start.await();
                registry.putReplacing("k1", "second");
                winner.compareAndSet(null, registry.get("k1"));
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                done.countDown();
              }
            });
    Thread t2 =
        new Thread(
            () -> {
              try {
                start.await();
                registry.putReplacing("k1", "third");
                winner.compareAndSet(null, registry.get("k1"));
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                done.countDown();
              }
            });

    t1.start();
    t2.start();
    start.countDown();
    assertTrue(done.await(5, TimeUnit.SECONDS));

    String stored = registry.get("k1");
    assertTrue(stored == "second" || stored == "third");
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("k1", "first");
    assertSame("first", registry.take("k1"));
    registry.put("k1", "second");
    assertSame("second", registry.get("k1"));
  }

  @Test
  public void clear_removesAll() throws Exception {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.put("a", "1");
    registry.put("b", "2");
    registry.clear();
    assertNull(registry.get("a"));
    assertNull(registry.get("b"));
  }

  @Test
  public void clear_empty_isNoOp() {
    RNFBAuthCacheRegistry<String> registry = new RNFBAuthCacheRegistry<>();
    registry.clear();
    assertNull(registry.get("k1"));
  }
}
