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

import static io.invertase.firebase.common.RCTConvertFirebase.toHashMap;
import static io.invertase.firebase.firestore.ReactNativeFirebaseFirestoreCommon.getServerTimestampBehavior;

import android.util.Base64;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.Timestamp;
import com.google.firebase.firestore.Blob;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FieldPath;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.GeoPoint;
import com.google.firebase.firestore.MetadataChanges;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.SnapshotMetadata;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import javax.annotation.Nullable;

// public access for native re-use in brownfield apps
public class ReactNativeFirebaseFirestoreSerialize {
  private static final String TAG = "FirestoreSerialize";

  // Bridge Map
  private static final int INT_NAN = 0;
  private static final int INT_NEGATIVE_INFINITY = 1;
  private static final int INT_POSITIVE_INFINITY = 2;
  private static final int INT_NULL = 3;
  private static final int INT_DOCUMENTID = 4;
  private static final int INT_BOOLEAN_TRUE = 5;
  private static final int INT_BOOLEAN_FALSE = 6;
  private static final int INT_DOUBLE = 7;
  private static final int INT_STRING = 8;
  private static final int INT_STRING_EMPTY = 9;
  private static final int INT_ARRAY = 10;
  private static final int INT_REFERENCE = 11;
  private static final int INT_GEOPOINT = 12;
  private static final int INT_TIMESTAMP = 13;
  private static final int INT_BLOB = 14;
  private static final int INT_FIELDVALUE = 15;
  private static final int INT_OBJECT = 16;
  private static final int INT_INTEGER = 17;
  private static final int INT_NEGATIVE_ZERO = 18;
  private static final int INT_UNKNOWN = -999;

  // Keys
  private static final String TYPE = "type";
  private static final String KEY_DATA = "data";
  private static final String KEY_PATH = "path";
  private static final String KEY_EXISTS = "exists";
  private static final String KEY_META = "metadata";
  private static final String KEY_CHANGES = "changes";
  private static final String KEY_OPTIONS = "options";
  private static final String KEY_DOCUMENTS = "documents";
  private static final String KEY_DOC_CHANGE_TYPE = "type";
  private static final String KEY_DOC_CHANGE_DOCUMENT = "doc";
  private static final String KEY_DOC_CHANGE_NEW_INDEX = "ni";
  private static final String KEY_DOC_CHANGE_OLD_INDEX = "oi";

  // Document Change Types
  private static final String CHANGE_ADDED = "a";
  private static final String CHANGE_MODIFIED = "m";
  private static final String CHANGE_REMOVED = "r";

  /**
   * Convert a DocumentSnapshot instance into a React Native WritableMap
   *
   * @param documentSnapshot DocumentSnapshot
   * @return WritableMap
   */
  static WritableMap snapshotToWritableMap(String appName, DocumentSnapshot documentSnapshot) {
    WritableArray metadata = Arguments.createArray();
    WritableMap documentMap = Arguments.createMap();
    SnapshotMetadata snapshotMetadata = documentSnapshot.getMetadata();

    // build metadata array: 0 = fromCache, 1 = hasPendingWrites
    metadata.pushBoolean(snapshotMetadata.isFromCache());
    metadata.pushBoolean(snapshotMetadata.hasPendingWrites());

    documentMap.putArray(KEY_META, metadata);
    documentMap.putString(KEY_PATH, documentSnapshot.getReference().getPath());
    documentMap.putBoolean(KEY_EXISTS, documentSnapshot.exists());

    DocumentSnapshot.ServerTimestampBehavior timestampBehavior =
        getServerTimestampBehavior(appName);

    if (documentSnapshot.exists()) {
      if (documentSnapshot.getData(timestampBehavior) != null) {
        documentMap.putMap(
            KEY_DATA, objectMapToWritable(documentSnapshot.getData(timestampBehavior)));
      }
    }

    return documentMap;
  }

