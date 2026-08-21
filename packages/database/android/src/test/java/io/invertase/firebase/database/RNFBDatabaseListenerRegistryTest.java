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

public class RNFBDatabaseListenerRegistryTest {

  @Test
  public void putValueGetTake_happyPath() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    Object listener = new Object();
    registry.putValue("k", listener);
    assertSame(listener, registry.getValue("k"));
    assertSame(listener, registry.takeValue("k"));
    assertNull(registry.getValue("k"));
    assertFalse(registry.hasListeners());
  }

  @Test
  public void putChildGetTake_happyPath() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    Object listener = new Object();
    registry.putChild("k", listener);
    assertSame(listener, registry.getChild("k"));
    assertSame(listener, registry.takeChild("k"));
    assertNull(registry.getChild("k"));
    assertFalse(registry.hasListeners());
  }

  @Test
  public void putValue_occupiedId_throwsCollision() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    Object first = new Object();
    registry.putValue("k", first);
    try {
      registry.putValue("k", new Object());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("k"));
      assertSame(first, registry.getValue("k"));
    }
  }

  @Test
  public void putChild_occupiedId_throwsCollision() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    Object first = new Object();
    registry.putChild("k", first);
    try {
      registry.putChild("k", new Object());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("k"));
      assertSame(first, registry.getChild("k"));
    }
  }

  @Test
  public void putValue_nullListener_throws() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    try {
      registry.putValue("k", null);
      fail("expected NullPointerException");
    } catch (NullPointerException e) {
      assertEquals("listener", e.getMessage());
      assertFalse(registry.hasListeners());
    }
  }

  @Test
  public void putChild_nullListener_throws() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    try {
      registry.putChild("k", null);
      fail("expected NullPointerException");
    } catch (NullPointerException e) {
      assertEquals("listener", e.getMessage());
    }
  }

  @Test
  public void takeValue_missingKey_isNoOp() {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    assertNull(registry.takeValue("missing"));
    assertFalse(registry.hasListeners());
  }

  @Test
  public void takeChild_missingKey_isNoOp() {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    assertNull(registry.takeChild("missing"));
  }

  @Test
  public void takeAllValuesAndChildren_empty_isNoOp() {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    assertTrue(registry.takeAllValues().isEmpty());
    assertTrue(registry.takeAllChildren().isEmpty());
  }

  @Test
  public void hasEventListener_valueOrChild() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    assertFalse(registry.hasEventListener("k"));
    registry.putValue("k", new Object());
    assertTrue(registry.hasEventListener("k"));
    registry.takeValue("k");
    registry.putChild("k", new Object());
    assertTrue(registry.hasEventListener("k"));
  }

  @Test
  public void hasListeners_tracksOccupancyAcrossMaps() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    registry.putValue("v", new Object());
    registry.putChild("c", new Object());
    assertTrue(registry.hasListeners());
    registry.takeAllValues();
    assertTrue(registry.hasListeners());
    registry.takeAllChildren();
    assertFalse(registry.hasListeners());
  }

  @Test
  public void takeAll_combinesValueAndChildMaps() throws Exception {
    RNFBDatabaseListenerRegistry registry = new RNFBDatabaseListenerRegistry();
    Object value = new Object();
    Object child = new Object();
    registry.putValue("v", value);
    registry.putChild("c", child);
    assertEquals(2, registry.takeAll().size());
    assertFalse(registry.hasListeners());
    assertNull(registry.getValue("v"));
    assertNull(registry.getChild("c"));
  }
}
