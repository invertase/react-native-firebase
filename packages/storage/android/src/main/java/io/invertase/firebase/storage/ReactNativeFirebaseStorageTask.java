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

import android.util.Log;
import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageTask;

import javax.annotation.Nullable;

import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.CODE_CANCELLED;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.STATUS_CANCELLED;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.STATUS_ERROR;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getExceptionCodeAndMessage;

class ReactNativeFirebaseStorageTask {
  static final String KEY_STATE = "state";
  static final String KEY_META_DATA = "metadata";
  static final String KEY_TOTAL_BYTES = "totalBytes";
  static final String KEY_BYTES_TRANSFERRED = "bytesTransferred";
  private static final String KEY_ERROR = "error";
  private static final String KEY_CODE = "code";
  private static final String KEY_MESSAGE = "message";
  private static final String KEY_NATIVE_ERROR_MESSAGE = "nativeErrorMessage";
  private static final SparseArray<ReactNativeFirebaseStorageTask> PENDING_TASKS = new SparseArray<>();
  private static final String TAG = "RNFBStorageTask";
  int taskId;
  String appName;
  StorageReference storageReference;
  private StorageTask storageTask;

  ReactNativeFirebaseStorageTask(int taskId, StorageReference storageReference, String appName) {
    this.taskId = taskId;
    this.storageReference = storageReference;
    this.appName = appName;
    PENDING_TASKS.put(taskId, this);
  }

  static boolean pauseTaskById(int taskId) {
    ReactNativeFirebaseStorageTask reactNativeFirebaseStorageTask = PENDING_TASKS.get(taskId);
    if (reactNativeFirebaseStorageTask != null) {
      return reactNativeFirebaseStorageTask.pause();
    }

    return false;
  }

  static boolean resumeTaskById(int taskId) {
    ReactNativeFirebaseStorageTask reactNativeFirebaseStorageTask = PENDING_TASKS.get(taskId);
    if (reactNativeFirebaseStorageTask != null) {
      return reactNativeFirebaseStorageTask.resume();
    }

    return false;
  }

  static boolean cancelTaskById(int taskId) {
    ReactNativeFirebaseStorageTask reactNativeFirebaseStorageTask = PENDING_TASKS.get(taskId);
    if (reactNativeFirebaseStorageTask != null) {
      return reactNativeFirebaseStorageTask.cancel();
    }

    return false;
  }

  static void destroyAllTasks() {
    for (int i = 0, size = PENDING_TASKS.size(); i < size; i++) {
      int key = PENDING_TASKS.keyAt(i);
      ReactNativeFirebaseStorageTask reactNativeFirebaseStorageTask = PENDING_TASKS.get(key);
      reactNativeFirebaseStorageTask.cancel();
    }
    PENDING_TASKS.clear();
  }

  static WritableMap buildCancelledSnapshotMap(WritableMap snapshot) {
    snapshot.putString(KEY_STATE, STATUS_CANCELLED);
    return snapshot;
  }

  static WritableMap buildErrorSnapshotMap(@Nullable Exception exception, WritableMap taskMap, boolean skipCancelled) {
    WritableMap errorMap = Arguments.createMap();
    String[] exceptionCodeAndMessage = getExceptionCodeAndMessage(exception);
    if (skipCancelled && exceptionCodeAndMessage[0].equals(CODE_CANCELLED)) return null;
    errorMap.putString(KEY_CODE, exceptionCodeAndMessage[0]);
    errorMap.putString(KEY_MESSAGE, exceptionCodeAndMessage[1]);
    if (exception != null) errorMap.putString(KEY_NATIVE_ERROR_MESSAGE, exception.getMessage());
    taskMap.putMap(KEY_ERROR, errorMap);
    taskMap.putString(KEY_STATE, STATUS_ERROR);
    return taskMap;
  }

  private boolean pause() {
    Log.d(TAG, "pausing task for " + storageReference.toString());

    if (!storageTask.isPaused() && storageTask.isInProgress()) {
      return storageTask.pause();
    }

    return false;
  }

  private boolean resume() {
    Log.d(TAG, "resuming task for " + storageReference.toString());

    if (storageTask.isPaused()) {
      return storageTask.resume();
    }

    return false;
  }

  private boolean cancel() {
    Log.d(TAG, "cancelling task for " + storageReference.toString());

    if (!storageTask.isCanceled() && storageTask.isInProgress()) {
      destroyTask();
      return storageTask.cancel();
    }

    return false;
  }

  void destroyTask() {
    PENDING_TASKS.remove(taskId);

    Log.d(TAG, "destroyed completed task for " + storageReference.toString());
  }

  void setStorageTask(StorageTask storageTask) {
    this.storageTask = storageTask;
  }
}
