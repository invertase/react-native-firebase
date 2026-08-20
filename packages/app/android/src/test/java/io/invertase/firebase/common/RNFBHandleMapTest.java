package io.invertase.firebase.common;

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

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Before;
import org.junit.Test;

/**
 * JVM coverage for {@link RNFBHandleMap}. Tests must not invoke methods on stored values — the map
 * only moves pointers.
 */
public class RNFBHandleMapTest {

  private RNFBHandleMap<Integer, Object> map;

  @Before
  public void setUp() {
    map = new RNFBHandleMap<>();
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    Object handle = new Object();
    map.put(1, handle);

    assertSame(handle, map.get(1));
    assertSame(handle, map.take(1));
    assertNull(map.get(1));
  }

  @Test
  public void take_missingKey_returnsNull() {
    assertNull(map.take(99));
    assertNull(map.get(99));
  }

  @Test
  public void takeAll_returnsSnapshotAndLeavesMapEmpty() throws Exception {
    Object a = new Object();
    Object b = new Object();
    map.put(1, a);
    map.put(2, b);

    List<Object> snapshot = map.takeAll();

    assertEquals(2, snapshot.size());
    assertTrue(snapshot.contains(a));
    assertTrue(snapshot.contains(b));
    assertNull(map.get(1));
    assertNull(map.get(2));
    assertTrue(map.takeAll().isEmpty());
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    Object first = new Object();
    map.put(1, first);
    try {
      map.put(1, new Object());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, map.get(1));
    }
  }

  @Test
  public void putIfAbsent_whenFree_storesAndReturnsTrue() throws Exception {
    Object handle = new Object();
    assertTrue(map.putIfAbsent(1, handle));
    assertSame(handle, map.get(1));
  }

  @Test
  public void putIfAbsent_whenOccupied_keepsExistingAndReturnsFalse() throws Exception {
    Object first = new Object();
    Object second = new Object();
    map.put(1, first);
    assertFalse(map.putIfAbsent(1, second));
    assertSame(first, map.get(1));
  }

  @Test
  public void putIfAbsentOrSame_whenAbsent_storesAndReturnsTrue() {
    Object handle = new Object();
    assertTrue(map.putIfAbsentOrSame(1, handle));
    assertSame(handle, map.get(1));
  }

  @Test
  public void putIfAbsentOrSame_whenSameInstance_returnsTrue() throws Exception {
    Object handle = new Object();
    map.put(1, handle);
    assertTrue(map.putIfAbsentOrSame(1, handle));
    assertSame(handle, map.get(1));
  }

  @Test
  public void putIfAbsentOrSame_whenDifferent_returnsFalse() throws Exception {
    Object first = new Object();
    Object second = new Object();
    map.put(1, first);
    assertFalse(map.putIfAbsentOrSame(1, second));
    assertSame(first, map.get(1));
  }

  @Test
  public void putReplacing_whenFree_storesAndReturnsNull() throws Exception {
    Object handle = new Object();
    assertNull(map.putReplacing(1, handle));
    assertSame(handle, map.get(1));
  }

  @Test
  public void putReplacing_whenOccupied_replacesLastWins() throws Exception {
    Object first = new Object();
    Object second = new Object();
    map.put(1, first);
    assertSame(first, map.putReplacing(1, second));
    assertSame(second, map.get(1));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    Object first = new Object();
    Object second = new Object();
    map.put(1, first);
    assertSame(first, map.take(1));
    map.put(1, second);
    assertSame(second, map.get(1));
  }

  @Test
  public void take_sameIdFromTwoThreads_onlyOneReturnsNonNull() throws Exception {
    Object handle = new Object();
    map.put(1, handle);

    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(2);
    AtomicReference<Object> first = new AtomicReference<>();
    AtomicReference<Object> second = new AtomicReference<>();

    Thread t1 =
        new Thread(
            () -> {
              try {
                start.await();
                first.set(map.take(1));
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
                second.set(map.take(1));
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

    Object a = first.get();
    Object b = second.get();
    boolean onlyFirst = a == handle && b == null;
    boolean onlySecond = b == handle && a == null;
    assertTrue(onlyFirst || onlySecond);
    assertNull(map.get(1));
  }

  @Test
  public void putReplacing_sameIdFromTwoThreads_lastWins() throws Exception {
    Object first = new Object();
    Object second = new Object();
    Object third = new Object();
    map.put(1, first);

    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(2);
    AtomicReference<Object> prevA = new AtomicReference<>();
    AtomicReference<Object> prevB = new AtomicReference<>();

    Thread t1 =
        new Thread(
            () -> {
              try {
                start.await();
                prevA.set(map.putReplacing(1, second));
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
                prevB.set(map.putReplacing(1, third));
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

    Object winner = map.get(1);
    assertTrue(winner == second || winner == third);
    Object returnedFirst = prevA.get() == first ? prevA.get() : prevB.get();
    assertSame(first, returnedFirst);
  }
}
