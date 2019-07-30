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

import com.facebook.react.bridge.ReadableArray;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.Transaction;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

class ReactNativeFirebaseFirestoreTransactionHandler {

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
   */
  void resetState(Transaction firestoreTransaction) {
    this.commandBuffer = null;
    this.firestoreTransaction = firestoreTransaction;
  }

  /**
   * Signal that the transaction buffer has been received and needs to be processed.
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
   */
  DocumentSnapshot getDocument(DocumentReference documentReference) throws FirebaseFirestoreException {
    updateInternalTimeout();
    return firestoreTransaction.get(documentReference);
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
