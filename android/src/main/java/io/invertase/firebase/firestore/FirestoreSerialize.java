package io.invertase.firebase.firestore;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class FirestoreSerialize {
  private static final String KEY_CHANGES = "changes";
  private static final String KEY_DATA = "data";
  private static final String KEY_DOC_CHANGE_DOCUMENT = "document";
  private static final String KEY_DOC_CHANGE_NEW_INDEX = "newIndex";
  private static final String KEY_DOC_CHANGE_OLD_INDEX = "oldIndex";
  private static final String KEY_DOC_CHANGE_TYPE = "type";
  private static final String KEY_DOCUMENTS = "documents";
  private static final String KEY_PATH = "path";

  /**
   * Convert a DocumentSnapshot instance into a React Native WritableMap
   *
   * @param documentSnapshot DocumentSnapshot
   * @return WritableMap
   */
  static WritableMap snapshotToWritableMap(DocumentSnapshot documentSnapshot) {
    WritableMap documentMap = Arguments.createMap();

    documentMap.putString(KEY_PATH, documentSnapshot.getReference().getPath());
    documentMap.putMap(KEY_DATA, objectMapToWritable(documentSnapshot.getData()));
    // Missing fields from web SDK
    // createTime
    // readTime
    // updateTime

    return documentMap;
  }

  public static WritableMap snapshotToWritableMap(QuerySnapshot querySnapshot) {
    WritableMap queryMap = Arguments.createMap();

    List<DocumentChange> documentChanges = querySnapshot.getDocumentChanges();
    queryMap.putArray(KEY_CHANGES, documentChangesToWritableArray(documentChanges));

    // documents
    WritableArray documents = Arguments.createArray();
    List<DocumentSnapshot> documentSnapshots = querySnapshot.getDocuments();
    for (DocumentSnapshot documentSnapshot : documentSnapshots) {
      documents.pushMap(snapshotToWritableMap(documentSnapshot));
    }
    queryMap.putArray(KEY_DOCUMENTS, documents);

    return queryMap;
  }

  /**
   * Convert a List of DocumentChange instances into a React Native WritableArray
   *
   * @param documentChanges List<DocumentChange>
   * @return WritableArray
   */
  static WritableArray documentChangesToWritableArray(List<DocumentChange> documentChanges) {
    WritableArray documentChangesWritable = Arguments.createArray();
    for (DocumentChange documentChange : documentChanges) {
      documentChangesWritable.pushMap(documentChangeToWritableMap(documentChange));
    }
    return documentChangesWritable;
  }

  /**
   * Convert a DocumentChange instance into a React Native WritableMap
   *
   * @param documentChange DocumentChange
   * @return WritableMap
   */
  static WritableMap documentChangeToWritableMap(DocumentChange documentChange) {
    WritableMap documentChangeMap = Arguments.createMap();

    switch (documentChange.getType()) {
      case ADDED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, "added");
        break;
      case REMOVED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, "removed");
        break;
      case MODIFIED:
        documentChangeMap.putString(KEY_DOC_CHANGE_TYPE, "modified");
    }

    documentChangeMap.putMap(KEY_DOC_CHANGE_DOCUMENT,
      snapshotToWritableMap(documentChange.getDocument()));
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
  static WritableMap objectMapToWritable(Map<String, Object> map) {
    WritableMap writableMap = Arguments.createMap();
    for (Map.Entry<String, Object> entry : map.entrySet()) {
      putValue(writableMap, entry.getKey(), entry.getValue());
    }
    return writableMap;
  }

  /**
   * Converts an Object array into a React Native WritableArray.
   *
   * @param array Object[]
   * @return WritableArray
   */
  static WritableArray objectArrayToWritable(Object[] array) {
    WritableArray writableArray = Arguments.createArray();

    for (Object item : array) {
      if (item == null) {
        writableArray.pushNull();
        continue;
      }

      Class itemClass = item.getClass();

      if (itemClass == Boolean.class) {
        writableArray.pushBoolean((Boolean) item);
      } else if (itemClass == Integer.class) {
        writableArray.pushDouble(((Integer) item).doubleValue());
      } else if (itemClass == Double.class) {
        writableArray.pushDouble((Double) item);
      } else if (itemClass == Float.class) {
        writableArray.pushDouble(((Float) item).doubleValue());
      } else if (itemClass == String.class) {
        writableArray.pushString(item.toString());
      } else if (itemClass == Map.class) {
        writableArray.pushMap((objectMapToWritable((Map<String, Object>) item)));
      } else if (itemClass == Arrays.class) {
        writableArray.pushArray(objectArrayToWritable((Object[]) item));
      } else if (itemClass == List.class) {
        List<Object> list = (List<Object>) item;
        Object[] listAsArray = list.toArray(new Object[list.size()]);
        writableArray.pushArray(objectArrayToWritable(listAsArray));
      } else {
        throw new RuntimeException("Cannot convert object of type " + item);
      }
    }

    return writableArray;
  }

  /**
   * Detects an objects type and calls the relevant WritableMap setter method to add the value.
   *
   * @param map   WritableMap
   * @param key   String
   * @param value Object
   */
  static void putValue(WritableMap map, String key, Object value) {
    if (value == null) {
      map.putNull(key);
    } else {
      Class valueClass = value.getClass();

      if (valueClass == Boolean.class) {
        map.putBoolean(key, (Boolean) value);
      } else if (valueClass == Integer.class) {
        map.putDouble(key, ((Integer) value).doubleValue());
      } else if (valueClass == Double.class) {
        map.putDouble(key, (Double) value);
      } else if (valueClass == Float.class) {
        map.putDouble(key, ((Float) value).doubleValue());
      } else if (valueClass == String.class) {
        map.putString(key, value.toString());
      } else if (valueClass == Map.class) {
        map.putMap(key, (objectMapToWritable((Map<String, Object>) value)));
      } else if (valueClass == Arrays.class) {
        map.putArray(key, objectArrayToWritable((Object[]) value));
      } else if (valueClass == List.class) {
        List<Object> list = (List<Object>) value;
        Object[] array = list.toArray(new Object[list.size()]);
        map.putArray(key, objectArrayToWritable(array));
      } else {
        throw new RuntimeException("Cannot convert object of type " + value);
      }
    }
  }
}
