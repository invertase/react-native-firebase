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
  }

  private static StorageReference stubReference() {
    StorageReference ref = mock(StorageReference.class);
    when(ref.toString()).thenReturn("gs://bucket/path");
    return ref;
  }

  private static ReactNativeFirebaseStorageTask registeredTask(int taskId) {
    return new ReactNativeFirebaseStorageTask(taskId, stubReference(), "app");
  }

  @Test
  public void constructor_uniqueId_registersPendingTask() {
    RecordingTask task = new RecordingTask(11);
    assertSame(task, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(11));
    task.begin();
    assertEquals(1, task.beginCount);
  }

  @Test
  public void constructor_occupiedId_throwsAndDoesNotStartSecondTask() throws Exception {
    FakeHandle first = new FakeHandle();
    ReactNativeFirebaseStorageTask.PENDING_TASKS.put(12, first);
    RecordingTask second = null;
    try {
      second = new RecordingTask(12);
      second.begin();
      fail("expected unique-put collision");
    } catch (IllegalStateException collision) {
      assertTrue(collision.getMessage().contains("12"));
      assertNull(second);
      assertSame(first, ReactNativeFirebaseStorageTask.PENDING_TASKS.get(12));
      assertEquals(0, first.cancelCount);
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
  public void cancelIfPresent_whenStorageTaskNull_takesThenCancels() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      ReactNativeFirebaseStorageTask task = registeredTask(14);
      assertTrue(ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAndCancel(14));
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(14));
      assertFalse(task.pause());
    }
  }

  @Test
  public void setTaskStatusCancel_whenStorageTaskNull_takesThenCancels() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      when(Log.d(anyString(), anyString())).thenReturn(0);
      registeredTask(15);
      assertTrue(ReactNativeFirebaseStorageTask.PENDING_TASKS.takeAndCancel(15));
      assertNull(ReactNativeFirebaseStorageTask.PENDING_TASKS.get(15));
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
}
