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

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.webkit.MimeTypeMap;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageException;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageTask;
import com.google.firebase.storage.UploadTask;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import javax.annotation.Nullable;

import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseStorageModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Storage";

  private static final String DocumentDirectoryPath = "DOCUMENT_DIRECTORY_PATH";
  private static final String ExternalDirectoryPath = "EXTERNAL_DIRECTORY_PATH";
  private static final String ExternalStorageDirectoryPath = "EXTERNAL_STORAGE_DIRECTORY_PATH";
  private static final String PicturesDirectoryPath = "PICTURES_DIRECTORY_PATH";
  private static final String TemporaryDirectoryPath = "TEMP_DIRECTORY_PATH";
  private static final String CachesDirectoryPath = "CACHES_DIRECTORY_PATH";
  private static final String FileTypeRegular = "FILE_TYPE_REGULAR";
  private static final String FileTypeDirectory = "FILE_TYPE_DIRECTORY";

  ReactNativeFirebaseStorageModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  /**
   * Returns the task status as string
   *
   * @param task
   * @return
   */
  static String getTaskStatus(StorageTask<?> task) {
    if (task.isInProgress()) {
      return "running";
    } else if (task.isPaused()) {
      return "paused";
    } else if (task.isSuccessful() || task.isComplete()) {
      return "success";
    } else if (task.isCanceled()) {
      return "cancelled";
    } else if (task.getException() != null) {
      return "error";
    } else {
      return "unknown";
    }
  }

  /**
   * Converts a RN ReadableMap into a StorageMetadata instance
   */
  static StorageMetadata buildMetadataFromMap(ReadableMap metadataMap, @Nullable Uri file) {
    StorageMetadata.Builder metadataBuilder = new StorageMetadata.Builder();

    if (metadataMap != null) {
      if (metadataMap.hasKey("customMetadata")) {
        ReadableMap customerMetaMap = Objects.requireNonNull(metadataMap.getMap("customMetadata"));
        Map<String, Object> customMeta = customerMetaMap.toHashMap();
        for (Map.Entry<String, Object> entry : customMeta.entrySet()) {
          metadataBuilder.setCustomMetadata(entry.getKey(), String.valueOf(entry.getValue()));
        }
      }

      if (metadataMap.hasKey("cacheControl")) {
        metadataBuilder.setCacheControl(metadataMap.getString("cacheControl"));
      }

      if (metadataMap.hasKey("contentEncoding")) {
        metadataBuilder.setContentEncoding(metadataMap.getString("contentEncoding"));
      }

      if (metadataMap.hasKey("contentLanguage")) {
        metadataBuilder.setContentLanguage(metadataMap.getString("contentLanguage"));
      }

      if (metadataMap.hasKey("contentDisposition")) {
        metadataBuilder.setContentDisposition(metadataMap.getString("contentDisposition"));
      }
    }

    if (metadataMap != null && metadataMap.hasKey("contentType")) {
      metadataBuilder.setContentType(metadataMap.getString("contentType"));
    } else if (file != null) {
      String mimeType = null;
      String fileScheme = file.getScheme();

      if (fileScheme != null && fileScheme.equals(ContentResolver.SCHEME_CONTENT)) {
        Context context = ReactNativeFirebaseApp.getApplicationContext();
        mimeType = context.getContentResolver().getType(file);
      }

      if (mimeType == null) {
        String fileExt = MimeTypeMap.getFileExtensionFromUrl(file.toString());
        mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExt.toLowerCase());
      }

      if (mimeType != null) {
        metadataBuilder.setContentType(mimeType);
      }
    }

    return metadataBuilder.build();
  }

  static WritableMap getMetadataAsMap(@Nullable StorageMetadata storageMetadata) {
    if (storageMetadata == null) return null;

    WritableMap metadata = Arguments.createMap();

    metadata.putString("bucket", storageMetadata.getBucket());
    metadata.putString("generation", storageMetadata.getGeneration());
    metadata.putString("metageneration", storageMetadata.getMetadataGeneration());
    metadata.putString("fullPath", storageMetadata.getPath());
    metadata.putString("name", storageMetadata.getName());
    metadata.putDouble("size", storageMetadata.getSizeBytes());
    metadata.putDouble("timeCreated", storageMetadata.getCreationTimeMillis());
    metadata.putDouble("updated", storageMetadata.getUpdatedTimeMillis());
    metadata.putString("md5hash", storageMetadata.getMd5Hash());
    metadata.putString("cacheControl", storageMetadata.getCacheControl());
    metadata.putString("contentDisposition", storageMetadata.getContentDisposition());
    metadata.putString("contentEncoding", storageMetadata.getContentEncoding());
    metadata.putString("contentLanguage", storageMetadata.getContentLanguage());
    metadata.putString("contentType", storageMetadata.getContentType());

    WritableMap customMetadata = Arguments.createMap();

    for (String key : storageMetadata.getCustomMetadataKeys()) {
      customMetadata.putString(key, storageMetadata.getCustomMetadata(key));
    }

    metadata.putMap("customMetadata", customMetadata);

    return metadata;
  }

  /**
   * Check if we can write to storage, usually false if no permission set on manifest
   */
  private boolean isExternalStorageWritable() {
    boolean mExternalStorageAvailable;
    boolean mExternalStorageWritable;
    String state = Environment.getExternalStorageState();

    if (Environment.MEDIA_MOUNTED.equals(state)) {
      // we can read and write the media
      mExternalStorageAvailable = mExternalStorageWritable = true;
    } else if (Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
      // we can only read the media
      mExternalStorageAvailable = true;
      mExternalStorageWritable = false;
    } else {
      // something else is wrong. It may be one of many other states, but all we need
      // to know is we can neither read nor write
      mExternalStorageAvailable = mExternalStorageWritable = false;
    }

    return mExternalStorageAvailable && mExternalStorageWritable;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   */
  @ReactMethod
  public void delete(String appName, String path, final Promise promise) {
    StorageReference reference = getReference(path, appName);
    reference.delete().addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(null);
      } else {
        promiseRejectStorageException(promise, Objects.requireNonNull(task.getException()));
      }
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   */
  @ReactMethod
  public void getDownloadURL(String appName, final String path, final Promise promise) {
    StorageReference reference = getReference(path, appName);
    Task<Uri> downloadTask = reference.getDownloadUrl();

    downloadTask.addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(task.getResult() != null ? task.getResult().toString() : null);
      } else {
        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   */
  @ReactMethod
  public void getMetadata(String appName, String path, Promise promise) {
    StorageReference reference = getReference(path, appName);
    reference.getMetadata().addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(getMetadataAsMap(task.getResult()));
      } else {
        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   */
  @ReactMethod
  public void updateMetadata(
    String appName,
    String path,
    ReadableMap metadataMap,
    final Promise promise
  ) {
    StorageReference reference = this.getReference(path, appName);
    StorageMetadata metadata = buildMetadataFromMap(metadataMap, null);

    reference.updateMetadata(metadata).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        promise.resolve(getMetadataAsMap(task.getResult()));
      } else {
        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#downloadFile
   */
  @ReactMethod
  public void downloadFile(
    final String appName,
    final String path,
    final String localFilePath,
    final Promise promise
  ) {
    Log.d("RNFB_STORAGE_D", localFilePath);
    if (!isExternalStorageWritable()) {
      rejectPromiseWithCodeAndMessage(
        promise,
        "invalid-device-file-path",
        "The specified device file path is invalid or is restricted."
      );
      return;
    }

    StorageReference reference = getReference(path, appName);

    // TODO(salakar) add bucket support
    ReactNativeFirebaseStorageTask storageTask = new ReactNativeFirebaseStorageTask(
      reference, appName, ""
    );

    storageTask.startDownload(localFilePath).addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        WritableMap taskSnapshot = ReactNativeFirebaseStorageTask.getDownloadTaskAsMap(task.getResult());

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshot,
          ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_SUCCESS,
          appName,
          localFilePath
        ));

        // re-creating WritableMap as they can only be consumed once, so another one is required
        taskSnapshot = ReactNativeFirebaseStorageTask.getDownloadTaskAsMap(task.getResult());
        promise.resolve(taskSnapshot);
      } else {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          ReactNativeFirebaseStorageTask.getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          localFilePath
        ));

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          ReactNativeFirebaseStorageTask.getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_DOWNLOAD_FAILURE,
          appName,
          localFilePath
        ));

        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
   */
  @ReactMethod
  public void setMaxDownloadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxDownloadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  @ReactMethod
  public void setMaxOperationRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxOperationRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   */
  @ReactMethod
  public void setMaxUploadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxUploadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
   */
  @ReactMethod
  public void putFile(
    String appName,
    String path,
    String localFilePath,
    ReadableMap metadata,
    Promise promise
  ) {
    Log.d("RNFB_STORAGE_U", localFilePath);
    StorageReference reference = getReference(path, appName);

    // TODO(salakar) bucket support
    ReactNativeFirebaseStorageTask storageTask = new ReactNativeFirebaseStorageTask(
      reference,
      appName,
      ""
    );

    UploadTask uploadTask = storageTask.startUpload(localFilePath, metadata);

    uploadTask.addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        WritableMap taskSnapshotMap = ReactNativeFirebaseStorageTask.getUploadTaskAsMap(task.getResult());

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshotMap,
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          path
        ));

        // re-creating WritableMap as they can only be consumed once, so another one is required
        taskSnapshotMap = ReactNativeFirebaseStorageTask.getUploadTaskAsMap(task.getResult());
        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          taskSnapshotMap,
          ReactNativeFirebaseStorageEvent.EVENT_UPLOAD_SUCCESS,
          appName,
          path
        ));

        taskSnapshotMap = ReactNativeFirebaseStorageTask.getUploadTaskAsMap(task.getResult());
        promise.resolve(taskSnapshotMap);
      } else {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          ReactNativeFirebaseStorageTask.getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_STATE_CHANGED,
          appName,
          path
        ));

        emitter.sendEvent(new ReactNativeFirebaseStorageEvent(
          ReactNativeFirebaseStorageTask.getErrorTaskMap(),
          ReactNativeFirebaseStorageEvent.EVENT_UPLOAD_FAILURE,
          appName,
          path
        ));

        promiseRejectStorageException(promise, task.getException());
      }
    });
  }

  private StorageReference getReference(String path, String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);

    if (path.startsWith("url::")) {
      return firebaseStorage.getReferenceFromUrl(path.substring(5));
    } else {
      return firebaseStorage.getReference(path);
    }
  }

  private void promiseRejectStorageException(Promise promise, @Nullable Exception exception) {
    String code = "unknown";
    String message = "An unknown error has occurred.";

    if (exception != null) {
      message = exception.getMessage();
      if (exception instanceof StorageException) {
        StorageException storageException = (StorageException) exception;
        switch (storageException.getErrorCode()) {
          case StorageException.ERROR_OBJECT_NOT_FOUND:
            code = "object-not-found";
            message = "No object exists at the desired reference.";
            break;
          case StorageException.ERROR_BUCKET_NOT_FOUND:
            code = "bucket-not-found";
            message = "No bucket is configured for Firebase Storage.";
            break;
          case StorageException.ERROR_PROJECT_NOT_FOUND:
            code = "project-not-found";
            message = "No project is configured for Firebase Storage.";
            break;
          case StorageException.ERROR_QUOTA_EXCEEDED:
            code = "quota-exceeded";
            message = "Quota on your Firebase Storage bucket has been exceeded.";
            break;
          case StorageException.ERROR_NOT_AUTHENTICATED:
            code = "unauthenticated";
            message = "User is unauthenticated. Authenticate and try again.";
            break;
          case StorageException.ERROR_NOT_AUTHORIZED:
            code = "unauthorized";
            message = "User is not authorized to perform the desired action.";
            break;
          case StorageException.ERROR_RETRY_LIMIT_EXCEEDED:
            code = "retry-limit-exceeded";
            message = "The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.";
            break;
          case StorageException.ERROR_INVALID_CHECKSUM:
            code = "non-matching-checksum";
            message = "File on the client does not match the checksum of the file received by the server.";
            break;
          case StorageException.ERROR_CANCELED:
            code = "cancelled";
            message = "User cancelled the operation.";
            break;
        }
      }
    }

    rejectPromiseWithCodeAndMessage(promise, code, message);
  }

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    Context context = getReactApplicationContext();
    File externalDirectory = context.getExternalFilesDir(null);
    File externalStorageDirectory = Environment.getExternalStorageDirectory();
    String storagePublicDir = Environment
      .getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
      .getAbsolutePath();

    constants.put(DocumentDirectoryPath, context.getFilesDir().getAbsolutePath());
    constants.put(TemporaryDirectoryPath, context.getCacheDir().getAbsolutePath());
    constants.put(PicturesDirectoryPath, storagePublicDir);
    constants.put(CachesDirectoryPath, context.getCacheDir().getAbsolutePath());
    constants.put(FileTypeRegular, 0);
    constants.put(FileTypeDirectory, 1);

    if (externalStorageDirectory != null) {
      constants.put(ExternalStorageDirectoryPath, externalStorageDirectory.getAbsolutePath());
    }

    if (externalDirectory != null) {
      constants.put(ExternalDirectoryPath, externalDirectory.getAbsolutePath());
    }

    return constants;
  }
}
