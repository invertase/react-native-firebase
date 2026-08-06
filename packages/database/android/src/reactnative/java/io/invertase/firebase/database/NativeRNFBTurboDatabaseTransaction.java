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

import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

import android.os.AsyncTask;
import android.util.SparseArray;
import com.facebook.fbreact.specs.NativeRNFBTurboDatabaseTransactionSpec;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.database.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import javax.annotation.Nonnull;

public class NativeRNFBTurboDatabaseTransaction extends NativeRNFBTurboDatabaseTransactionSpec {
  private static final String SERVICE_NAME = "DatabaseTransaction";
  private static SparseArray<ReactNativeFirebaseDatabaseTransactionHandler> transactionHandlers =
      new SparseArray<>();
  private final DatabaseTurboModuleSupport turboSupport =
      new DatabaseTurboModuleSupport("RNFBDatabaseTransaction");

  public NativeRNFBTurboDatabaseTransaction(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public void invalidate() {
    for (int i = 0, size = transactionHandlers.size(); i < size; i++) {
      int key = transactionHandlers.keyAt(i);
      ReactNativeFirebaseDatabaseTransactionHandler transactionHandler =
          transactionHandlers.get(key);

      if (transactionHandler != null) {
        transactionHandler.abort();
      }
    }

    transactionHandlers.clear();
    turboSupport.invalidate();
  }

  @Override
  public void transactionStart(
      String app, String dbURL, String path, double transactionId, boolean applyLocally) {
    AsyncTask.execute(
        () -> {
          DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);

          reference.runTransaction(
              new Transaction.Handler() {
                @Nonnull
                @Override
                public Transaction.Result doTransaction(@Nonnull MutableData mutableData) {
                  final ReactNativeFirebaseDatabaseTransactionHandler transactionHandler =
                      new ReactNativeFirebaseDatabaseTransactionHandler(
                          (int) transactionId, app, dbURL);
                  transactionHandlers.put((int) transactionId, transactionHandler);
                  final WritableMap updatesMap = transactionHandler.createUpdateMap(mutableData);

                  AsyncTask.execute(
                      () -> {
                        ReactNativeFirebaseEventEmitter emitter =
                            ReactNativeFirebaseEventEmitter.getSharedInstance();

                        emitter.sendEvent(
                            new ReactNativeFirebaseTransactionEvent(
                                ReactNativeFirebaseTransactionEvent.EVENT_TRANSACTION,
                                updatesMap,
                                app,
                                (int) transactionId));
                      });

                  try {
                    transactionHandler.await();
                  } catch (InterruptedException e) {
                    transactionHandler.interrupted = true;
                    return Transaction.abort();
                  }

                  if (transactionHandler.abort) {
                    return Transaction.abort();
                  }

                  if (transactionHandler.timeout) {
                    return Transaction.abort();
                  }

                  mutableData.setValue(transactionHandler.value);
                  return Transaction.success(mutableData);
                }

                @Override
                public void onComplete(
                    DatabaseError error, boolean committed, DataSnapshot snapshot) {
                  ReactNativeFirebaseDatabaseTransactionHandler transactionHandler =
                      transactionHandlers.get((int) transactionId);

                  if (transactionHandler == null) {
                    transactionHandlers.delete((int) transactionId);
                    return;
                  }

                  WritableMap resultMap =
                      transactionHandler.createResultMap(error, committed, snapshot);

                  ReactNativeFirebaseEventEmitter emitter =
                      ReactNativeFirebaseEventEmitter.getSharedInstance();

                  emitter.sendEvent(
                      new ReactNativeFirebaseTransactionEvent(
                          ReactNativeFirebaseTransactionEvent.EVENT_TRANSACTION,
                          resultMap,
                          app,
                          (int) transactionId));

                  transactionHandlers.delete((int) transactionId);
                }
              },
              applyLocally);
        });
  }

  @Override
  public void transactionTryCommit(
      String app, String dbURL, double transactionId, ReadableMap updates) {
    ReactNativeFirebaseDatabaseTransactionHandler handler =
        transactionHandlers.get((int) transactionId);

    if (handler != null) {
      handler.signalUpdateReceived(updates);
    }
  }
}
