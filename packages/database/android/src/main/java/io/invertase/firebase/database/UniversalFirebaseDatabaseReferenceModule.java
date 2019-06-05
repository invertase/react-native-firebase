package io.invertase.firebase.database;

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


import android.content.Context;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.database.DatabaseReference;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.Map;

import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

public class UniversalFirebaseDatabaseReferenceModule extends UniversalFirebaseModule {

  UniversalFirebaseDatabaseReferenceModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Void> set(String appName, String dbURL, String path, Object value) {
    TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();
    DatabaseReference reference = getDatabaseForApp(appName, dbURL).getReference(path);

    reference.setValue(value, (databaseError, databaseReference) -> {
      if (databaseError != null) {
        taskCompletionSource.setException(
          new UniversalDatabaseException(databaseError.getCode(), databaseError.getMessage(), databaseError.toException())
        );
      } else {
        taskCompletionSource.setResult(null);
      }
    });

    return taskCompletionSource.getTask();
  }

  Task<Void> update(String appName, String dbURL, String path, Map<String, Object> value) {
    TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();
    DatabaseReference reference = getDatabaseForApp(appName, dbURL).getReference(path);

    reference.updateChildren(value, (databaseError, databaseReference) -> {
      if (databaseError != null) {
        taskCompletionSource.setException(
          new UniversalDatabaseException(databaseError.getCode(), databaseError.getMessage(), databaseError.toException())
        );
      } else {
        taskCompletionSource.setResult(null);
      }
    });

    return taskCompletionSource.getTask();
  }

  Task<Void> setWithPriority(String appName, String dbURL, String path, Object value, Object priority) {
    TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();
    DatabaseReference reference = getDatabaseForApp(appName, dbURL).getReference(path);

    reference.setValue(value, priority, (databaseError, databaseReference) -> {
      if (databaseError != null) {
        taskCompletionSource.setException(
          new UniversalDatabaseException(databaseError.getCode(), databaseError.getMessage(), databaseError.toException())
        );
      } else {
        taskCompletionSource.setResult(null);
      }
    });

    return taskCompletionSource.getTask();
  }

  Task<Void> remove(String appName, String dbURL, String path) {
    TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();
    DatabaseReference reference = getDatabaseForApp(appName, dbURL).getReference(path);

    reference.removeValue((databaseError, databaseReference) -> {
      if (databaseError != null) {
        taskCompletionSource.setException(
          new UniversalDatabaseException(databaseError.getCode(), databaseError.getMessage(), databaseError.toException())
        );
      } else {
        taskCompletionSource.setResult(null);
      }
    });

    return taskCompletionSource.getTask();
  }

  Task<Void> setPriority(String appName, String dbURL, String path, Object priority) {
    TaskCompletionSource<Void> taskCompletionSource = new TaskCompletionSource<>();
    DatabaseReference reference = getDatabaseForApp(appName, dbURL).getReference(path);

    reference.setPriority(priority, (databaseError, databaseReference) -> {
      if (databaseError != null) {
        taskCompletionSource.setException(
          new UniversalDatabaseException(databaseError.getCode(), databaseError.getMessage(), databaseError.toException())
        );
      } else {
        taskCompletionSource.setResult(null);
      }
    });

    return taskCompletionSource.getTask();
  }
}
