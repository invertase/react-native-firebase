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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StreamDownloadTask;

import java.io.File;
import java.io.FileOutputStream;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;

import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getTaskStatus;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.promiseRejectStorageException;

class ReactNativeFirebaseStorageDownloadTask extends ReactNativeFirebaseStorageTask {
  private static final String TAG = "RNFBStorageDownload";
  private StreamDownloadTask streamDownloadTask;

  ReactNativeFirebaseStorageDownloadTask(int taskId, StorageReference storageReference, String appName) {
    super(taskId, storageReference, appName);
  }

  private static WritableMap getDownloadTaskAsMap(@Nullable StreamDownloadTask.TaskSnapshot snapshot) {
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

  void addOnCompleteListener(Promise promise) {
    streamDownloadTask.addOnCompleteListener(task -> {
      destroyTask();

      if (task.isSuccessful()) {
        WritableMap taskSnapshot = getDownloadTaskAsMap(task.getResult());
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_SUCCESS,
          appName,
          storageReference.toString()
        ));

        // re-creating WritableMap as they can only be consumed once, so another one is required
        taskSnapshot = getDownloadTaskAsMap(task.getResult());

        promise.resolve(taskSnapshot);
      } else {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_FAILURE,
          appName,
          storageReference.toString()
        ));

        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  private void addEventListeners() {
    streamDownloadTask.addOnProgressListener(taskSnapshotRaw -> {
      Log.d(TAG, "onProgress " + storageReference.toString());
      WritableMap taskSnapshot = getDownloadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });

    streamDownloadTask.addOnCanceledListener(() -> {
      Log.d(TAG, "onCancelled " + storageReference.toString());
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          getCancelledTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });

    streamDownloadTask.addOnPausedListener(taskSnapshotRaw -> {
      Log.d(TAG, "onPaused " + storageReference.toString());
      WritableMap taskSnapshot = getDownloadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          storageReference.toString()
        ));
    });
  }

  void begin(String localFilePath) {
    streamDownloadTask = storageReference
      .getStream((taskSnapshot, inputStream) -> {
        String pathWithoutFile = getPath(localFilePath);
        File downloadDirectory = new File(pathWithoutFile);
        boolean directoriesCreated = true;

        if (!downloadDirectory.exists()) {
          directoriesCreated = downloadDirectory.mkdirs();
        }

        if (directoriesCreated) {
          File fileWithFullPath = new File(pathWithoutFile, getFileName(localFilePath));
          FileOutputStream output = new FileOutputStream(fileWithFullPath);

          int len;
          int bufferSize = 2048;
          byte[] buffer = new byte[bufferSize];
          while ((len = inputStream.read(buffer)) != -1) {
            output.write(buffer, 0, len);
          }

          output.close();
          inputStream.close();
        } else {
          Log.e(
            TAG,
            "failed to start download (ERROR_CREATING_DIRECTORIES) " + storageReference.toString()
          );
          streamDownloadTask.cancel();
          inputStream.close();
        }
      });

    addEventListeners();
    setStorageTask(streamDownloadTask);
  }
}
