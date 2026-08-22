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
import org.junit.Test;

public class RNFBDatabaseQueryRegistryTest {

  private static final class FakeQuery implements DatabaseQueryHandle {
    int removeCount;
    boolean listeners;

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
