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

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.webkit.MimeTypeMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.storage.ListResult;
import com.google.firebase.storage.StorageException;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.StorageTask;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.common.SharedUtils;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import javax.annotation.Nullable;

class ReactNativeFirebaseStorageCommon {
  static final String STATUS_CANCELLED = "cancelled";
  static final String STATUS_ERROR = "error";
  private static final String KEY_CUSTOM_META = "customMetadata";
  private static final String KEY_CACHE_CONTROL = "cacheControl";
  private static final String KEY_CONTENT_ENCODING = "contentEncoding";
  private static final String KEY_CONTENT_LANG = "contentLanguage";
  private static final String KEY_CONTENT_DISPOSITION = "contentDisposition";
  private static final String KEY_CONTENT_TYPE = "contentType";
  private static final String KEY_BUCKET = "bucket";
  private static final String KEY_GENERATION = "generation";
  private static final String KEY_META_GENERATION = "metageneration";
  private static final String KEY_FULL_PATH = "fullPath";
  private static final String KEY_NAME = "name";
  private static final String KEY_SIZE = "size";
  private static final String KEY_TIME_CREATED = "timeCreated";
  private static final String KEY_UPDATED = "updated";
  private static final String KEY_MD5_HASH = "md5Hash";
  private static final String STATUS_UNKNOWN = "unknown";
  private static final String STATUS_RUNNING = "running";
  private static final String STATUS_PAUSED = "paused";
  private static final String STATUS_SUCCESS = "success";
  private static final String CODE_OBJECT_NOT_FOUND = "object-not-found";
  private static final String CODE_FILE_NOT_FOUND = "file-not-found";
  private static final String CODE_BUCKET_NOT_FOUND = "bucket-not-found";
  private static final String CODE_PROJECT_NOT_FOUND = "project-not-found";
  private static final String CODE_QUOTA_EXCEEDED = "quota-exceeded";
  private static final String CODE_UNAUTHENTICATED = "unauthenticated";
  private static final String CODE_UNAUTHORIZED = "unauthorized";
  private static final String CODE_RETRY_LIMIT_EXCEEDED = "retry-limit-exceeded";
  private static final String CODE_NON_MATCHING_CHECKSUM = "non-matching-checksum";
  static final String CODE_CANCELLED = "cancelled";

  /** Returns the task status as string */
  static String getTaskStatus(@Nullable StorageTask<?> task) {
    if (task == null) return STATUS_UNKNOWN;
    if (task.isInProgress()) {
      return STATUS_RUNNING;
    } else if (task.isPaused()) {
      return STATUS_PAUSED;
    } else if (task.isSuccessful() || task.isComplete()) {
      return STATUS_SUCCESS;
    } else if (task.isCanceled()) {
      return STATUS_CANCELLED;
    } else if (task.getException() != null) {
      return STATUS_ERROR;
    } else {
      return STATUS_UNKNOWN;
    }
  }

