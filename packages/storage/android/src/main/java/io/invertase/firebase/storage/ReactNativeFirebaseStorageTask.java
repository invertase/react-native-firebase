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

import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StreamDownloadTask;
import com.google.firebase.storage.UploadTask;

import java.io.File;
import java.io.FileOutputStream;

import javax.annotation.Nullable;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;

public class ReactNativeFirebaseStorageTask {
  private static final String TAG = "RNFirebaseStorageTask";


  private String appName;
  private String bucketUrl; // TODO
  private UploadTask uploadTask;
  private StorageReference storageReference;
  private StreamDownloadTask streamDownloadTask; // TODO

  ReactNativeFirebaseStorageTask(
    StorageReference storageReference,
    String appName,
    String bucketUrl
  ) {
    this.storageReference = storageReference;
    this.appName = appName;
    this.bucketUrl = bucketUrl;
  }

  private static WritableMap getCancelledTaskMap() {
    WritableMap taskMap = Arguments.createMap();
    taskMap.putString(
      "state",
      "cancelled"
    );
    return taskMap;
  }

  static WritableMap getDownloadTaskAsMap(@Nullable StreamDownloadTask.TaskSnapshot taskSnapshot) {
    // TODO(salakar) handle null snapshots

    WritableMap taskMap = Arguments.createMap();
    taskMap.putDouble("bytesTransferred", taskSnapshot.getBytesTransferred());
    taskMap.putString("ref", taskSnapshot.getStorage().getPath());
    taskMap.putString(
      "state",
      ReactNativeFirebaseStorageModule.getTaskStatus(taskSnapshot.getTask())
    );
    taskMap.putDouble("totalBytes", taskSnapshot.getTotalByteCount());
    return taskMap;
  }

  static WritableMap getUploadTaskAsMap(@Nullable UploadTask.TaskSnapshot taskSnapshot) {
    // TODO(salakar) handle null snapshots

    WritableMap uploadTaskMap = Arguments.createMap();
    StorageMetadata metadata = taskSnapshot.getMetadata();
    uploadTaskMap.putDouble("bytesTransferred", taskSnapshot.getBytesTransferred());

    if (metadata != null) {
      uploadTaskMap.putMap("metadata", ReactNativeFirebaseStorageModule.getMetadataAsMap(metadata));
    }

    uploadTaskMap.putString("ref", taskSnapshot.getStorage().getPath());
    uploadTaskMap.putString(
      "state",
      ReactNativeFirebaseStorageModule.getTaskStatus(taskSnapshot.getTask())
    );
    uploadTaskMap.putDouble("totalBytes", taskSnapshot.getTotalByteCount());

    return uploadTaskMap;
  }

  /**
   * Create a Uri from the path, defaulting to file when there is no supplied scheme
   */
  private static Uri getUri(final String uri) {
    Uri parsed = Uri.parse(uri);

    if (parsed.getScheme() == null || parsed
      .getScheme()
      .isEmpty()) {
      return Uri.fromFile(new File(uri));
    }
    return parsed;
  }

  UploadTask startUpload(String localFilePath, ReadableMap metadataMap) {
    Uri fileUri = getUri(localFilePath);
    StorageMetadata metadata = ReactNativeFirebaseStorageModule.buildMetadataFromMap(
      metadataMap,
      fileUri
    );

    uploadTask = storageReference.putFile(fileUri, metadata);

    uploadTask.addOnProgressListener(taskSnapshotRaw -> {
      WritableMap taskSnapshot = getUploadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          localFilePath
        ));
    });

    uploadTask.addOnCanceledListener(() -> ReactNativeFirebaseEventEmitter
      .getSharedInstance()
      .sendEvent(new ReactNativeFirebaseStorageEvent(
        getCancelledTaskMap(),
        ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
        appName,
        localFilePath
      )));

    uploadTask.addOnPausedListener(taskSnapshotRaw -> {
      WritableMap taskSnapshot = getUploadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          localFilePath
        ));
    });

    return uploadTask;
  }

  StreamDownloadTask startDownload(String localFilePath) {
    streamDownloadTask = storageReference
      .getStream((taskSnapshot, inputStream) -> {
        int indexOfLastSlash = localFilePath.lastIndexOf("/");
        String pathMinusFileName = indexOfLastSlash > 0 ? localFilePath.substring(
          0,
          indexOfLastSlash
        ) + "/" : "/";
        String filename = indexOfLastSlash > 0 ? localFilePath.substring(indexOfLastSlash + 1) : localFilePath;
        File fileWithJustPath = new File(pathMinusFileName);

        // directoriesCreated assignment for not consumed warning
        Boolean directoriesCreated = fileWithJustPath.mkdirs();
        File fileWithFullPath = new File(pathMinusFileName, filename);
        FileOutputStream output = new FileOutputStream(fileWithFullPath);

        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];

        int len;
        while ((len = inputStream.read(buffer)) != -1) {
          output.write(buffer, 0, len);
        }

        output.close();
      });


    streamDownloadTask.addOnProgressListener(taskSnapshotRaw -> {
      Log.d(TAG, "downloadFile progress " + taskSnapshotRaw);
      WritableMap taskSnapshot = getDownloadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          localFilePath
        ));
    });

    streamDownloadTask.addOnCanceledListener(() -> ReactNativeFirebaseEventEmitter
      .getSharedInstance()
      .sendEvent(new ReactNativeFirebaseStorageEvent(
        getCancelledTaskMap(),
        ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
        appName,
        localFilePath
      )));

    streamDownloadTask.addOnPausedListener(taskSnapshotRaw -> {
      Log.d(TAG, "downloadFile paused " + taskSnapshotRaw);
      WritableMap taskSnapshot = getDownloadTaskAsMap(taskSnapshotRaw);
      ReactNativeFirebaseEventEmitter
        .getSharedInstance()
        .sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          localFilePath
        ));
    });

    return streamDownloadTask;
  }

}
