package io.invertase.firebase.storage;

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

public class RNFBStorageTaskRegistryTest {

  private static final class FakeHandle implements StoragePendingHandle {
    int pauseCount;
    int resumeCount;
    int cancelCount;
    boolean pauseResult = true;
    boolean resumeResult = true;
    boolean cancelResult = true;
    Runnable onCancel;

    @Override
    public boolean pause() {
      pauseCount++;
      return pauseResult;
    }

    @Override
    public boolean resume() {
      resumeCount++;
      return resumeResult;
    }

    @Override
    public boolean cancel() {
      cancelCount++;
      if (onCancel != null) {
        onCancel.run();
      }
      return cancelResult;
    }
  }

  @Test
  public void putGetTake_happyPath() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle handle = new FakeHandle();
    registry.put(1, handle);
    assertSame(handle, registry.get(1));
    assertSame(handle, registry.take(1));
    assertNull(registry.get(1));
    assertEquals(0, handle.cancelCount);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle first = new FakeHandle();
    registry.put(1, first);
    try {
      registry.put(1, new FakeHandle());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, registry.get(1));
    }
  }

  @Test
  public void putOrDiscard_collision_cancelsIncoming() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle first = new FakeHandle();
    FakeHandle duplicate = new FakeHandle();
    registry.put(2, first);
    assertFalse(registry.putOrDiscard(2, duplicate));
    assertEquals(1, duplicate.cancelCount);
    assertEquals(0, first.cancelCount);
    assertSame(first, registry.get(2));
  }

  @Test
  public void putOrDiscard_storesWhenFree() {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle handle = new FakeHandle();
    assertTrue(registry.putOrDiscard(3, handle));
    assertSame(handle, registry.get(3));
    assertEquals(0, handle.cancelCount);
  }

  @Test
  public void putOrDiscard_collision_nullIncoming_isNoOp() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle first = new FakeHandle();
    registry.put(4, first);
    assertFalse(registry.putOrDiscard(4, null));
    assertSame(first, registry.get(4));
  }

  @Test
  public void takeAndCancel_cancelsAfterTake() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle handle = new FakeHandle();
    registry.put(5, handle);
    assertTrue(registry.takeAndCancel(5));
    assertEquals(1, handle.cancelCount);
    assertNull(registry.get(5));
  }

  @Test
  public void takeAndCancel_missingKey_isNoOp() {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    assertFalse(registry.takeAndCancel(99));
    assertNull(registry.get(99));
  }

  @Test
  public void takeAndCancel_whenCancelReturnsFalse_keepsMapping() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle handle = new FakeHandle();
    handle.cancelResult = false;
    registry.put(6, handle);
    assertFalse(registry.takeAndCancel(6));
    assertEquals(1, handle.cancelCount);
    assertSame(handle, registry.get(6));
  }

  /**
   * Regression: production cancel may destroyTask (clear A) then a new put B can land at the same
   * id before takeAndCancel's trailing unregister. Trailing take must be identity-gated so B stays.
   */
  @Test
  public void takeAndCancel_replacementDuringCancel_leavesReplacement() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle replacement = new FakeHandle();
    FakeHandle original = new FakeHandle();
    original.onCancel =
        () -> {
          // Simulate destroyTask clearing this handle, then a new put at the same id.
          assertSame(original, registry.take(9));
          try {
            registry.put(9, replacement);
          } catch (RNFBHandleCollisionException e) {
            fail(e.getMessage());
          }
        };
    registry.put(9, original);
    assertTrue(registry.takeAndCancel(9));
    assertEquals(1, original.cancelCount);
    assertSame(replacement, registry.get(9));
    assertEquals(0, replacement.cancelCount);
  }

  @Test
  public void takeAllAndCancel_cancelsSnapshotAndLeavesEmpty() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle a = new FakeHandle();
    FakeHandle b = new FakeHandle();
    registry.put(1, a);
    registry.put(2, b);
    registry.takeAllAndCancel();
    assertEquals(1, a.cancelCount);
    assertEquals(1, b.cancelCount);
    assertNull(registry.get(1));
    assertNull(registry.get(2));
  }

  @Test
  public void takeAllAndCancel_empty_isNoOp() {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    registry.takeAllAndCancel();
    assertNull(registry.get(1));
  }

  @Test
  public void takeAllAndCancel_nullHandle_isNoOp() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    registry.put(6, null);
    registry.takeAllAndCancel();
    assertNull(registry.get(6));
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBStorageTaskRegistry registry = new RNFBStorageTaskRegistry();
    FakeHandle first = new FakeHandle();
    FakeHandle second = new FakeHandle();
    registry.put(1, first);
    assertSame(first, registry.take(1));
    registry.put(1, second);
    assertSame(second, registry.get(1));
    assertEquals(0, first.cancelCount);
  }
}
