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
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.buildMetadataFromMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getListResultAsMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getMetadataAsMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.isExternalStorageWritable;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.promiseRejectStorageException;

import android.content.Context;
import android.net.Uri;
import com.facebook.fbreact.specs.NativeRNFBTurboStorageSpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.ListResult;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import io.invertase.firebase.common.TaskExecutorService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import javax.annotation.Nullable;

public class NativeRNFBTurboStorage extends NativeRNFBTurboStorageSpec {
  private static HashMap<String, String> emulatorConfigs = new HashMap<>();

  private final TaskExecutorService executorService;

  public NativeRNFBTurboStorage(ReactApplicationContext reactContext) {
    super(reactContext);
    executorService = new TaskExecutorService("RNFBStorageModule");
  }

  @Override
  public void invalidate() {
    ReactNativeFirebaseStorageTask.destroyAllTasks();
    super.invalidate();
  }

  @Override
  protected Map<String, Object> getTypedExportedConstants() {
    Map<String, Object> constants = new HashMap<>();
    Context context = getReactApplicationContext();
    List<FirebaseApp> apps = FirebaseApp.getApps(context);
    if (apps.size() > 0) {
      FirebaseStorage defaultStorageInstance = FirebaseStorage.getInstance();
      constants.put("maxDownloadRetryTime", defaultStorageInstance.getMaxDownloadRetryTimeMillis());
      constants.put(
          "maxOperationRetryTime", defaultStorageInstance.getMaxOperationRetryTimeMillis());
      constants.put("maxUploadRetryTime", defaultStorageInstance.getMaxUploadRetryTimeMillis());
    } else {
      constants.put("maxDownloadRetryTime", 0);
      constants.put("maxOperationRetryTime", 0);
      constants.put("maxUploadRetryTime", 0);
    }
    return constants;
  }

  @Override
  public void deleteObject(String appName, String url, final Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      reference
          .delete()
          .addOnCompleteListener(
              task -> {
                if (task.isSuccessful()) {
                  promise.resolve(null);
                } else {
                  promiseRejectStorageException(
                      promise, Objects.requireNonNull(task.getException()));
                }
              });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void getDownloadURL(String appName, final String url, final Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      Task<Uri> downloadTask = reference.getDownloadUrl();

      downloadTask.addOnCompleteListener(
          task -> {
            if (task.isSuccessful()) {
              promise.resolve(task.getResult() != null ? task.getResult().toString() : null);
            } else {
              promiseRejectStorageException(promise, task.getException());
            }
          });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void getMetadata(String appName, String url, Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      reference
          .getMetadata()
          .addOnCompleteListener(
              getExecutor(),
              task -> {
                if (task.isSuccessful()) {
                  promise.resolve(getMetadataAsMap(task.getResult()));
                } else {
                  promiseRejectStorageException(promise, task.getException());
                }
              });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void list(String appName, String url, ReadableMap listOptions, Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      Task<ListResult> list;

      int maxResults = listOptions.getInt("maxResults");

      if (listOptions.hasKey("pageToken") && !listOptions.isNull("pageToken")) {
        String pageToken = listOptions.getString("pageToken");
        list = reference.list(maxResults, Objects.requireNonNull(pageToken));
      } else {
        list = reference.list(maxResults);
      }

      list.addOnCompleteListener(
          getExecutor(),
          task -> {
            if (task.isSuccessful()) {
              promise.resolve(getListResultAsMap(Objects.requireNonNull(task.getResult())));
            } else {
              promiseRejectStorageException(promise, task.getException());
            }
          });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void listAll(String appName, String url, Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      reference
          .listAll()
          .addOnCompleteListener(
              getExecutor(),
              task -> {
                if (task.isSuccessful()) {
                  promise.resolve(getListResultAsMap(Objects.requireNonNull(task.getResult())));
                } else {
                  promiseRejectStorageException(promise, task.getException());
                }
              });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void updateMetadata(
      String appName, String url, @Nullable ReadableMap metadataMap, final Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);

      reference
          .getMetadata()
          .addOnCompleteListener(
              getExecutor(),
              getTask -> {
                if (getTask.isSuccessful()) {
                  StorageMetadata metadata =
                      buildMetadataFromMap(metadataMap, null, getTask.getResult());

                  reference
                      .updateMetadata(metadata)
                      .addOnCompleteListener(
                          getExecutor(),
                          updateTask -> {
                            if (updateTask.isSuccessful()) {
                              promise.resolve(getMetadataAsMap(updateTask.getResult()));
                            } else {
                              promiseRejectStorageException(promise, updateTask.getException());
                            }
                          });

                } else {
                  promiseRejectStorageException(promise, getTask.getException());
                }
              });
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void setMaxDownloadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxDownloadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  @Override
  public void setMaxOperationRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxOperationRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  @Override
  public void setMaxUploadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxUploadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  @Override
  public void useEmulator(String appName, String host, double port, String bucketUrl) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp, bucketUrl);
    String emulatorKey = appName + ":" + bucketUrl;

    if (emulatorConfigs.get(emulatorKey) == null) {
      firebaseStorage.useEmulator(host, (int) port);
      emulatorConfigs.put(emulatorKey, "true");
    }
  }

  @Override
  public void writeToFile(
      String appName, String url, String localFilePath, double taskId, Promise promise) {
    if (!isExternalStorageWritable()) {
      rejectPromiseWithCodeAndMessage(
          promise,
          "invalid-device-file-path",
          "The specified device file path is invalid or is restricted.");
      return;
    }
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageDownloadTask storageTask =
          new ReactNativeFirebaseStorageDownloadTask((int) taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), localFilePath);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void putString(
      String appName,
      String url,
      String string,
      String format,
      @Nullable ReadableMap metadataMap,
      double taskId,
      Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageUploadTask storageTask =
          new ReactNativeFirebaseStorageUploadTask((int) taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), string, format, metadataMap);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public void putFile(
      String appName,
      String url,
      String localFilePath,
      @Nullable ReadableMap metadata,
      double taskId,
      Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageUploadTask storageTask =
          new ReactNativeFirebaseStorageUploadTask((int) taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), localFilePath, metadata);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @Override
  public boolean setTaskStatus(String appName, double taskId, double status) {
    switch ((int) status) {
      case 0:
        return ReactNativeFirebaseStorageTask.pauseTaskById((int) taskId);
      case 1:
        return ReactNativeFirebaseStorageTask.resumeTaskById((int) taskId);
      case 2:
        return ReactNativeFirebaseStorageTask.cancelTaskById((int) taskId);
      default:
        return false;
    }
  }

  private ExecutorService getExecutor() {
    return executorService.getExecutor();
  }

  private ExecutorService getTransactionalExecutor() {
    return executorService.getTransactionalExecutor();
  }

  private String getBucketFromUrl(String url) {
    String pathWithBucketName = url.substring(5);
    return url.substring(0, pathWithBucketName.indexOf("/") + 5);
  }

  private StorageReference getReferenceFromUrl(String url, String appName)
      throws IllegalArgumentException {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage =
        FirebaseStorage.getInstance(firebaseApp, getBucketFromUrl(url));
    return firebaseStorage.getReferenceFromUrl(url);
  }
}
