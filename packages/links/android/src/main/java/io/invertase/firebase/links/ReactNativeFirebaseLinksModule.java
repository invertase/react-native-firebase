package io.invertase.firebase.links;

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

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseLinksModule extends ReactNativeFirebaseModule implements ActivityEventListener, LifecycleEventListener {
  private static final String TAG = "Links";

  ReactNativeFirebaseLinksModule(ReactApplicationContext reactContext) {
    super(reactContext, TAG);
    getReactApplicationContext().addActivityEventListener(this);
    getReactApplicationContext().addLifecycleEventListener(this);
  }

  @ReactMethod
  public void createDynamicLink(WritableMap linkMap, Promise promise) {

  }

  @ReactMethod
  public void createShortDynamicLink(WritableMap linkMap, String type, Promise promise) {

  }

  @ReactMethod
  public void getInitialLink(Promise promise) {

  }

  @Override
  public void onHostResume() {}

  @Override
  public void onHostPause() {}

  @Override
  public void onHostDestroy() {
//    mInitialLink = null;
//    mInitialLinkInitialized = false;
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    // Not required for this module
  }

  private boolean isInvite(PendingDynamicLinkData pendingDynamicLinkData) {
    FirebaseAppInvite invite = FirebaseAppInvite.getInvitation(pendingDynamicLinkData);
    if (invite != null && invite.getInvitationId() != null && !invite
      .getInvitationId()
      .isEmpty()) {
      return true;
    }
    return false;
  }

  @Override
  public void onNewIntent(Intent intent) {
    FirebaseDynamicLinks
      .getInstance()
      .getDynamicLink(intent)
      .addOnSuccessListener(new OnSuccessListener<PendingDynamicLinkData>() {
        @Override
        public void onSuccess(PendingDynamicLinkData pendingDynamicLinkData) {
          if (pendingDynamicLinkData != null
            && !isInvite(pendingDynamicLinkData)) {
            String link = pendingDynamicLinkData
              .getLink()
              .toString();
            Utils.sendEvent(
              getReactApplicationContext(),
              "links_link_received",
              link
            );
          }
        }
      });
  }
}