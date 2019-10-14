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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.interfaces.NativeEvent;

public class ReactNativeFirebaseFirestoreEvent implements NativeEvent {

  static final String COLLECTION_EVENT_SYNC = "firestore_collection_sync_event";
  static final String DOCUMENT_EVENT_SYNC = "firestore_document_sync_event";
  static final String TRANSACTION_EVENT_SYNC = "firestore_transaction_event";
  private static final String KEY_ID = "listenerId";
  private static final String KEY_BODY = "body";
  private static final String KEY_APP_NAME = "appName";
  private static final String KEY_EVENT_NAME = "eventName";
  private String eventName;
  private WritableMap eventBody;
  private String appName;
  private int listenerId;


  ReactNativeFirebaseFirestoreEvent(
    String eventName,
    WritableMap eventBody,
    String appName,
    int listenerId
  ) {
    this.eventName = eventName;
    this.eventBody = eventBody;
    this.appName = appName;
    this.listenerId = listenerId;
  }

  @Override
  public String getEventName() {
    return eventName;
  }

  @Override
  public WritableMap getEventBody() {
    WritableMap event = Arguments.createMap();
    event.putInt(KEY_ID, listenerId);
    event.putMap(KEY_BODY, eventBody);
    event.putString(KEY_APP_NAME, appName);
    event.putString(KEY_EVENT_NAME, eventName);
    return event;
  }

  @Override
  public String getFirebaseAppName() {
    return appName;
  }
}
