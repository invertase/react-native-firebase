package io.invertase.firebase.database;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.FirebaseDatabase;

public class UniversalFirebaseDatabaseUtils {

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

}
