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

import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseException;
import com.google.firebase.database.FirebaseDatabase;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public class UniversalFirebaseDatabaseCommon {

  static FirebaseDatabase getDatabaseForApp(String appName, String dbURL) {
    FirebaseDatabase firebaseDatabase;
    // TODO clean me
    if (dbURL != null && dbURL.length() > 0) {
      if (appName != null && appName.length() > 0) {
        FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
        firebaseDatabase = FirebaseDatabase.getInstance(firebaseApp, dbURL);
      } else {
        firebaseDatabase = FirebaseDatabase.getInstance(dbURL);
      }
    } else {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      firebaseDatabase = FirebaseDatabase.getInstance(firebaseApp);
    }

    return firebaseDatabase;
  }

  static String[] getExceptionCodeAndMessage(@Nullable Exception exception) {
    String code = "unknown";
    String message = "An unknown error occurred.";

    if (exception != null) {
       message = exception.getMessage();
       if (exception instanceof DatabaseException) {
         Log.d("ELLIOT", "INSIDE IF");
         DatabaseException databaseException = (DatabaseException) exception;
         Throwable throwable = databaseException.getCause();
         DatabaseError databaseError = DatabaseError.fromException(databaseException);
         Log.d("ELLIOT", Integer.toString(databaseError.getCode()));

         switch (databaseError.getCode()) {
           case DatabaseError.DATA_STALE:
             code = "data-stale";
             message = "The transaction needs to be run again with current data.";
             break;
           case DatabaseError.OPERATION_FAILED:
             code = "failure";
             message = "The server indicated that this operation failed.";
             break;
           case DatabaseError.PERMISSION_DENIED:
             code = "permission-denied";
             message = "Client doesn't have permission to access the desired data.";
             break;
           case DatabaseError.DISCONNECTED:
             code = "disconnected";
             message = "The operation had to be aborted due to a network disconnect.";
             break;
           case DatabaseError.EXPIRED_TOKEN:
             code = "expired-token";
             message = "The supplied auth token has expired.";
             break;
           case DatabaseError.INVALID_TOKEN:
             code = "invalid-token";
             message = "The supplied auth token was invalid.";
             break;
           case DatabaseError.MAX_RETRIES:
             code = "max-retries";
             message = "The transaction had too many retries.";
             break;
           case DatabaseError.OVERRIDDEN_BY_SET:
             code = "overridden-by-set";
             message = "The transaction was overridden by a subsequent set.";
             break;
           case DatabaseError.UNAVAILABLE:
             code = "unavailable";
             message = "The service is unavailable.";
             break;
           case DatabaseError.NETWORK_ERROR:
             code = "network-error";
             message = "The operation could not be performed due to a network error.";
             break;
           case DatabaseError.WRITE_CANCELED:
             code = "write-cancelled";
             message = "The write was canceled by the user.";
             break;
           case DatabaseError.USER_CODE_EXCEPTION:
             if (throwable != null) {
               Log.d("ELLIOT", throwable.getMessage());

               if (throwable.getMessage().contains("Permission denied")) {
                 code = "permission-denied";
                 message = "Permission denied";
               }
             }
             break;
         }
       }
    }

    return new String[]{code, message};
  }
}
