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


import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.interfaces.NativeEvent;

public class ReactNativeFirebaseAdMobEvent implements NativeEvent {
  public static final String EVENT_INTERSTITIAL = "admob_interstitial_event";
  public static final String EVENT_REWARDED = "admob_rewarded_event";

  public static final String AD_LOADED = "loaded";
  public static final String AD_ERROR= "error";
  public static final String AD_OPENED= "opened";
  public static final String AD_CLICKED= "clicked";
  public static final String AD_LEFT_APPLICATION = "left_application";
  public static final String AD_CLOSED = "closed";

  public static final String AD_REWARDED_LOADED = "rewarded_loaded";
  public static final String AD_REWARDED_EARNED_REWARD = "rewarded_earned_reward";

  private static final String KEY_BODY = "body";
  private static final String KEY_REQUEST_ID = "requestId";
  private static final String KEY_AD_UNIT_ID = "adUnitId";
  private static final String KEY_EVENT_NAME = "eventName";

  private String eventName;
  private int requestId;
  private String adUnitId;
  private WritableMap eventBody;

  public ReactNativeFirebaseAdMobEvent(
    String eventName,
    int requestId,
    String adUnitId,
    WritableMap eventBody
  ) {
    this.eventName = eventName;
    this.requestId = requestId;
    this.adUnitId = adUnitId;
    this.eventBody = eventBody;
  }

  @Override
  public String getEventName() {
    return eventName;
  }

  @Override
  public WritableMap getEventBody() {
    WritableMap event = Arguments.createMap();
    event.putMap(KEY_BODY, eventBody);
    event.putInt(KEY_REQUEST_ID, requestId);
    event.putString(KEY_AD_UNIT_ID, adUnitId);
    event.putString(KEY_EVENT_NAME, eventName);
    return event;
  }

  // Return null so all events are picked up by SyncTree
  @Override
  public String getFirebaseAppName() {
    return null;
  }
}