  /** Converts a RN ReadableMap into a StorageMetadata instance */
  static StorageMetadata buildMetadataFromMap(
      ReadableMap metadataMap, @Nullable Uri file, @Nullable StorageMetadata existingMetadata) {
    StorageMetadata.Builder metadataBuilder = new StorageMetadata.Builder();

    if (metadataMap != null) {
      if (metadataMap.hasKey(KEY_CUSTOM_META) || (existingMetadata != null)) {

        Map<String, Object> customMetadata = new HashMap<>();
        ReadableMap freshCustomMetadata = metadataMap.getMap(KEY_CUSTOM_META);
        Map<String, Object> existingCustomMetadata = new HashMap<>();

        // Our baseline will be any existing custom metadata if it exists
        if (existingMetadata != null) {
          for (String existingKey : existingMetadata.getCustomMetadataKeys()) {
            customMetadata.put(existingKey, existingMetadata.getCustomMetadata(existingKey));
            existingCustomMetadata.put(
                existingKey, existingMetadata.getCustomMetadata(existingKey));
          }
        }

        // Clobber with any fresh custom metadata if it exists
        if (freshCustomMetadata != null) {
          customMetadata.putAll(freshCustomMetadata.toHashMap());
        }

        for (Map.Entry<String, Object> entry : customMetadata.entrySet()) {
          metadataBuilder.setCustomMetadata(entry.getKey(), (String) entry.getValue());

          // API contract updates custom metadata as a group but android SDK has key granularity
          // So if freshCustomMetadata exists, for any key that in our merged map but not in
          // freshCustomMetadata, set to null to clear
          if (freshCustomMetadata == null || !freshCustomMetadata.hasKey(entry.getKey())) {
            metadataBuilder.setCustomMetadata(entry.getKey(), null);
          }
        }
      }

      if (metadataMap.hasKey(KEY_CACHE_CONTROL)) {
        metadataBuilder.setCacheControl(metadataMap.getString(KEY_CACHE_CONTROL));
      }

      if (metadataMap.hasKey(KEY_CONTENT_ENCODING)) {
        metadataBuilder.setContentEncoding(metadataMap.getString(KEY_CONTENT_ENCODING));
      }

      if (metadataMap.hasKey(KEY_CONTENT_LANG)) {
        metadataBuilder.setContentLanguage(metadataMap.getString(KEY_CONTENT_LANG));
      }

      if (metadataMap.hasKey(KEY_CONTENT_DISPOSITION)) {
        metadataBuilder.setContentDisposition(metadataMap.getString(KEY_CONTENT_DISPOSITION));
      }
    }

    if (metadataMap != null && metadataMap.hasKey(KEY_CONTENT_TYPE)) {
      metadataBuilder.setContentType(metadataMap.getString(KEY_CONTENT_TYPE));
    } else if (file != null) {
      String mimeType = null;
      String fileScheme = file.getScheme();

      if (fileScheme != null && fileScheme.equals(ContentResolver.SCHEME_CONTENT)) {
        Context context = ReactNativeFirebaseApp.getApplicationContext();
        mimeType = context.getContentResolver().getType(file);
      }

      if (mimeType == null) {
        String fileExt = MimeTypeMap.getFileExtensionFromUrl(file.toString());
        mimeType =
            MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExt.toLowerCase(Locale.ROOT));
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
    metadata.putString(KEY_BUCKET, storageMetadata.getBucket());
    metadata.putString(KEY_GENERATION, storageMetadata.getGeneration());
    metadata.putString(KEY_META_GENERATION, storageMetadata.getMetadataGeneration());
    metadata.putString(KEY_FULL_PATH, storageMetadata.getPath());
    metadata.putString(KEY_NAME, storageMetadata.getName());
    metadata.putDouble(KEY_SIZE, storageMetadata.getSizeBytes());
    metadata.putString(
        KEY_TIME_CREATED,
        SharedUtils.timestampToUTC(storageMetadata.getCreationTimeMillis() / 1000));
    metadata.putString(
        KEY_UPDATED, SharedUtils.timestampToUTC(storageMetadata.getUpdatedTimeMillis() / 1000));
    metadata.putString(KEY_MD5_HASH, storageMetadata.getMd5Hash());

    if (storageMetadata.getCacheControl() != null
        && storageMetadata.getCacheControl().length() > 0) {
      metadata.putString(KEY_CACHE_CONTROL, storageMetadata.getCacheControl());
    }

    if (storageMetadata.getContentLanguage() != null
        && storageMetadata.getContentLanguage().length() > 0) {
      metadata.putString(KEY_CONTENT_LANG, storageMetadata.getContentLanguage());
    }

    if (storageMetadata.getContentDisposition() != null
        && storageMetadata.getContentDisposition().length() > 0) {
      metadata.putString(KEY_CONTENT_DISPOSITION, storageMetadata.getContentDisposition());
    }
    if (storageMetadata.getContentEncoding() != null
        && storageMetadata.getContentEncoding().length() > 0) {
      metadata.putString(KEY_CONTENT_ENCODING, storageMetadata.getContentEncoding());
    }
    if (storageMetadata.getContentType() != null && storageMetadata.getContentType().length() > 0) {
      metadata.putString(KEY_CONTENT_TYPE, storageMetadata.getContentType());
    }

    if (storageMetadata.getCustomMetadataKeys().size() > 0) {
      WritableMap customMetadata = Arguments.createMap();
      for (String key : storageMetadata.getCustomMetadataKeys()) {
        customMetadata.putString(key, storageMetadata.getCustomMetadata(key));
      }
      metadata.putMap(KEY_CUSTOM_META, customMetadata);
    }

    return metadata;
  }

  static WritableMap getListResultAsMap(ListResult listResult) {
    WritableMap map = Arguments.createMap();
    map.putString("nextPageToken", listResult.getPageToken());

    WritableArray items = Arguments.createArray();
    WritableArray prefixes = Arguments.createArray();

    for (StorageReference reference : listResult.getItems()) {
      items.pushString(reference.getPath());
    }

    for (StorageReference reference : listResult.getPrefixes()) {
      prefixes.pushString(reference.getPath());
    }

    map.putArray("items", items);
    map.putArray("prefixes", prefixes);

    return map;
  }

  static String[] getExceptionCodeAndMessage(@Nullable Exception exception) {
    String code = STATUS_UNKNOWN;
    String message = "An unknown error has occurred.";

    if (exception != null) {
      message = exception.getMessage();
      if (exception instanceof StorageException) {
        StorageException storageException = (StorageException) exception;
        Throwable throwable = storageException.getCause();
        switch (storageException.getErrorCode()) {
          case StorageException.ERROR_OBJECT_NOT_FOUND:
            code = CODE_OBJECT_NOT_FOUND;
            message = "No object exists at the desired reference.";
            break;
          case StorageException.ERROR_BUCKET_NOT_FOUND:
            code = CODE_BUCKET_NOT_FOUND;
            message = "No bucket is configured for Firebase Storage.";
            break;
          case StorageException.ERROR_PROJECT_NOT_FOUND:
            code = CODE_PROJECT_NOT_FOUND;
            message = "No project is configured for Firebase Storage.";
            break;
          case StorageException.ERROR_QUOTA_EXCEEDED:
            code = CODE_QUOTA_EXCEEDED;
            message = "Quota on your Firebase Storage bucket has been exceeded.";
            break;
          case StorageException.ERROR_NOT_AUTHENTICATED:
            code = CODE_UNAUTHENTICATED;
            message = "User is unauthenticated. Authenticate and try again.";
            break;
          case StorageException.ERROR_NOT_AUTHORIZED:
            code = CODE_UNAUTHORIZED;
            message = "User is not authorized to perform the desired action.";
            break;
          case StorageException.ERROR_RETRY_LIMIT_EXCEEDED:
            code = CODE_RETRY_LIMIT_EXCEEDED;
            message =
                "The maximum time limit on an operation (upload, download, delete, etc.) has been"
                    + " exceeded.";
            break;
          case StorageException.ERROR_INVALID_CHECKSUM:
            code = CODE_NON_MATCHING_CHECKSUM;
            message =
                "File on the client does not match the checksum of the file received by the"
                    + " server.";
            break;
          case StorageException.ERROR_CANCELED:
            code = CODE_CANCELLED;
            message = "User cancelled the operation.";
            break;
        }

        if (code.equals(STATUS_UNKNOWN) && throwable != null) {
          if (throwable.getMessage().contains("No such file or directory")) {
            code = CODE_FILE_NOT_FOUND;
            message = "The local file specified does not exist on the device.";
          } else if (throwable.getMessage().contains("Not Found.  Could not get object")) {
            code = CODE_OBJECT_NOT_FOUND;
            message = "No object exists at the desired reference.";
          } else {
            message = throwable.getMessage();
          }
        }
      }
    }

    return new String[] {code, message};
  }

  static void promiseRejectStorageException(Promise promise, @Nullable Exception exception) {
    String[] codeAndMessage = getExceptionCodeAndMessage(exception);
    rejectPromiseWithCodeAndMessage(promise, codeAndMessage[0], codeAndMessage[1]);
  }

  /** Check if we can write to storage, usually false if no permission set on manifest */
  static boolean isExternalStorageWritable() {
    boolean mExternalStorageAvailable;
    boolean mExternalStorageWritable;
    String state = Environment.getExternalStorageState();

    if (Environment.MEDIA_MOUNTED.equals(state)) {
      // we can read and write to the media
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
}
