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

import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageTaskInternal;

class ReactNativeFirebaseStorageTask {
  static final String KEY_STATE = "state";
  static final String KEY_META_DATA = "metadata";
  static final String KEY_TOTAL_BYTES = "totalBytes";
  static final String KEY_BYTES_TRANSFERRED = "bytesTransferred";
  static final SparseArray<ReactNativeFirebaseStorageTask> PENDING_TASKS = new SparseArray<>();

  int taskId;
  String appName;
  StorageTaskInternal storageTask;
  StorageReference storageReference;

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

  static WritableMap getCancelledTaskMap() {
    WritableMap taskMap = Arguments.createMap();
    taskMap.putString("state", "cancelled");
    return taskMap;
  }

  static WritableMap getErrorTaskMap() {
    WritableMap taskMap = Arguments.createMap();
    taskMap.putString("state", "error");
    return taskMap;
  }

  private boolean pause() {
    if (!storageTask.isPaused() && storageTask.isInProgress()) {
      return storageTask.pause();
    }

    return false;
  }

  private boolean resume() {
    if (storageTask.isPaused() && storageTask.isInProgress()) {
      return storageTask.resume();
    }

    return false;
  }

  private boolean cancel() {
    if (!storageTask.isCanceled() && storageTask.isInProgress()) {
      destroyTask();
      return storageTask.cancel();
    }

    return false;
  }

  void destroyTask() {
    PENDING_TASKS.remove(taskId);
  }

  void setStorageTask(StorageTaskInternal storageTask) {
    this.storageTask = storageTask;
  }
}
