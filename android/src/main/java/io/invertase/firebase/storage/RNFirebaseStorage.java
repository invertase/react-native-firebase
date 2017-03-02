package io.invertase.firebase.storage;

import android.util.Log;
import android.os.Environment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.HashMap;

import android.net.Uri;
import android.database.Cursor;
import android.provider.MediaStore;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.storage.StorageException;
import com.google.firebase.storage.StorageTask;
import com.google.firebase.storage.StreamDownloadTask;
import com.google.firebase.storage.UploadTask;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageMetadata;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.OnPausedListener;
import com.google.firebase.storage.OnProgressListener;

import io.invertase.firebase.Utils;


@SuppressWarnings("WeakerAccess")
public class RNFirebaseStorage extends ReactContextBaseJavaModule {

  private static final String TAG = "RNFirebaseStorage";
  private static final String DocumentDirectoryPath = "DOCUMENT_DIRECTORY_PATH";
  private static final String ExternalDirectoryPath = "EXTERNAL_DIRECTORY_PATH";
  private static final String ExternalStorageDirectoryPath = "EXTERNAL_STORAGE_DIRECTORY_PATH";
  private static final String PicturesDirectoryPath = "PICTURES_DIRECTORY_PATH";
  private static final String TemporaryDirectoryPath = "TEMPORARY_DIRECTORY_PATH";
  private static final String CachesDirectoryPath = "CACHES_DIRECTORY_PATH";
  private static final String DocumentDirectory = "DOCUMENT_DIRECTORY_PATH";

  private static final String FileTypeRegular = "FILETYPE_REGULAR";
  private static final String FileTypeDirectory = "FILETYPE_DIRECTORY";

  private static final String STORAGE_EVENT = "storage_event";
  private static final String STORAGE_ERROR = "storage_error";
  private static final String STORAGE_STATE_CHANGED = "state_changed";
  private static final String STORAGE_UPLOAD_SUCCESS = "upload_success";
  private static final String STORAGE_UPLOAD_FAILURE = "upload_failure";
  private static final String STORAGE_DOWNLOAD_SUCCESS = "download_success";
  private static final String STORAGE_DOWNLOAD_FAILURE = "download_failure";

  private ReactContext mReactContext;

  public RNFirebaseStorage(ReactApplicationContext reactContext) {
    super(reactContext);

    Log.d(TAG, "New instance");
  }

  @Override
  public String getName() {
    return TAG;
  }


  public boolean isExternalStorageWritable() {
    String state = Environment.getExternalStorageState();
    return Environment.MEDIA_MOUNTED.equals(state);
  }

  @ReactMethod
  public void delete(final String path,
                     final Callback callback) {
    StorageReference reference = this.getReference(path);
    reference.delete().addOnSuccessListener(new OnSuccessListener<Void>() {
      @Override
      public void onSuccess(Void aVoid) {
        WritableMap data = Arguments.createMap();
        data.putString("success", "success");
        data.putString("path", path);
        callback.invoke(null, data);
      }
    }).addOnFailureListener(new OnFailureListener() {
      @Override
      public void onFailure(Exception exception) {
        callback.invoke(makeErrorPayload(1, exception));
      }
    });
  }

  @ReactMethod
  public void getDownloadURL(final String path,
                             final Callback callback) {
    Log.d(TAG, "Download url for remote path: " + path);
    final StorageReference reference = this.getReference(path);

    Task<Uri> downloadTask = reference.getDownloadUrl();
    downloadTask
      .addOnSuccessListener(new OnSuccessListener<Uri>() {
        @Override
        public void onSuccess(Uri uri) {
          callback.invoke(null, uri.toString());
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          callback.invoke(makeErrorPayload(1, exception));
        }
      });
  }

  @ReactMethod
  public void getMetadata(final String path,
                          final Callback callback) {
    StorageReference reference = this.getReference(path);
    reference.getMetadata().addOnSuccessListener(new OnSuccessListener<StorageMetadata>() {
      @Override
      public void onSuccess(StorageMetadata storageMetadata) {
        WritableMap data = getMetadataAsMap(storageMetadata);
        callback.invoke(null, data);
      }
    }).addOnFailureListener(new OnFailureListener() {
      @Override
      public void onFailure(Exception exception) {
        callback.invoke(makeErrorPayload(1, exception));
      }
    });
  }

