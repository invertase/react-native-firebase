package io.invertase.firebase.invites;

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

import com.facebook.react.bridge.WritableMap;

import io.invertase.firebase.interfaces.NativeEvent;

public class ReactNativeFirebaseLinksOnLinkEvent implements NativeEvent {
  private WritableMap linkMap;

  ReactNativeFirebaseLinksOnLinkEvent(WritableMap linkMap) {
    this.linkMap = linkMap;
  }

  public String getEventName() {
    return "invites_invitation_received";
  }

  public WritableMap getEventBody() {
    return this.linkMap;
  }

  public String getFirebaseAppName() {
    return "[DEFAULT]";
  }
}
