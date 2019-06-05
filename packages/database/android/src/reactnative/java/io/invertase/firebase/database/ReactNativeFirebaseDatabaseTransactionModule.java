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

import android.os.AsyncTask;
import android.util.SparseArray;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.database.*;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseModule;

import javax.annotation.Nonnull;

import static io.invertase.firebase.database.UniversalFirebaseDatabaseCommon.getDatabaseForApp;

public class ReactNativeFirebaseDatabaseTransactionModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "DatabaseTransaction";
  private static SparseArray<ReactNativeFirebaseDatabaseTransactionHandler> transactionHandlers = new SparseArray<>();

  ReactNativeFirebaseDatabaseTransactionModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
  }

  @ReactMethod
  public void transactionStart(String app, String dbURL, String path, int transactionId, Boolean applyLocally) {
    AsyncTask.execute(() -> {
      DatabaseReference reference = getDatabaseForApp(app, dbURL).getReference(path);

      reference.runTransaction(new Transaction.Handler() {
        @Nonnull
        @Override
        public Transaction.Result doTransaction(@Nonnull MutableData mutableData) {
          final ReactNativeFirebaseDatabaseTransactionHandler transactionHandler = new ReactNativeFirebaseDatabaseTransactionHandler(
            transactionId,
            app,
            dbURL
          );
          transactionHandlers.put(transactionId, transactionHandler);
          final WritableMap updatesMap = transactionHandler.createUpdateMap(mutableData);

          // emit the updates to js using an async task
          // otherwise it gets blocked by the lock await
          AsyncTask.execute(() -> {
            ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

            emitter.sendEvent(new ReactNativeFirebaseTransactionEvent(
              ReactNativeFirebaseTransactionEvent.EVENT_TRANSACTION,
              updatesMap,
              app,
              transactionId
            ));
          });

          // wait for js to return the updates (js calls transactionTryCommit)
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
        public void onComplete(DatabaseError error, boolean committed, DataSnapshot snapshot) {
          ReactNativeFirebaseDatabaseTransactionHandler transactionHandler = transactionHandlers.get(transactionId);
          WritableMap resultMap = transactionHandler.createResultMap(error, committed, snapshot);

          ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();

          emitter.sendEvent(new ReactNativeFirebaseTransactionEvent(
            ReactNativeFirebaseTransactionEvent.EVENT_TRANSACTION,
            resultMap,
            app,
            transactionId
          ));

          transactionHandlers.delete(transactionId);
        }

      }, applyLocally);
    });
  }

  @ReactMethod
  public void transactionTryCommit(String app, String dbURL, int transactionId, ReadableMap updates) {
    ReactNativeFirebaseDatabaseTransactionHandler handler = transactionHandlers.get(transactionId);

    if (handler != null) {
      handler.signalUpdateReceived(updates);
    }
  }
}
