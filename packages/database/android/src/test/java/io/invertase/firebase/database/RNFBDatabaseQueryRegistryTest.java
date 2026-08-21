package io.invertase.firebase.database;

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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.Test;

public class RNFBDatabaseQueryRegistryTest {

  private static final class FakeQuery implements DatabaseQueryHandle {
    int removeCount;
    volatile boolean listeners;

    @Override
    public void removeAllEventListeners() {
      removeCount++;
      listeners = false;
    }

    @Override
    public Boolean hasListeners() {
      return listeners;
    }
  }

  private static final class GatedFakeQuery implements DatabaseQueryHandle {
    volatile boolean listeners;
    final CountDownLatch hasListenersEntered = new CountDownLatch(1);
    final CountDownLatch allowHasListenersReturn = new CountDownLatch(1);

    @Override
    public void removeAllEventListeners() {
      listeners = false;
    }

    @Override
    public Boolean hasListeners() {
      hasListenersEntered.countDown();
      try {
        assertTrue(allowHasListenersReturn.await(5, TimeUnit.SECONDS));
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
      return listeners;
    }
  }

  private static final class PutBackGatedQuery implements DatabaseQueryHandle {
    volatile boolean listeners;
    int removeCount;
    final CountDownLatch firstEntered = new CountDownLatch(1);
    final CountDownLatch allowFirstReturn = new CountDownLatch(1);
    final CountDownLatch secondEntered = new CountDownLatch(1);
    final CountDownLatch allowSecondReturn = new CountDownLatch(1);
    final AtomicInteger calls = new AtomicInteger();

    @Override
    public void removeAllEventListeners() {
      removeCount++;
      listeners = false;
    }

    @Override
    public Boolean hasListeners() {
      int n = calls.incrementAndGet();
      if (n == 1) {
        firstEntered.countDown();
        try {
          assertTrue(allowFirstReturn.await(5, TimeUnit.SECONDS));
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new RuntimeException(e);
        }
        return false;
      }
      secondEntered.countDown();
      try {
        assertTrue(allowSecondReturn.await(5, TimeUnit.SECONDS));
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
      return listeners;
    }
  }

  @Test
  public void takeIfIdle_concurrentOffOnRace_retainsMappingWhenListenersAddedDuringCheck()
      throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    GatedFakeQuery query = new GatedFakeQuery();
    query.listeners = false;
    registry.put("q", query);

    CountDownLatch offDone = new CountDownLatch(1);
    Thread offThread =
        new Thread(
            () -> {
              try {
                registry.takeIfIdle("q");
              } finally {
                offDone.countDown();
              }
            });

    offThread.start();
    assertTrue(query.hasListenersEntered.await(5, TimeUnit.SECONDS));
    query.listeners = true;
    query.allowHasListenersReturn.countDown();
    assertTrue(offDone.await(5, TimeUnit.SECONDS));

    assertSame(query, registry.get("q"));
  }

  /**
   * Proves hasListeners runs outside the HandleMap lock: while hasListeners is blocked, a
   * concurrent put on another key must complete (would deadlock if takeIfIdle held the map lock).
   */
  @Test
  public void takeIfIdle_doesNotHoldMapLockDuringHasListeners() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    GatedFakeQuery query = new GatedFakeQuery();
    query.listeners = false;
    registry.put("q", query);

    CountDownLatch putDone = new CountDownLatch(1);
    Thread takeThread = new Thread(() -> registry.takeIfIdle("q"));
    takeThread.start();
    assertTrue(query.hasListenersEntered.await(5, TimeUnit.SECONDS));

    Thread putThread =
        new Thread(
            () -> {
              try {
                registry.put("other", new FakeQuery());
                putDone.countDown();
              } catch (RNFBHandleCollisionException e) {
                throw new RuntimeException(e);
              }
            });
    putThread.start();
    assertTrue(
        "HandleMap lock must not be held while hasListeners runs",
        putDone.await(2, TimeUnit.SECONDS));

    // Keep the mapping after unlock; this test only asserts lock nesting.
    query.listeners = true;
    query.allowHasListenersReturn.countDown();
    takeThread.join(5000);
    putThread.join(5000);
    assertSame(query, registry.get("q"));
    assertTrue(registry.get("other") instanceof FakeQuery);
  }

  /** Outside check saw idle; after identity-take, listeners appeared — put-back retains mapping. */
  @Test
  public void takeIfIdle_putBackWhenListenersAppearAfterOutsideIdleCheck() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    PutBackGatedQuery query = new PutBackGatedQuery();
    query.listeners = false;
    registry.put("q", query);

    CountDownLatch takeDone = new CountDownLatch(1);
    Thread takeThread =
        new Thread(
            () -> {
              try {
                registry.takeIfIdle("q");
              } finally {
                takeDone.countDown();
              }
            });
    takeThread.start();