  @ReactMethod
  public void updateMetadata(final String path,
                             final ReadableMap metadata,
                             final Callback callback) {
    StorageReference reference = this.getReference(path);
    StorageMetadata md = buildMetadataFromMap(metadata);
    reference.updateMetadata(md).addOnSuccessListener(new OnSuccessListener<StorageMetadata>() {
      @Override
      public void onSuccess(StorageMetadata storageMetadata) {
        WritableMap data = getMetadataAsMap(storageMetadata);
        callback.invoke(null, data);
      }
    }).addOnFailureListener(new OnFailureListener() {
      @Override
      public void onFailure(Exception exception) {
        callback.invoke(makeErrorPayload(1, exception));
      }
    });
  }

  @ReactMethod
  public void downloadFile(final String path,
                           final String localPath,
                           final Callback callback) {
    if (!isExternalStorageWritable()) {
      Log.w(TAG, "downloadFile failed: external storage not writable");
      WritableMap error = Arguments.createMap();
      final int errorCode = 1;
      error.putDouble("code", errorCode);
      error.putString("description", "downloadFile failed: external storage not writable");
      callback.invoke(error);
      return;
    }
    Log.d(TAG, "downloadFile from remote path: " + path);

    StorageReference reference = this.getReference(path);

    reference.getStream(new StreamDownloadTask.StreamProcessor() {
      @Override
      public void doInBackground(StreamDownloadTask.TaskSnapshot taskSnapshot, InputStream inputStream) throws IOException {
        int indexOfLastSlash = localPath.lastIndexOf("/");
        String pathMinusFileName = indexOfLastSlash > 0 ? localPath.substring(0, indexOfLastSlash) + "/" : "/";
        String filename = indexOfLastSlash > 0 ? localPath.substring(indexOfLastSlash + 1) : localPath;
        File fileWithJustPath = new File(pathMinusFileName);
        fileWithJustPath.mkdirs();
        File fileWithFullPath = new File(pathMinusFileName, filename);
        FileOutputStream output = new FileOutputStream(fileWithFullPath);
        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];
        int len = 0;
        while ((len = inputStream.read(buffer)) != -1) {
          output.write(buffer, 0, len);
        }
        output.close();
      }
    }).addOnProgressListener(new OnProgressListener<StreamDownloadTask.TaskSnapshot>() {
      @Override
      public void onProgress(StreamDownloadTask.TaskSnapshot taskSnapshot) {
        Log.d(TAG, "Got download progress " + taskSnapshot);
        WritableMap event = getDownloadTaskAsMap(taskSnapshot);
        handleStorageEvent(STORAGE_STATE_CHANGED, path, event);
      }
    }).addOnPausedListener(new OnPausedListener<StreamDownloadTask.TaskSnapshot>() {
      @Override
      public void onPaused(StreamDownloadTask.TaskSnapshot taskSnapshot) {
        Log.d(TAG, "Download is paused " + taskSnapshot);
        WritableMap event = getDownloadTaskAsMap(taskSnapshot);
        handleStorageEvent(STORAGE_STATE_CHANGED, path, event);
      }
    }).addOnSuccessListener(new OnSuccessListener<StreamDownloadTask.TaskSnapshot>() {
      @Override
      public void onSuccess(StreamDownloadTask.TaskSnapshot taskSnapshot) {
        Log.d(TAG, "Successfully downloaded file " + taskSnapshot);
        WritableMap resp = getDownloadTaskAsMap(taskSnapshot);
        handleStorageEvent(STORAGE_DOWNLOAD_SUCCESS, path, resp);
        //TODO: A little hacky, but otherwise throws a not consumed exception
        resp = getDownloadTaskAsMap(taskSnapshot);
        callback.invoke(null, resp);
      }
    }).addOnFailureListener(new OnFailureListener() {
      @Override
      public void onFailure(@NonNull Exception exception) {
        Log.e(TAG, "Failed to download file " + exception.getMessage());
        //TODO: JS Error event
        callback.invoke(makeErrorPayload(1, exception));
      }
    });
  }

  @ReactMethod
  public void putFile(final String path, final String localPath, final ReadableMap metadata, final Callback callback) {
    StorageReference reference = this.getReference(path);

    Log.i(TAG, "Upload file: " + localPath + " to " + path);

    try {
      Uri file;
      if (localPath.startsWith("content://")) {
        String realPath = getRealPathFromURI(localPath);
        file = Uri.fromFile(new File(realPath));
      } else {
        file = Uri.fromFile(new File(localPath));
      }

      StorageMetadata md = buildMetadataFromMap(metadata);
      UploadTask uploadTask = reference.putFile(file, md);

      // register observers to listen for when the download is done or if it fails
      uploadTask
        .addOnFailureListener(new OnFailureListener() {
          @Override
          public void onFailure(@NonNull Exception exception) {
            // handle unsuccessful uploads
            Log.e(TAG, "Failed to upload file " + exception.getMessage());
            //TODO: JS Error event
            callback.invoke(makeErrorPayload(1, exception));
          }
        })
        .addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
          @Override
          public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
            Log.d(TAG, "Successfully uploaded file " + taskSnapshot);
            WritableMap resp = getUploadTaskAsMap(taskSnapshot);
            handleStorageEvent(STORAGE_UPLOAD_SUCCESS, path, resp);
            //TODO: A little hacky, but otherwise throws a not consumed exception
            resp = getUploadTaskAsMap(taskSnapshot);
            callback.invoke(null, resp);
          }
        })
        .addOnProgressListener(new OnProgressListener<UploadTask.TaskSnapshot>() {
          @Override
          public void onProgress(UploadTask.TaskSnapshot taskSnapshot) {
            Log.d(TAG, "Got upload progress " + taskSnapshot);
            WritableMap event = getUploadTaskAsMap(taskSnapshot);
            handleStorageEvent(STORAGE_STATE_CHANGED, path, event);
          }
        })
        .addOnPausedListener(new OnPausedListener<UploadTask.TaskSnapshot>() {
          @Override
          public void onPaused(UploadTask.TaskSnapshot taskSnapshot) {
            Log.d(TAG, "Upload is paused " + taskSnapshot);
            WritableMap event = getUploadTaskAsMap(taskSnapshot);
            handleStorageEvent(STORAGE_STATE_CHANGED, path, event);
          }
        });
    } catch (Exception ex) {
      final int errorCode = 2;
      callback.invoke(makeErrorPayload(errorCode, ex));
    }
  }

  //Firebase.Storage methods
  @ReactMethod
  public void setMaxDownloadRetryTime(final double milliseconds) {
    FirebaseStorage.getInstance().setMaxDownloadRetryTimeMillis((long) milliseconds);
  }

  @ReactMethod
  public void setMaxOperationRetryTime(final double milliseconds) {
    FirebaseStorage.getInstance().setMaxOperationRetryTimeMillis((long) milliseconds);
  }

  @ReactMethod
  public void setMaxUploadRetryTime(final double milliseconds) {
    FirebaseStorage.getInstance().setMaxUploadRetryTimeMillis((long) milliseconds);
  }

  private StorageReference getReference(String path) {
    if (path.startsWith("url::")) {
      String url = path.substring(5);
      return FirebaseStorage.getInstance().getReferenceFromUrl(url);
    } else {
      return FirebaseStorage.getInstance().getReference(path);
    }
  }

  private StorageMetadata buildMetadataFromMap(ReadableMap metadata) {
    StorageMetadata.Builder metadataBuilder = new StorageMetadata.Builder();
    Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(metadata);

    for (Map.Entry<String, Object> entry : m.entrySet()) {
      metadataBuilder.setCustomMetadata(entry.getKey(), entry.getValue().toString());
    }

    return metadataBuilder.build();
  }

  private WritableMap getMetadataAsMap(StorageMetadata storageMetadata) {
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

    WritableArray downloadURLs = Arguments.createArray();
    for (Uri uri : storageMetadata.getDownloadUrls()) {
      downloadURLs.pushString(uri.getPath());
    }
    metadata.putArray("downloadURLs", downloadURLs);

    WritableMap customMetadata = Arguments.createMap();
    for (String key : storageMetadata.getCustomMetadataKeys()) {
      customMetadata.putString(key, storageMetadata.getCustomMetadata(key));
    }
    metadata.putMap("customMetadata", customMetadata);

    return metadata;
  }

  private String getRealPathFromURI(final String uri) {
    Cursor cursor = null;
    try {
      String[] proj = {MediaStore.Images.Media.DATA};
      cursor = getReactApplicationContext().getContentResolver().query(Uri.parse(uri), proj, null, null, null);
      int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
      cursor.moveToFirst();
      return cursor.getString(column_index);
    } finally {
      if (cursor != null) {
        cursor.close();
      }
    }
  }

  private WritableMap getDownloadTaskAsMap(final StreamDownloadTask.TaskSnapshot taskSnapshot) {
    WritableMap resp = Arguments.createMap();
    resp.putDouble("bytesTransferred", taskSnapshot.getBytesTransferred());
    resp.putString("ref", taskSnapshot.getStorage().getPath());
    resp.putString("state", this.getTaskStatus(taskSnapshot.getTask()));
    resp.putDouble("totalBytes", taskSnapshot.getTotalByteCount());

    return resp;
  }

  private WritableMap getUploadTaskAsMap(final UploadTask.TaskSnapshot taskSnapshot) {
    StorageMetadata d = taskSnapshot.getMetadata();

    WritableMap resp = Arguments.createMap();
    resp.putDouble("bytesTransferred", taskSnapshot.getBytesTransferred());
    resp.putString("downloadUrl", taskSnapshot.getDownloadUrl() != null ? taskSnapshot.getDownloadUrl().toString() : null);
    resp.putString("ref", taskSnapshot.getStorage().getPath());
    resp.putString("state", this.getTaskStatus(taskSnapshot.getTask()));
    resp.putDouble("totalBytes", taskSnapshot.getTotalByteCount());

    if (taskSnapshot.getMetadata() != null) {
      WritableMap metadata = getMetadataAsMap(taskSnapshot.getMetadata());
      resp.putMap("metadata", metadata);
    }

    return resp;
  }

  private String getTaskStatus(StorageTask<?> task) {
    if (task.isInProgress()) {
      return "RUNNING";
    } else if (task.isPaused()) {
      return "PAUSED";
    } else if (task.isSuccessful() || task.isComplete()) {
      return "SUCCESS";
    } else if (task.isCanceled()) {
      return "CANCELLED";
    } else if (task.getException() != null) {
      return "ERROR";
    } else {
      return "UNKNOWN";
    }
  }

  private void handleStorageEvent(final String name, final String path, WritableMap body) {
    WritableMap evt = Arguments.createMap();
    evt.putString("eventName", name);
    evt.putString("path", path);
    evt.putMap("body", body);

    Utils.sendEvent(this.getReactApplicationContext(), STORAGE_EVENT, evt);
  }

  private void handleStorageError(final String path, final StorageException error) {
    WritableMap body = Arguments.createMap();
    body.putString("path", path);
    body.putString("message", error.getMessage());

    WritableMap evt = Arguments.createMap();
    evt.putString("eventName", STORAGE_ERROR);
    evt.putMap("body", body);

    Utils.sendEvent(this.getReactApplicationContext(), STORAGE_ERROR, evt);
  }

  private WritableMap makeErrorPayload(double code, Exception ex) {
    WritableMap error = Arguments.createMap();
    error.putDouble("code", code);
    error.putString("message", ex.getMessage());
    return error;
  }


  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();

    constants.put(DocumentDirectory, 0);
    constants.put(DocumentDirectoryPath, this.getReactApplicationContext().getFilesDir().getAbsolutePath());
    constants.put(TemporaryDirectoryPath, null);
    constants.put(PicturesDirectoryPath, Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsolutePath());
    constants.put(CachesDirectoryPath, this.getReactApplicationContext().getCacheDir().getAbsolutePath());
    constants.put(FileTypeRegular, 0);
    constants.put(FileTypeDirectory, 1);

    File externalStorageDirectory = Environment.getExternalStorageDirectory();
    if (externalStorageDirectory != null) {
      constants.put(ExternalStorageDirectoryPath, externalStorageDirectory.getAbsolutePath());
    } else {
      constants.put(ExternalStorageDirectoryPath, null);
    }

    File externalDirectory = this.getReactApplicationContext().getExternalFilesDir(null);
    if (externalDirectory != null) {
      constants.put(ExternalDirectoryPath, externalDirectory.getAbsolutePath());
    } else {
      constants.put(ExternalDirectoryPath, null);
    }

    return constants;
  }
}
