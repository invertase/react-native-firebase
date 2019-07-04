package io.invertase.firebase.firestore;

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

import android.support.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Transaction;

import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ReactNativeFirebaseFirestoreTransactionHandler {

  private final ReentrantLock lock;
  private final Condition condition;
  boolean aborted = false;
  boolean timeout = false;
  private String appName;
  private long timeoutAt;
  private int transactionId;
  private ReadableArray commandBuffer;
  private Transaction firestoreTransaction;

  ReactNativeFirebaseFirestoreTransactionHandler(String app, int id) {
    appName = app;
    transactionId = id;
    updateInternalTimeout();
    lock = new ReentrantLock();
    condition = lock.newCondition();
  }

  /*
   * -------------
   *  PACKAGE API
   * -------------
   */

  /**
   * Abort the currently in progress transaction if any.
   */
  void abort() {
    aborted = true;
    safeUnlock();
  }

  /**
   * Reset handler state - clears command buffer + updates to new Transaction instance
   *
   * @param firestoreTransaction
   */
  void resetState(Transaction firestoreTransaction) {
    this.commandBuffer = null;
    this.firestoreTransaction = firestoreTransaction;
  }

  /**
   * Signal that the transaction buffer has been received and needs to be processed.
   *
   * @param buffer
   */
  void signalBufferReceived(ReadableArray buffer) {
    lock.lock();

    try {
      commandBuffer = buffer;
      condition.signalAll();
    } finally {
      safeUnlock();
    }
  }

  /**
   * Wait for signalBufferReceived to signal condition
   */
  void await() {
    lock.lock();

    updateInternalTimeout();

    try {
      while (!aborted && !timeout && !condition.await(10, TimeUnit.MILLISECONDS)) {
        if (System.currentTimeMillis() > timeoutAt) timeout = true;
      }
    } catch (InterruptedException ie) {
      // should never be interrupted
    } finally {
      safeUnlock();
    }
  }

  /**
   * Get the current pending command buffer.
   *
   * @return
   */
  ReadableArray getCommandBuffer() {
    return commandBuffer;
  }

  int getTransactionId() {
    return transactionId;
  }

  String getAppName() {
    return appName;
  }

  /**
   * Get and resolve a DocumentSnapshot from transaction.get(ref);
   *
   * @param executor
   * @param documentReference
   */
  Task<DocumentSnapshot> getDocument(Executor executor, DocumentReference documentReference) {
    updateInternalTimeout();
    return Tasks.call(executor, () -> firestoreTransaction.get(documentReference));
  }

  /**
   * Event map for `firestore_transaction_event` events.
   *
   * @param error
   * @param type
   * @return
   */
  WritableMap createEventMap(@Nullable FirebaseFirestoreException error, String type) {
    WritableMap eventMap = Arguments.createMap();

    eventMap.putInt("id", transactionId);
    eventMap.putString("appName", appName);

    if (error != null) {
      eventMap.putString("type", "error");
      UniversalFirebaseFirestoreException exception = new UniversalFirebaseFirestoreException(error, error.getCause());
      WritableMap errorMap = Arguments.createMap();
      errorMap.putString("code", exception.getCode());
      errorMap.putString("message", exception.getMessage());
      eventMap.putMap("error", errorMap);
    } else {
      eventMap.putString("type", type);
    }

    return eventMap;
  }

  /*
   * -------------
   * INTERNAL API
   * -------------
   */

  private void safeUnlock() {
    if (lock.isLocked()) {
      lock.unlock();
    }
  }

  private void updateInternalTimeout() {
    timeoutAt = System.currentTimeMillis() + 15000;
  }
}