    assertTrue(query.firstEntered.await(5, TimeUnit.SECONDS));
    query.allowFirstReturn.countDown();
    assertTrue(query.secondEntered.await(5, TimeUnit.SECONDS));
    query.listeners = true;
    query.allowSecondReturn.countDown();
    assertTrue(takeDone.await(5, TimeUnit.SECONDS));

    assertSame(query, registry.get("q"));
    assertEquals(2, query.calls.get());
  }

  /**
   * After identity-take, listeners appear but a concurrent put claimed the slot — put-back fails;
   * orphan must clear listeners so SDK callbacks are not left outside the registry.
   */
  @Test
  public void takeIfIdle_putBackFails_clearsOrphanListeners() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    PutBackGatedQuery orphan = new PutBackGatedQuery();
    orphan.listeners = false;
    registry.put("q", orphan);

    FakeQuery replacement = new FakeQuery();
    replacement.listeners = true;

    CountDownLatch takeDone = new CountDownLatch(1);
    Thread takeThread =
        new Thread(
            () -> {
              try {
                registry.takeIfIdle("q");
              } finally {
                takeDone.countDown();
              }
            });
    takeThread.start();

    assertTrue(orphan.firstEntered.await(5, TimeUnit.SECONDS));
    orphan.allowFirstReturn.countDown();
    assertTrue(orphan.secondEntered.await(5, TimeUnit.SECONDS));
    registry.put("q", replacement);
    orphan.listeners = true;
    orphan.allowSecondReturn.countDown();
    assertTrue(takeDone.await(5, TimeUnit.SECONDS));

    assertSame(replacement, registry.get("q"));
    assertEquals(1, orphan.removeCount);
    assertFalse(orphan.listeners);
    assertEquals(0, replacement.removeCount);
  }

  @Test
  public void takeIfIdle_concurrentOffOnRace_stressRetainsWhenListenersAlreadyActive()
      throws Exception {
    for (int attempt = 0; attempt < 200; attempt++) {
      RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
      FakeQuery query = new FakeQuery();
      query.listeners = true;
      registry.put("q", query);

      CountDownLatch start = new CountDownLatch(1);
      CountDownLatch done = new CountDownLatch(2);

      Thread offThread =
          new Thread(
              () -> {
                try {
                  start.await();
                  registry.takeIfIdle("q");
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                } finally {
                  done.countDown();
                }
              });
      Thread onThread =
          new Thread(
              () -> {
                try {
                  start.await();
                  query.listeners = true;
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                } finally {
                  done.countDown();
                }
              });

      offThread.start();
      onThread.start();
      start.countDown();
      assertTrue(done.await(5, TimeUnit.SECONDS));
      assertSame(query, registry.get("q"));
    }
  }

  @Test
  public void takeIfIdle_concurrentTakeIfIdle_onIdleQuery_leavesMapEmpty() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery query = new FakeQuery();
    query.listeners = false;
    registry.put("q", query);

    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(2);

    Thread t1 =
        new Thread(
            () -> {
              try {
                start.await();
                registry.takeIfIdle("q");
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
                registry.takeIfIdle("q");
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

    assertNull(registry.get("q"));
    assertEquals(0, query.removeCount);
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery query = new FakeQuery();
    registry.put("q1", query);
    assertSame(query, registry.get("q1"));
    assertSame(query, registry.take("q1"));
    assertNull(registry.get("q1"));
    assertEquals(0, query.removeCount);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery first = new FakeQuery();
    registry.put("q1", first);
    try {
      registry.put("q1", new FakeQuery());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("q1"));
      assertSame(first, registry.get("q1"));
    }
  }

  @Test
  public void takeAllAndRemove_removesSnapshotAndLeavesEmpty() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery a = new FakeQuery();
    FakeQuery b = new FakeQuery();
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
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    registry.takeAllAndRemove();
    assertNull(registry.get("a"));
  }

  @Test
  public void takeAllAndRemove_nullQuery_isNoOp() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    registry.put("n", null);
    registry.takeAllAndRemove();
    assertNull(registry.get("n"));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery first = new FakeQuery();
    FakeQuery second = new FakeQuery();
    registry.put("q1", first);
    assertSame(first, registry.take("q1"));
    registry.put("q1", second);
    assertSame(second, registry.get("q1"));
    assertFalse(first.removeCount != 0);
  }

  @Test
  public void takeIfIdle_whenNoListeners_takes() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery query = new FakeQuery();
    query.listeners = false;
    registry.put("q", query);
    registry.takeIfIdle("q");
    assertNull(registry.get("q"));
    assertEquals(0, query.removeCount);
  }

  @Test
  public void takeIfIdle_whenHasListeners_leavesMapping() throws Exception {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    FakeQuery query = new FakeQuery();
    query.listeners = true;
    registry.put("q", query);
    registry.takeIfIdle("q");
    assertSame(query, registry.get("q"));
  }

  @Test
  public void takeIfIdle_whenMissing_isNoOp() {
    RNFBDatabaseQueryRegistry registry = new RNFBDatabaseQueryRegistry();
    registry.takeIfIdle("missing");
    assertNull(registry.get("missing"));
  }
}