  /**
   * Convert a Firestore QuerySnapshot instance to a RN serializable WritableMap type map
   *
   * @param querySnapshot QuerySnapshot
   * @return WritableMap
   */
  static WritableMap snapshotToWritableMap(
      String appName,
      String source,
      QuerySnapshot querySnapshot,
      @Nullable MetadataChanges metadataChanges) {
    WritableMap writableMap = Arguments.createMap();
    writableMap.putString("source", source);

    WritableArray metadata = Arguments.createArray();
    WritableArray documents = Arguments.createArray();

    List<DocumentChange> documentChangesList = querySnapshot.getDocumentChanges();

    if (metadataChanges == null || metadataChanges == MetadataChanges.EXCLUDE) {
      // If not listening to metadata changes, send the data back to JS land with a flag
      // indicating the data does not include these changes
      writableMap.putBoolean("excludesMetadataChanges", true);
      writableMap.putArray(
          KEY_CHANGES, documentChangesToWritableArray(appName, documentChangesList, null));
    } else {
      // If listening to metadata changes, get the changes list with document changes array.
      // To indicate whether a document change was because of metadata change, we check whether
      // its in the raw list by document key.
      writableMap.putBoolean("excludesMetadataChanges", false);
      List<DocumentChange> documentMetadataChangesList =
          querySnapshot.getDocumentChanges(MetadataChanges.INCLUDE);
      writableMap.putArray(
          KEY_CHANGES,
          documentChangesToWritableArray(
              appName, documentMetadataChangesList, documentChangesList));
    }

    SnapshotMetadata snapshotMetadata = querySnapshot.getMetadata();
    List<DocumentSnapshot> documentSnapshots = querySnapshot.getDocuments();

    // set documents
    for (DocumentSnapshot documentSnapshot : documentSnapshots) {
      documents.pushMap(snapshotToWritableMap(appName, documentSnapshot));
    }
    writableMap.putArray(KEY_DOCUMENTS, documents);

    // set metadata
    // build metadata array: 0 = fromCache, 1 = hasPendingWrites
    metadata.pushBoolean(snapshotMetadata.isFromCache());
    metadata.pushBoolean(snapshotMetadata.hasPendingWrites());
    writableMap.putArray(KEY_META, metadata);

    return writableMap;
  }

  /**
   * Convert a List of DocumentChange instances into a React Native WritableArray
   *
   * @param documentChanges List<DocumentChange>
   * @return WritableArray
   */
  private static WritableArray documentChangesToWritableArray(
      String appName,
      List<DocumentChange> documentChanges,
      @Nullable List<DocumentChange> comparableDocumentChanges) {
    WritableArray documentChangesWritable = Arguments.createArray();

    boolean checkIfMetadataChange = comparableDocumentChanges != null;

    for (DocumentChange documentChange : documentChanges) {
      boolean isMetadataChange = false;
      if (checkIfMetadataChange) {
        int hashCode = documentChange.hashCode();
        DocumentChange exists = null;
        for (DocumentChange docChange : comparableDocumentChanges) {
          if (docChange.hashCode() == hashCode) {
            exists = docChange;
          }
        }

        // Exists in docChanges with meta, but doesnt exist in docChanges without meta
        if (exists == null) {
          isMetadataChange = true;
        }
      }

      documentChangesWritable.pushMap(
          documentChangeToWritableMap(appName, documentChange, isMetadataChange));
    }

    return documentChangesWritable;
  }

