package io.invertase.firebase.database;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.MutableData;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;

public class UniversalFirebaseDatabaseUtils {
  private static final String TAG = "RNFirebaseDatabaseUtils";

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
