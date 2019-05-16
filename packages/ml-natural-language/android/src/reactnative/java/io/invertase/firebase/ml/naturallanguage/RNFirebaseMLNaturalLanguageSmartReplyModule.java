package io.invertase.firebase.ml.naturallanguage;

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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import java.util.Objects;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

class RNFirebaseMLNaturalLanguageSmartReplyModule extends ReactNativeFirebaseModule {
  private static final String SERVICE_NAME = "MLNaturalLanguageSmartReply";
  private final UniversalFirebaseMLNaturalLanguageSmartReplyModule module;

  RNFirebaseMLNaturalLanguageSmartReplyModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE_NAME);
    this.module = new UniversalFirebaseMLNaturalLanguageSmartReplyModule(
      reactContext,
      SERVICE_NAME
    );
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();
    module.onTearDown();
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseSmartReply.html#public-tasksmartreplysuggestionresultsuggestreplieslistfirebasetextmessage-textmessages
   */
  @ReactMethod
  public void getSuggestedReplies(String appName, int conversationId, Promise promise) {
    module
      .getSuggestedReplies(appName, conversationId)
      .addOnCompleteListener(getExecutor(), task -> {
        if (task.isSuccessful()) {
          promise.resolve(Arguments.fromList(Objects.requireNonNull(task.getResult())));
        } else {
          String[] errorCodeAndMessage = UniversalFirebaseMLNaturalLanguageCommon.getErrorCodeAndMessageFromException(
            task.getException());
          rejectPromiseWithCodeAndMessage(
            promise,
            errorCodeAndMessage[0],
            errorCodeAndMessage[1],
            errorCodeAndMessage[2]
          );
        }
      });
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#createForLocalUser(java.lang.String,%20long)
   */
  @ReactMethod
  public void addLocalUserMessage(
    String appName,
    int conversationId,
    String message,
    double timestamp
  ) {
    module.addLocalUserMessage(conversationId, message, (long) timestamp);
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#public-static-firebasetextmessagecreateforremoteuserstring-messagetext,-long-timestampmillis,-string-remoteuserid
   */
  @ReactMethod
  public void addRemoteUserMessage(
    String appName,
    int conversationId,
    String message,
    double timestamp,
    String remoteUserId
  ) {
    module
      .addRemoteUserMessage(conversationId, message, (long) timestamp, remoteUserId)
      .addOnFailureListener(exception -> Log.e("SHOOBY", "DOOBY", exception));
  }

  @ReactMethod
  public void destroyConversation(String appName, int conversationId) {
    module.destroyConversation(conversationId);
  }

  @ReactMethod
  public void clearMessages(String appName, int conversationId) {
    module.clearMessages(conversationId);
  }
}
