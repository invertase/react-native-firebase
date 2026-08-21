package io.invertase.firebase.firestore;

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

public class RNFBFirestoreTransactionRegistryTest {

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler handler =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    registry.put(1, handler);
    assertSame(handler, registry.get(1));
    assertSame(handler, registry.take(1));
    assertNull(registry.get(1));
    assertFalse(handler.aborted);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler first =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    registry.put(1, first);
    try {
      registry.put(1, new ReactNativeFirebaseFirestoreTransactionHandler("app", 1));
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, registry.get(1));
    }
  }

  @Test
  public void putOrSkip_uniqueId_putsHandler() {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler handler =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);

    assertTrue(registry.putOrSkip(1, handler));
    assertSame(handler, registry.get(1));
    assertFalse(handler.aborted);
  }

  @Test
  public void putOrSkip_retryGet_sameValue_shortCircuits() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler handler =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    registry.put(1, handler);

    assertTrue(registry.putOrSkip(1, handler));
    assertSame(handler, registry.get(1));
    assertFalse(handler.aborted);
  }

  @Test
  public void putOrSkip_occupiedId_skipsAndLeavesExisting() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler first =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 2);
    registry.put(2, first);
    ReactNativeFirebaseFirestoreTransactionHandler duplicate =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 2);

    assertFalse(registry.putOrSkip(2, duplicate));
    assertSame(first, registry.get(2));
    assertFalse(first.aborted);
    assertFalse(duplicate.aborted);
  }

  @Test
  public void takeAndAbort_abortsAfterTake() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler handler =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 3);
    registry.put(3, handler);
    registry.takeAndAbort(3);
    assertTrue(handler.aborted);
    assertNull(registry.get(3));
  }

  @Test
  public void takeAndAbort_missingKey_isNoOp() {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    registry.takeAndAbort(99);
    assertNull(registry.get(99));
  }

  @Test
  public void takeAllAndAbort_abortsSnapshotAndLeavesEmpty() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler a =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    ReactNativeFirebaseFirestoreTransactionHandler b =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 2);
    registry.put(1, a);
    registry.put(2, b);
    registry.takeAllAndAbort();
    assertTrue(a.aborted);
    assertTrue(b.aborted);
    assertNull(registry.get(1));
    assertNull(registry.get(2));
  }

  @Test
  public void takeAllAndAbort_empty_isNoOp() {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    registry.takeAllAndAbort();
    assertNull(registry.get(1));
  }

  @Test
  public void takeAllAndAbort_nullHandler_isNoOp() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    registry.put(4, null);
    registry.takeAllAndAbort();
    assertNull(registry.get(4));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBFirestoreTransactionRegistry registry = new RNFBFirestoreTransactionRegistry();
    ReactNativeFirebaseFirestoreTransactionHandler first =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    ReactNativeFirebaseFirestoreTransactionHandler second =
        new ReactNativeFirebaseFirestoreTransactionHandler("app", 1);
    registry.put(1, first);
    assertSame(first, registry.take(1));
    registry.put(1, second);
    assertSame(second, registry.get(1));
    assertFalse(first.aborted);
  }
}
