package io.invertase.firebase.database;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.MutableData;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

import javax.annotation.Nullable;

import io.invertase.firebase.Utils;

public class RNFirebaseTransactionHandler {
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

  RNFirebaseTransactionHandler(int id, String app, String url) {
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
    Map<String, Object> updateData = Utils.recursivelyDeconstructReadableMap(updates);

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
    } finally {
      lock.unlock();
    }
  }

  /**
   * Wait for signalUpdateReceived to signal condition
   *
   * @throws InterruptedException
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

    updatesMap.putInt("id", transactionId);
    updatesMap.putString("type", "update");

    // all events get distributed js side based on app name
    updatesMap.putString("appName", appName);
    updatesMap.putString("dbURL", dbURL);

    if (!updatesData.hasChildren()) {
      Utils.mapPutValue("value", updatesData.getValue(), updatesMap);
    } else {
      Object value = RNFirebaseDatabaseUtils.castValue(updatesData);

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

    resultMap.putInt("id", transactionId);
    resultMap.putString("appName", appName);
    resultMap.putString("dbURL", dbURL);

    resultMap.putBoolean("timeout", timeout);
    resultMap.putBoolean("committed", committed);
    resultMap.putBoolean("interrupted", interrupted);

    if (error != null || timeout || interrupted) {
      resultMap.putString("type", "error");
      if (error != null) resultMap.putMap("error", RNFirebaseDatabase.getJSError(error));
      if (error == null && timeout) {
        WritableMap timeoutError = Arguments.createMap();
        timeoutError.putString("code", "DATABASE/INTERNAL-TIMEOUT");
        timeoutError.putString(
          "message",
          "A timeout occurred whilst waiting for RN JS thread to send transaction updates."
        );
        resultMap.putMap("error", timeoutError);
      }
    } else {
      resultMap.putString("type", "complete");
      resultMap.putMap("snapshot", RNFirebaseDatabaseUtils.snapshotToMap(snapshot));
    }

    return resultMap;
  }
}
