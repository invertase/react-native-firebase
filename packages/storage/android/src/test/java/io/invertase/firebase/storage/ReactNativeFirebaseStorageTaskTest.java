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
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import android.util.Log;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageTask;
import org.junit.After;
import org.junit.Test;
import org.mockito.MockedStatic;

public class ReactNativeFirebaseStorageTaskTest {

  private static final class FakeHandle implements StoragePendingHandle {
    int cancelCount;

    @Override
    public boolean pause() {
      return false;
    }

    @Override
    public boolean resume() {
      return false;
    }

    @Override
    public boolean cancel() {
      cancelCount++;
      return true;
    }
  }

  private static final class RecordingTask extends ReactNativeFirebaseStorageTask {
    int beginCount;

    RecordingTask(int taskId) {
      super(taskId, null, "app");
    }

    void begin() {
      beginCount++;
    }
  }

  @After
  public void tearDown() {
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(11);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(12);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(13);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(14);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(15);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(16);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(17);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(18);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(19);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(20);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(21);
    ReactNativeFirebaseStorageTask.PENDING_TASKS.take(22);
  }

  private static StorageReference stubReference() {
    StorageReference ref = mock(StorageReference.class);
    when(ref.toString()).thenReturn("gs://bucket/path");
    return ref;
  }

  private static ReactNativeFirebaseStorageTask registeredTask(int taskId) {
    ReactNativeFirebaseStorageTask task =
        new ReactNativeFirebaseStorageTask(taskId, stubReference(), "app");
    assertTrue(task.registerPending());
    return task;
  }

  @Test
  public void constructor_uniqueId_registersPendingTask() {
    RecordingTask task = new RecordingTask(11);
    assertTrue(task.registerPending());
    assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(11));
    task.begin();
    assertEquals(1, task.beginCount);
  }

  @Test
  public void registerPending_occupiedId_cancelsIncomingAndKeepsExisting() throws Exception {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      FakeHandle first = new FakeHandle();
      ReactNativeFirebaseStorageTask.PENDING_TASKS.put(12, first);
      ReactNativeFirebaseStorageTask second =
          new ReactNativeFirebaseStorageTask(12, stubReference(), "app");
      assertFalse(second.registerPending());
      assertSame(first, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(12));
      assertEquals(0, first.cancelCount);
    }
  }

  /**
   * Regression: when the incoming handle has a live StorageTask whose cancel() succeeds,
   * destroyTask must not evict the existing mapping at the same taskId (identity-gated take).
   */
  @Test
  public void registerPending_occupiedId_successfulCancelDoesNotEvictExisting() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask existing = registeredTask(22);

      ReactNativeFirebaseStorageTask incoming =
          new ReactNativeFirebaseStorageTask(22, stubReference(), "app");
      StorageTask<?> storageTask = mock(StorageTask.class);
      incoming.setStorageTask(storageTask);
      when(storageTask.isCanceled()).thenReturn(false);
      when(storageTask.isComplete()).thenReturn(false);
      when(storageTask.isPaused()).thenReturn(false);
      when(storageTask.isInProgress()).thenReturn(true);
      when(storageTask.cancel()).thenReturn(true);

      assertFalse(incoming.registerPending());
      assertSame(existing, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(22));
    }
  }

  @Test
  public void pauseResumeCancel_whenStorageTaskNull_returnFalseWithoutNpe() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(13);
      assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(13));
      assertFalse(task.pause());
      assertFalse(task.resume());
      assertFalse(task.cancel());
      assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(13));
    }
  }

  @Test
  public void cancelIfPresent_whenStorageTaskNull_doesNotTakeMapping() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(14);
      assertFalse(ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAndCancel(14));
      assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(14));
      assertFalse(task.pause());
    }
  }

  @Test
  public void setTaskStatusCancel_whenStorageTaskNull_doesNotTakeMapping() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      registeredTask(15);
      assertFalse(ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAndCancel(15));
      assertNotNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(15));
    }
  }

  @Test
  public void destroyTask_takesPendingMapping() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(16);
      task.destroyTask();
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(16));
    }
  }

  @Test
  public void invalidate_whenStorageTaskNull_takeAllThenCancelWithoutNpe() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      registeredTask(17);
      ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAllAndCancel();
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(17));
    }
  }

  @Test
  public void pauseResumeCancel_whenStorageTaskPresent_delegateToSdkTask() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(18);
      StorageTask<?> storageTask = mock(StorageTask.class);
      task.setStorageTask(storageTask);

      when(storageTask.isPaused()).thenReturn(false);
      when(storageTask.isInProgress()).thenReturn(true);
      when(storageTask.pause()).thenReturn(true);
      assertTrue(task.pause());

      when(storageTask.isPaused()).thenReturn(true);
      when(storageTask.resume()).thenReturn(true);
      assertTrue(task.resume());

      when(storageTask.isPaused()).thenReturn(false);
      when(storageTask.isCanceled()).thenReturn(false);
      when(storageTask.isInProgress()).thenReturn(true);
      when(storageTask.cancel()).thenReturn(true);
      assertTrue(task.cancel());
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(18));
    }
  }

  @Test
  public void cancel_whenPaused_delegatesToSdkTask() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(19);
      StorageTask<?> storageTask = mock(StorageTask.class);
      task.setStorageTask(storageTask);

      when(storageTask.isCanceled()).thenReturn(false);
      when(storageTask.isComplete()).thenReturn(false);
      when(storageTask.isPaused()).thenReturn(true);
      when(storageTask.isInProgress()).thenReturn(false);
      when(storageTask.cancel()).thenReturn(true);

      assertTrue(task.cancel());
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(19));
    }
  }

  @Test
  public void takeAndCancel_whenPausedCancelSucceeds_takesMapping() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(20);
      StorageTask<?> storageTask = mock(StorageTask.class);
      task.setStorageTask(storageTask);

      when(storageTask.isCanceled()).thenReturn(false);
      when(storageTask.isComplete()).thenReturn(false);
      when(storageTask.isPaused()).thenReturn(true);
      when(storageTask.isInProgress()).thenReturn(false);
      when(storageTask.cancel()).thenReturn(true);

      assertTrue(ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAndCancel(20));
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(20));
    }
  }

  @Test
  public void cancel_whenSdkCancelReturnsFalse_keepsMapping() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(21);
      StorageTask<?> storageTask = mock(StorageTask.class);
      task.setStorageTask(storageTask);

      when(storageTask.isCanceled()).thenReturn(false);
      when(storageTask.isComplete()).thenReturn(false);
      when(storageTask.isPaused()).thenReturn(true);
      when(storageTask.isInProgress()).thenReturn(false);
      when(storageTask.cancel()).thenReturn(false);

      assertFalse(task.cancel());
      assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(21));
    }
  }
}
