package io.invertase.firebase.perf;

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
import java.util.List;
import org.junit.Test;

/**
 * JVM coverage for {@link RNFBPerfHandleRegistry}. Does not instantiate {@code
 * UniversalFirebasePerfModule} / Firebase Perf types — D12.
 */
public class RNFBPerfHandleRegistryTest {

  @Test
  public void putTake_happyPath() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "trace");
    assertSame("trace", registry.take(1));
    assertNull(registry.take(1));
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "first");
    try {
      registry.put(1, "second");
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame("first", registry.take(1));
    }
  }

  @Test
  public void take_whenFree_isNull() {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    assertNull(registry.take(99));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    assertTrue(registry.putOrDiscard(1, "trace"));
    assertSame("trace", registry.take(1));
  }

  @Test
  public void putOrDiscard_collision_dropsIncomingWithoutDiscard() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "first");
    assertFalse(registry.putOrDiscard(1, "second"));
    assertSame("first", registry.take(1));
  }

  @Test
  public void putOrDiscard_collision_nullIncoming_isNoOp() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "first");
    assertFalse(registry.putOrDiscard(1, null));
    assertSame("first", registry.take(1));
  }

  @Test
  public void putReplacing_whenFree_stores() {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    assertNull(registry.putReplacing(1, "trace"));
    assertSame("trace", registry.get(1));
  }

  @Test
  public void putReplacing_whenOccupied_returnsDisplaced() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "first");
    assertSame("first", registry.putReplacing(1, "second"));
    assertSame("second", registry.get(1));
  }

  @Test
  public void putReplacing_moduleCollisionPattern_stopsDisplacedOutsideLock() throws Exception {
    RNFBPerfHandleRegistry<FakeStoppableHandle> registry = new RNFBPerfHandleRegistry<>();
    FakeStoppableHandle first = new FakeStoppableHandle();
    FakeStoppableHandle second = new FakeStoppableHandle();
    registry.put(1, first);
    FakeStoppableHandle displaced = registry.putReplacing(1, second);
    if (displaced != null) {
      displaced.stop();
    }
    assertEquals(1, first.stopCount);
    assertEquals(0, second.stopCount);
    assertSame(second, registry.get(1));
  }

  @Test
  public void get_whenFree_isNull() {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    assertNull(registry.get(99));
  }

  @Test
  public void get_whenOccupied_returnsHandle() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "trace");
    assertSame("trace", registry.get(1));
    assertSame("trace", registry.take(1));
  }

  @Test
  public void takeAll_returnsSnapshotAndLeavesEmpty() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "a");
    registry.put(2, "b");
    List<String> remaining = registry.takeAll();
    assertEquals(2, remaining.size());
    assertTrue(remaining.contains("a"));
    assertTrue(remaining.contains("b"));
    assertNull(registry.take(1));
    assertNull(registry.take(2));
  }

  @Test
  public void takeAll_empty_returnsEmptyList() {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    assertTrue(registry.takeAll().isEmpty());
  }

  @Test
  public void takeAll_nullHandle_isIncluded() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, null);
    List<String> remaining = registry.takeAll();
    assertEquals(1, remaining.size());
    assertNull(remaining.get(0));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBPerfHandleRegistry<String> registry = new RNFBPerfHandleRegistry<>();
    registry.put(1, "first");
    assertSame("first", registry.take(1));
    registry.put(1, "second");
    assertSame("second", registry.take(1));
  }

  private static final class FakeStoppableHandle {
    int stopCount = 0;

    void stop() {
      stopCount++;
    }
  }
}
