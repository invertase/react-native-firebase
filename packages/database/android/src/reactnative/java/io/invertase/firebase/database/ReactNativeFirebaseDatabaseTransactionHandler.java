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


import com.facebook.react.bridge.*;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.MutableData;

import javax.annotation.Nullable;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

import static io.invertase.firebase.common.RCTConvertFirebase.mapPutValue;
import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.castValue;
import static io.invertase.firebase.database.ReactNativeFirebaseDatabaseCommon.snapshotToMap;

public class ReactNativeFirebaseDatabaseTransactionHandler {
  private final ReentrantLock lock;
  private final Condition condition;
  public Object value;
  boolean interrupted;
  boolean abort = false;
  boolean timeout = false;
  private int transactionId;
  private String appName;
  private String dbURL;
  private Map<String, Object> data;
  private boolean signalled;

  ReactNativeFirebaseDatabaseTransactionHandler(int id, String app, String url) {
    appName = app;
    dbURL = url;
    transactionId = id;
    lock = new ReentrantLock();
    condition = lock.newCondition();
  }

  /**
   * Signal that the transaction data has been received
   *
   * @param updates
   */
  void signalUpdateReceived(ReadableMap updates) {
    Map<String, Object> updateData = toHashMap(updates);

    lock.lock();
    value = updateData.get("value");
    abort = (Boolean) updateData.get("abort");

    try {
      if (signalled) {
        throw new IllegalStateException("This transactionUpdateHandler has already been signalled.");
      }

      signalled = true;
      data = updateData;
      condition.signalAll();
    } catch (Exception e) {
      // do nothing
    } finally {
      lock.unlock();
    }
  }

  /**
   * Wait for signalUpdateReceived to signal condition
   */
  void await() throws InterruptedException {
    lock.lock();
    signalled = false;

    long timeoutExpired = System.currentTimeMillis() + 5000;

    try {
      while (!timeout && !condition.await(250, TimeUnit.MILLISECONDS) && !signalled) {
        if (!signalled && System.currentTimeMillis() > timeoutExpired) {
          timeout = true;
        }
      }
    } finally {
      lock.unlock();
    }
  }

  /**
   * Get the
   *
   * @return
   */
  Map<String, Object> getUpdates() {
    return data;
  }

  /**
   * Create a RN map of transaction mutable data for sending to js
   *
   * @param updatesData
   * @return
   */
  WritableMap createUpdateMap(MutableData updatesData) {
    final WritableMap updatesMap = Arguments.createMap();

    updatesMap.putString("type", "update");

    if (!updatesData.hasChildren()) {
      mapPutValue("value", updatesData.getValue(), updatesMap);
    } else {
      Object value = castValue(updatesData);

      if (value instanceof WritableNativeArray) {
        updatesMap.putArray("value", (WritableArray) value);
      } else {
        updatesMap.putMap("value", (WritableMap) value);
      }
    }

    return updatesMap;
  }


  WritableMap createResultMap(
    @Nullable DatabaseError error,
    boolean committed,
    DataSnapshot snapshot
  ) {
    WritableMap resultMap = Arguments.createMap();

    resultMap.putBoolean("timeout", timeout);
    resultMap.putBoolean("committed", committed);
    resultMap.putBoolean("interrupted", interrupted);

    if (error != null || timeout || interrupted) {
      resultMap.putString("type", "error");
      if (error != null) {
        UniversalDatabaseException databaseException = new UniversalDatabaseException(
          error.getCode(),
          error.getMessage(),
          error.toException()
        );

        WritableMap errorMap = Arguments.createMap();
        errorMap.putString("code", databaseException.getCode());
        errorMap.putString("message", databaseException.getMessage());
        resultMap.putMap("error", errorMap);
      }
      if (error == null && timeout) {
        WritableMap timeoutError = Arguments.createMap();
        timeoutError.putString("code", "database/internal-timeout");
        timeoutError.putString(
          "message",
          "A timeout occurred whilst waiting for React Native JavaScript thread to send transaction updates."
        );
        resultMap.putMap("error", timeoutError);
      }
    } else {
      resultMap.putString("type", "complete");
      resultMap.putMap("snapshot", snapshotToMap(snapshot));
    }

    return resultMap;
  }
}