  /**
   * Convert a DocumentChange instance into a React Native WritableMap
   *
   * @param documentChange DocumentChange
   * @return WritableMap
   */
  private static WritableMap documentChangeToWritableMap(
      String appName, DocumentChange documentChange, boolean isMetadataChange) {
    WritableMap documentChangeMap = Arguments.createMap();
    documentChangeMap.putBoolean("isMetadataChange", isMetadataChange);

    switch (documentChange.getType()) {
      case ADDED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, CHANGE_ADDED);
        break;
      case MODIFIED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, CHANGE_MODIFIED);
        break;
      case REMOVED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, CHANGE_REMOVED);
        break;
    }

    documentChangeMap.putMap(
        KEY_DOC_CHANGE_DOCUMENT, snapshotToWritableMap(appName, documentChange.getDocument()));

    documentChangeMap.putInt(KEY_DOC_CHANGE_NEW_INDEX, documentChange.getNewIndex());
    documentChangeMap.putInt(KEY_DOC_CHANGE_OLD_INDEX, documentChange.getOldIndex());

    return documentChangeMap;
  }

  /**
   * Converts an Object Map into a React Native WritableMap.
   *
   * @param map Map<String, Object>
   * @return WritableMap
   */
  private static WritableMap objectMapToWritable(Map<String, Object> map) {
    WritableMap writableMap = Arguments.createMap();

    for (Map.Entry<String, Object> entry : map.entrySet()) {
      WritableArray typeMap = buildTypeMap(entry.getValue());
      writableMap.putArray(entry.getKey(), typeMap);
    }

    return writableMap;
  }

  /**
   * Converts a Object array into a React Native WritableArray.
   *
   * @param array Object[]
   * @return WritableArray
   */
  private static WritableArray objectArrayToWritable(Object[] array) {
    WritableArray writableArray = Arguments.createArray();

    for (Object item : array) {
      WritableArray typeArray = buildTypeMap(item);
      writableArray.pushArray(typeArray);
    }

    return writableArray;
  }

  private static WritableArray buildTypeMap(Object value) {
    WritableArray typeArray = Arguments.createArray();

    if (value == null) {
      typeArray.pushInt(INT_NULL);
      return typeArray;
    }

    if (value instanceof Boolean) {
      Boolean boolValue = (Boolean) value;
      if (boolValue) {
        typeArray.pushInt(INT_BOOLEAN_TRUE);
      } else {
        typeArray.pushInt(INT_BOOLEAN_FALSE);
      }
      return typeArray;
    }

    if (value instanceof Integer) {
      typeArray.pushInt(INT_DOUBLE);
      typeArray.pushDouble(((Integer) value).doubleValue());
      return typeArray;
    }

    if (value instanceof Double) {
      Double doubleValue = (Double) value;

      if (Double.isInfinite(doubleValue)) {
        if (doubleValue.equals(Double.NEGATIVE_INFINITY)) {
          typeArray.pushInt(INT_NEGATIVE_INFINITY);
          return typeArray;
        }

        if (doubleValue.equals(Double.POSITIVE_INFINITY)) {
          typeArray.pushInt(INT_POSITIVE_INFINITY);
          return typeArray;
        }
      }

      if (Double.isNaN(doubleValue)) {
        typeArray.pushInt(INT_NAN);
        return typeArray;
      }

      typeArray.pushInt(INT_DOUBLE);
      typeArray.pushDouble(doubleValue);
      return typeArray;
    }

    if (value instanceof Float) {
      typeArray.pushInt(INT_DOUBLE);
      typeArray.pushDouble(((Float) value).doubleValue());
      return typeArray;
    }

    if (value instanceof Long) {
      typeArray.pushInt(INT_DOUBLE);
      typeArray.pushDouble(((Long) value).doubleValue());
      return typeArray;
    }

    if (value instanceof String) {
      if (value == "") {
        typeArray.pushInt(INT_STRING_EMPTY);
      } else {
        typeArray.pushInt(INT_STRING);
        typeArray.pushString((String) value);
      }
      return typeArray;
    }

    if (Map.class.isAssignableFrom(value.getClass())) {
      typeArray.pushInt(INT_OBJECT);
      typeArray.pushMap(objectMapToWritable((Map<String, Object>) value));
      return typeArray;
    }

    if (List.class.isAssignableFrom(value.getClass())) {
      typeArray.pushInt(INT_ARRAY);
      List<Object> list = (List<Object>) value;
      Object[] array = list.toArray(new Object[list.size()]);
      typeArray.pushArray(objectArrayToWritable(array));
      return typeArray;
    }

    if (value instanceof DocumentReference) {
      typeArray.pushInt(INT_REFERENCE);
      typeArray.pushString(((DocumentReference) value).getPath());
      return typeArray;
    }

    if (value instanceof Timestamp) {
      typeArray.pushInt(INT_TIMESTAMP);
      WritableArray timestampArray = Arguments.createArray();
      timestampArray.pushDouble(((Timestamp) value).getSeconds());
      timestampArray.pushInt(((Timestamp) value).getNanoseconds());
      typeArray.pushArray(timestampArray);
      return typeArray;
    }

    if (value instanceof GeoPoint) {
      typeArray.pushInt(INT_GEOPOINT);
      WritableArray geopointArray = Arguments.createArray();
      geopointArray.pushDouble(((GeoPoint) value).getLatitude());
      geopointArray.pushDouble(((GeoPoint) value).getLongitude());
      typeArray.pushArray(geopointArray);
      return typeArray;
    }

    if (value instanceof Blob) {
      typeArray.pushInt(INT_BLOB);
      typeArray.pushString(Base64.encodeToString(((Blob) value).toBytes(), Base64.NO_WRAP));
      return typeArray;
    }

    Log.w(TAG, "Unknown object of type " + value.getClass());

    typeArray.pushInt(INT_UNKNOWN);
    return typeArray;
  }

  /**
   * Converts a ReadableMap to a usable format for Firestore (public access for native re-use in
   * brownfield apps)
   *
   * @param firestore FirebaseFirestore
   * @param readableMap ReadableMap
   * @return Map<>
   */
  public static Map<String, Object> parseReadableMap(
      FirebaseFirestore firestore, @Nullable ReadableMap readableMap) {
    Map<String, Object> map = new HashMap<>();
    if (readableMap == null) return map;

    ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      map.put(key, parseTypeMap(firestore, readableMap.getArray(key)));
    }

    return map;
  }

  /**
   * Convert a RN array to a valid Firestore array
   *
   * @param firestore FirebaseFirestore
   * @param readableArray ReadableArray
   * @return List<Object>
   */
  static List<Object> parseReadableArray(
      FirebaseFirestore firestore, @Nullable ReadableArray readableArray) {
    List<Object> list = new ArrayList<>();
    if (readableArray == null) return list;

    for (int i = 0; i < readableArray.size(); i++) {
      list.add(parseTypeMap(firestore, readableArray.getArray(i)));
    }

    return list;
  }

  static Object parseTypeMap(FirebaseFirestore firestore, ReadableArray typeArray) {
    int value = typeArray.getInt(0);

    switch (value) {
      case INT_NAN:
        return Double.NaN;
      case INT_NEGATIVE_INFINITY:
        return Double.NEGATIVE_INFINITY;
      case INT_POSITIVE_INFINITY:
        return Double.POSITIVE_INFINITY;
      case INT_NULL:
        return null;
      case INT_DOCUMENTID:
        return FieldPath.documentId();
      case INT_BOOLEAN_TRUE:
        return true;
      case INT_BOOLEAN_FALSE:
        return false;
      case INT_NEGATIVE_ZERO:
        return -0.0;
      case INT_INTEGER:
        return (long) typeArray.getDouble(1);
      case INT_DOUBLE:
        return typeArray.getDouble(1);
      case INT_STRING:
        return typeArray.getString(1);
      case INT_STRING_EMPTY:
        return "";
      case INT_ARRAY:
        return parseReadableArray(firestore, typeArray.getArray(1));
      case INT_REFERENCE:
        return firestore.document(Objects.requireNonNull(typeArray.getString(1)));
      case INT_GEOPOINT:
        ReadableArray geopointArray = typeArray.getArray(1);
        return new GeoPoint(
            Objects.requireNonNull(geopointArray).getDouble(0), geopointArray.getDouble(1));
      case INT_TIMESTAMP:
        ReadableArray timestampArray = typeArray.getArray(1);
        return new Timestamp(
            (long) Objects.requireNonNull(timestampArray).getDouble(0), timestampArray.getInt(1));
      case INT_BLOB:
        return Blob.fromBytes(Base64.decode(typeArray.getString(1), Base64.NO_WRAP));
      case INT_FIELDVALUE:
        ReadableArray fieldValueArray = typeArray.getArray(1);
        String fieldValueType = Objects.requireNonNull(fieldValueArray).getString(0);

        if (Objects.requireNonNull(fieldValueType).equals("timestamp")) {
          return FieldValue.serverTimestamp();
        }

        if (Objects.requireNonNull(fieldValueType).equals("increment")) {
          return FieldValue.increment(fieldValueArray.getDouble(1));
        }

        if (Objects.requireNonNull(fieldValueType).equals("delete")) {
          return FieldValue.delete();
        }

        if (Objects.requireNonNull(fieldValueType).equals("array_union")) {
          ReadableArray elements = fieldValueArray.getArray(1);
          return FieldValue.arrayUnion(parseReadableArray(firestore, elements).toArray());
        }

        if (Objects.requireNonNull(fieldValueType).equals("array_remove")) {
          ReadableArray elements = fieldValueArray.getArray(1);
          return FieldValue.arrayRemove(parseReadableArray(firestore, elements).toArray());
        }
      case INT_OBJECT:
        return parseReadableMap(firestore, typeArray.getMap(1));
      case INT_UNKNOWN:
      default:
        return null;
    }
  }

  /**
   * Parse JS batches array from batch().commit()
   *
   * @param firestore FirebaseFirestore
   * @param readableArray ReadableArray
   * @return List<Object>
   */
  static List<Object> parseDocumentBatches(
      FirebaseFirestore firestore, ReadableArray readableArray) {
    List<Object> writes = new ArrayList<>(readableArray.size());

    for (int i = 0; i < readableArray.size(); i++) {
      Map<String, Object> write = new HashMap<>();
      ReadableMap map = readableArray.getMap(i);

      write.put(TYPE, map.getString(TYPE));
      write.put(KEY_PATH, map.getString(KEY_PATH));

      if (map.hasKey(KEY_DATA)) {
        write.put(KEY_DATA, parseReadableMap(firestore, map.getMap(KEY_DATA)));
      }

      if (map.hasKey(KEY_OPTIONS)) {
        write.put(KEY_OPTIONS, toHashMap(map.getMap(KEY_OPTIONS)));
      }

      writes.add(write);
    }

    return writes;
  }
}
