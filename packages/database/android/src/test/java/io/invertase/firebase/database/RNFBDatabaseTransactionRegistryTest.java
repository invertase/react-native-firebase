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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import io.invertase.firebase.common.RNFBHandleCollisionException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.Test;

public class RNFBDatabaseTransactionRegistryTest {

  private static final class FakeAbortable implements DatabaseAbortable {
    int abortCount;

    @Override
    public void abort() {
      abortCount++;
    }
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable handler = new FakeAbortable();
    registry.put(1, handler);
    assertSame(handler, registry.get(1));
    assertSame(handler, registry.take(1));
    assertNull(registry.get(1));
    assertTrue(handler.abortCount == 0);
  }

  @Test
  public void put_occupiedId_abortsIncomingAndLeavesExisting() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable first = new FakeAbortable();
    FakeAbortable duplicate = new FakeAbortable();
    registry.put(1, first);
    try {
      registry.put(1, duplicate);
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, registry.get(1));
      assertTrue(first.abortCount == 0);
      assertTrue(duplicate.abortCount == 1);
    }
  }

  @Test
  public void put_occupiedId_nullIncoming_doesNotAbort() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable first = new FakeAbortable();
    registry.put(2, first);
    try {
      registry.put(2, null);
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertSame(first, registry.get(2));
      assertTrue(first.abortCount == 0);
    }
  }

  @Test
  public void registerReplacing_replacesLastWins() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable first = new FakeAbortable();
    FakeAbortable second = new FakeAbortable();
    registry.put(3, first);
    registry.registerReplacing(3, second);
    assertSame(second, registry.get(3));
    assertTrue(first.abortCount == 0);
    assertTrue(second.abortCount == 0);
  }

  @Test
  public void registerReplacing_sameIdFromTwoThreads_lastWins() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable first = new FakeAbortable();
    registry.put(5, first);

    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(2);
    FakeAbortable second = new FakeAbortable();
    FakeAbortable third = new FakeAbortable();

    Thread t1 =
        new Thread(
            () -> {
              try {
                start.await();
                registry.registerReplacing(5, second);
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
                registry.registerReplacing(5, third);
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

    DatabaseAbortable stored = registry.get(5);
    assertTrue(stored == second || stored == third);
    assertTrue(first.abortCount == 0);
  }

  @Test
  public void takeAndAbort_abortsAfterTake() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable handler = new FakeAbortable();
    registry.put(3, handler);
    registry.takeAndAbort(3);
    assertTrue(handler.abortCount == 1);
    assertNull(registry.get(3));
  }

  @Test
  public void takeAndAbort_missingKey_isNoOp() {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    registry.takeAndAbort(99);
    assertNull(registry.get(99));
  }

  @Test
  public void takeAllAndAbort_abortsSnapshotAndLeavesEmpty() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable a = new FakeAbortable();
    FakeAbortable b = new FakeAbortable();
    registry.put(1, a);
    registry.put(2, b);
    registry.takeAllAndAbort();
    assertTrue(a.abortCount == 1);
    assertTrue(b.abortCount == 1);
    assertNull(registry.get(1));
    assertNull(registry.get(2));
  }

  @Test
  public void takeAllAndAbort_empty_isNoOp() {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    registry.takeAllAndAbort();
    assertNull(registry.get(1));
  }

  @Test
  public void takeAllAndAbort_nullHandler_isNoOp() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    registry.put(4, null);
    registry.takeAllAndAbort();
    assertNull(registry.get(4));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBDatabaseTransactionRegistry registry = new RNFBDatabaseTransactionRegistry();
    FakeAbortable first = new FakeAbortable();
    FakeAbortable second = new FakeAbortable();
    registry.put(1, first);
    assertSame(first, registry.take(1));
    registry.put(1, second);
    assertSame(second, registry.get(1));
    assertFalse(first.abortCount != 0);
  }
}
