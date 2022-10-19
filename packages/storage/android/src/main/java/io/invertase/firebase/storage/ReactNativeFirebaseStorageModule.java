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

import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.buildMetadataFromMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getListResultAsMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.getMetadataAsMap;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.isExternalStorageWritable;
import static io.invertase.firebase.storage.ReactNativeFirebaseStorageCommon.promiseRejectStorageException;

import android.content.Context;
import android.net.Uri;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.ListResult;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ReactNativeFirebaseStorageModule extends ReactNativeFirebaseModule {
  private static final String TAG = "Storage";

  private static HashMap<String, String> emulatorConfigs = new HashMap<>();

  ReactNativeFirebaseStorageModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    ReactNativeFirebaseStorageTask.destroyAllTasks();
    super.onCatalystInstanceDestroy();
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   */
  @ReactMethod
  public void delete(String appName, String url, final Promise promise) {
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

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   */
  @ReactMethod
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

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   */
  @ReactMethod
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

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#list
   */
  @ReactMethod
  public void list(String appName, String url, ReadableMap listOptions, Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      Task<ListResult> list;

      int maxResults = listOptions.getInt("maxResults");

      if (listOptions.hasKey("pageToken")) {
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

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#listAll
   */
  @ReactMethod
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

  // Useful for development / debugging
  private void dumpMetadata(StorageMetadata metadata) {
    System.err.println("STORAGE dumping metadata contents");
    System.err.println("STORAGE - cacheControl " + metadata.getCacheControl());
    System.err.println("STORAGE - contentDisposition " + metadata.getContentDisposition());
    System.err.println("STORAGE - contentEncoding " + metadata.getContentEncoding());
    System.err.println("STORAGE - contentLanguage " + metadata.getContentLanguage());
    System.err.println("STORAGE - contentType " + metadata.getContentType());
    for (String customKey : metadata.getCustomMetadataKeys()) {
      System.err.println(
          "STORAGE - customMetadata: '"
              + customKey
              + "' / '"
              + metadata.getCustomMetadata(customKey)
              + "'");
    }
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   */
  @ReactMethod
  public void updateMetadata(
      String appName, String url, ReadableMap metadataMap, final Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);

      reference
          .getMetadata()
          .addOnCompleteListener(
              getExecutor(),
              getTask -> {
                if (getTask.isSuccessful()) {

                  // dumpMetadata(getTask.getResult());
                  StorageMetadata metadata =
                      buildMetadataFromMap(metadataMap, null, getTask.getResult());
                  // dumpMetadata(metadata);

                  reference
                      .updateMetadata(metadata)
                      .addOnCompleteListener(
                          getExecutor(),
                          updateTask -> {
                            if (updateTask.isSuccessful()) {
                              // dumpMetadata(updateTask.getResult());
                              promise.resolve(getMetadataAsMap(updateTask.getResult()));
                            } else {
                              updateTask.getException().printStackTrace();
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

  /**
   * @link
   *     https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxDownloadRetryTime
   */
  @ReactMethod
  public void setMaxDownloadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxDownloadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @link
   *     https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxOperationRetryTime
   */
  @ReactMethod
  public void setMaxOperationRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxOperationRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @link
   *     https://firebase.google.com/docs/reference/js/firebase.storage.Storage#setMaxUploadRetryTime
   */
  @ReactMethod
  public void setMaxUploadRetryTime(String appName, double milliseconds, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    firebaseStorage.setMaxUploadRetryTimeMillis((long) milliseconds);
    promise.resolve(null);
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Storage#useEmulator
   */
  @ReactMethod
  public void useEmulator(String appName, String host, int port, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseStorage firebaseStorage = FirebaseStorage.getInstance(firebaseApp);
    if (emulatorConfigs.get(appName) == null) {
      firebaseStorage.useEmulator(host, port);
      emulatorConfigs.put(appName, "true");
    }
    promise.resolve(null);
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#writeToFile
   */
  @ReactMethod
  public void writeToFile(
      String appName, String url, String localFilePath, int taskId, Promise promise) {
    // TODO(salakar) only need to check this if using external storage?
    if (!isExternalStorageWritable()) {
      // TODO(salakar) send failure event
      rejectPromiseWithCodeAndMessage(
          promise,
          "invalid-device-file-path",
          "The specified device file path is invalid or is restricted.");
      return;
    }
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageDownloadTask storageTask =
          new ReactNativeFirebaseStorageDownloadTask(taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), localFilePath);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putString
   */
  @ReactMethod
  public void putString(
      String appName,
      String url,
      String string,
      String format,
      ReadableMap metadataMap,
      int taskId,
      Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageUploadTask storageTask =
          new ReactNativeFirebaseStorageUploadTask(taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), string, format, metadataMap);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  /**
   * @link https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putFile
   */
  @ReactMethod
  public void putFile(
      String appName,
      String url,
      String localFilePath,
      ReadableMap metadata,
      int taskId,
      Promise promise) {
    try {
      StorageReference reference = getReferenceFromUrl(url, appName);
      ReactNativeFirebaseStorageUploadTask storageTask =
          new ReactNativeFirebaseStorageUploadTask(taskId, reference, appName);
      storageTask.begin(getTransactionalExecutor(), localFilePath, metadata);
      storageTask.addOnCompleteListener(getTransactionalExecutor(), promise);
    } catch (Exception e) {
      promiseRejectStorageException(promise, e);
    }
  }

  @ReactMethod
  public void setTaskStatus(String appName, int taskId, int status, Promise promise) {
    switch (status) {
      case 0:
        promise.resolve(ReactNativeFirebaseStorageTask.pauseTaskById(taskId));
        break;
      case 1:
        promise.resolve(ReactNativeFirebaseStorageTask.resumeTaskById(taskId));
        break;
      case 2:
        promise.resolve(ReactNativeFirebaseStorageTask.cancelTaskById(taskId));
        break;
    }
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

  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();

    Context context = getReactApplicationContext();

    // a 'safe' way of checking if any apps have been initialized
    List<FirebaseApp> apps = FirebaseApp.getApps(context);
    if (apps.size() > 0) {
      FirebaseStorage defaultStorageInstance = FirebaseStorage.getInstance();
      constants.put("maxDownloadRetryTime", defaultStorageInstance.getMaxDownloadRetryTimeMillis());
      constants.put(
          "maxOperationRetryTime", defaultStorageInstance.getMaxOperationRetryTimeMillis());
      constants.put("maxUploadRetryTime", defaultStorageInstance.getMaxUploadRetryTimeMillis());
    }

    return constants;
  }
}
