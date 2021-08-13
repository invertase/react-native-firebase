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

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getTaskStatus;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.promiseRejectStorageException;

import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.FileDownloadTask;
import com.google.firebase.storage.StorageReference;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import java.io.File;
import java.util.concurrent.ExecutorService;
import javax.annotation.Nullable;

class ReactNativeFirebaseStorageDownloadTask extends ReactNativeFirebaseStorageTask {
  private static final String TAG = "RNFBStorageDownload";
  private FileDownloadTask fileDownloadTask;

  ReactNativeFirebaseStorageDownloadTask(
      int taskId, StorageReference storageReference, String appName) {
    super(taskId, storageReference, appName);
  }

  private static WritableMap buildDownloadSnapshotMap(
      @Nullable FileDownloadTask.TaskSnapshot snapshot) {
    WritableMap map = Arguments.createMap();

    if (snapshot != null) {
      map.putDouble(KEY_TOTAL_BYTES, snapshot.getTotalByteCount());
      map.putDouble(KEY_BYTES_TRANSFERRED, snapshot.getBytesTransferred());
      map.putString(KEY_STATE, getTaskStatus(snapshot.getTask()));
    } else {
      map.putDouble(KEY_TOTAL_BYTES, 0);
      map.putDouble(KEY_BYTES_TRANSFERRED, 0);
      map.putString(KEY_STATE, getTaskStatus(null));
    }

    return map;
  }

  private String getPath(String localFilePath) {
    int indexOfLastSlash = localFilePath.lastIndexOf("/");
    return indexOfLastSlash > 0 ? localFilePath.substring(0, indexOfLastSlash) + "/" : "/";
  }

  private String getFileName(String localFilePath) {
    int indexOfLastSlash = localFilePath.lastIndexOf("/");
    return indexOfLastSlash > 0 ? localFilePath.substring(indexOfLastSlash + 1) : localFilePath;
  }

  void addOnCompleteListener(ExecutorService executor, Promise promise) {
    if (fileDownloadTask == null) {
      // TODO(salakar) send failure event
      rejectPromiseWithCodeAndMessage(
          promise,
          "error-creating-directory",
          "Unable to create the directory specified as the download path for your file.");

      return;
    }

    fileDownloadTask.addOnCompleteListener(
        executor,
        task -> {
          destroyTask();

          if (task.isSuccessful()) {
            Log.d(TAG, "onComplete:success " + storageReference.toString());
            WritableMap taskSnapshot = buildDownloadSnapshotMap(task.getResult());
            ReactNativeFirebaseEventEmitter emitter =
                ReactNativeFirebaseEventEmitter.getSharedInstance();

            emitter.sendEvent(
                new ReactNativeFirebaseStorageEvent(
                    taskSnapshot,
                    ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
                    appName,
                    taskId));

            taskSnapshot = buildDownloadSnapshotMap(task.getResult());

            emitter.sendEvent(
                new ReactNativeFirebaseStorageEvent(
                    taskSnapshot,
                    ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_SUCCESS,
                    appName,
                    taskId));

            // re-creating WritableMap as they can only be consumed once, so another one is required
            taskSnapshot = buildDownloadSnapshotMap(task.getResult());

            promise.resolve(taskSnapshot);
          } else {
            Log.d(TAG, "onComplete:failure " + storageReference.toString());
            ReactNativeFirebaseEventEmitter emitter =
                ReactNativeFirebaseEventEmitter.getSharedInstance();

            WritableMap errorSnapshot =
                buildErrorSnapshotMap(
                    task.getException(),
                    buildDownloadSnapshotMap(fileDownloadTask.getSnapshot()),
                    true);

            // we force it to be null if Error code is 'cancelled' to match ios & web sdk behaviour
            // we only send a 'cancelled' state changed event and ignore the 'error' state_changed
            // event
            if (errorSnapshot != null) {
              emitter.sendEvent(
                  new ReactNativeFirebaseStorageEvent(
                      errorSnapshot,
                      ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
                      appName,
                      taskId));
            }

            emitter.sendEvent(
                new ReactNativeFirebaseStorageEvent(
                    buildErrorSnapshotMap(
                        task.getException(),
                        buildDownloadSnapshotMap(fileDownloadTask.getSnapshot()),
                        false),
                    ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_FAILURE,
                    appName,
                    taskId));

            promiseRejectStorageException(promise, task.getException());
          }
        });
  }

  private void addEventListeners(ExecutorService executor) {
    fileDownloadTask.addOnProgressListener(
        executor,
        taskSnapshotRaw -> {
          Log.d(TAG, "onProgress " + storageReference.toString());
          WritableMap taskSnapshot = buildDownloadSnapshotMap(taskSnapshotRaw);
          ReactNativeFirebaseEventEmitter.getSharedInstance()
              .sendEvent(
                  new ReactNativeFirebaseStorageEvent(
                      taskSnapshot,
                      ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
                      appName,
                      taskId));
        });

    fileDownloadTask.addOnCanceledListener(
        executor,
        () -> {
          Log.d(TAG, "onCancelled " + storageReference.toString());
          ReactNativeFirebaseEventEmitter.getSharedInstance()
              .sendEvent(
                  new ReactNativeFirebaseStorageEvent(
                      buildCancelledSnapshotMap(
                          buildDownloadSnapshotMap(fileDownloadTask.getSnapshot())),
                      ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
                      appName,
                      taskId));
        });

    fileDownloadTask.addOnPausedListener(
        executor,
        taskSnapshotRaw -> {
          Log.d(TAG, "onPaused " + storageReference.toString());
          WritableMap taskSnapshot = buildDownloadSnapshotMap(taskSnapshotRaw);
          ReactNativeFirebaseEventEmitter.getSharedInstance()
              .sendEvent(
                  new ReactNativeFirebaseStorageEvent(
                      taskSnapshot,
                      ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
                      appName,
                      taskId));
        });
  }

  void begin(ExecutorService executor, String localFilePath) {
    String pathWithoutFile = getPath(localFilePath);
    File downloadDirectory = new File(pathWithoutFile);

    boolean directoriesCreated = true;

    if (!downloadDirectory.exists()) {
      directoriesCreated = downloadDirectory.mkdirs();
    }

    if (directoriesCreated) {
      File fileWithFullPath = new File(pathWithoutFile, getFileName(localFilePath));
      fileDownloadTask = storageReference.getFile(fileWithFullPath);
      addEventListeners(executor);
      setStorageTask(fileDownloadTask);
    }
  }
}
