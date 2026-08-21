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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.firebase.firestore.ListenerRegistration;
import io.invertase.firebase.common.RNFBHandleCollisionException;
import org.junit.Test;

public class RNFBFirestoreListenerRegistryTest {

  private static final class FakeRegistration implements ListenerRegistration {
    int removeCount;

    @Override
    public void remove() {
      removeCount++;
    }
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration registration = new FakeRegistration();
    registry.put(1, registration);
    assertSame(registration, registry.get(1));
    assertSame(registration, registry.take(1));
    assertNull(registry.get(1));
    assertEquals(0, registration.removeCount);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration first = new FakeRegistration();
    registry.put(1, first);
    try {
      registry.put(1, new FakeRegistration());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, registry.get(1));
    }
  }

  @Test
  public void get_whenFree_isNull() {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    assertNull(registry.get(1));
  }

  @Test
  public void get_whenOccupied_returnsRegistration() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration first = new FakeRegistration();
    registry.put(1, first);
    assertSame(first, registry.get(1));
  }

  @Test
  public void putOrDiscard_collision_removesIncoming() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration first = new FakeRegistration();
    FakeRegistration duplicate = new FakeRegistration();
    registry.put(2, first);
    assertFalse(registry.putOrDiscard(2, duplicate));
    assertEquals(1, duplicate.removeCount);
    assertEquals(0, first.removeCount);
    assertSame(first, registry.get(2));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration registration = new FakeRegistration();
    assertTrue(registry.putOrDiscard(3, registration));
    assertSame(registration, registry.get(3));
    assertEquals(0, registration.removeCount);
  }

  @Test
  public void putOrDiscard_collision_nullIncoming_isNoOp() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration first = new FakeRegistration();
    registry.put(4, first);
    assertFalse(registry.putOrDiscard(4, null));
    assertSame(first, registry.get(4));
  }

  @Test
  public void takeAndRemove_removesAfterTake() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration registration = new FakeRegistration();
    registry.put(5, registration);
    registry.takeAndRemove(5);
    assertEquals(1, registration.removeCount);
    assertNull(registry.get(5));
  }

  @Test
  public void takeAndRemove_missingKey_isNoOp() {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    registry.takeAndRemove(99);
    assertNull(registry.get(99));
  }

  @Test
  public void takeAllAndRemove_removesSnapshotAndLeavesEmpty() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration a = new FakeRegistration();
    FakeRegistration b = new FakeRegistration();
    registry.put(1, a);
    registry.put(2, b);
    registry.takeAllAndRemove();
    assertEquals(1, a.removeCount);
    assertEquals(1, b.removeCount);
    assertNull(registry.get(1));
    assertNull(registry.get(2));
  }

  @Test
  public void takeAllAndRemove_empty_isNoOp() {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    registry.takeAllAndRemove();
    assertNull(registry.get(1));
  }

  @Test
  public void takeAllAndRemove_nullRegistration_isNoOp() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    registry.put(6, null);
    registry.takeAllAndRemove();
    assertNull(registry.get(6));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBFirestoreListenerRegistry registry = new RNFBFirestoreListenerRegistry();
    FakeRegistration first = new FakeRegistration();
    FakeRegistration second = new FakeRegistration();
    registry.put(1, first);
    assertSame(first, registry.take(1));
    registry.put(1, second);
    assertSame(second, registry.get(1));
    assertEquals(0, first.removeCount);
  }
}
