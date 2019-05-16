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

import android.content.Context;
import android.os.Bundle;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;

import java.util.List;
import java.util.concurrent.Executors;

import io.invertase.firebase.common.UniversalFirebaseModule;

@SuppressWarnings({"WeakerAccess", "UnusedReturnValue"})
class UniversalFirebaseMLNaturalLanguageSmartReplyModule extends UniversalFirebaseModule {
  UniversalFirebaseMLNaturalLanguageSmartReplyModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  @Override
  public void onTearDown() {
    super.onTearDown();
    UniversalFirebaseMLNaturalLanguageSmartReplyConversation.destroyAllConversations();
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseSmartReply.html#public-tasksmartreplysuggestionresultsuggestreplieslistfirebasetextmessage-textmessages
   */
  public Task<List<Bundle>> getSuggestedReplies(String appName, int conversationId) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseNaturalLanguage naturalLanguage = FirebaseNaturalLanguage.getInstance(firebaseApp);
      UniversalFirebaseMLNaturalLanguageSmartReplyConversation conversation = UniversalFirebaseMLNaturalLanguageSmartReplyConversation
        .getOrCreateConversation(conversationId);
      return Tasks.await(conversation.getSuggestedReplies(Executors.newSingleThreadExecutor(), naturalLanguage));
    });

  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#createForLocalUser(java.lang.String,%20long)
   */
  public Task<Void> addLocalUserMessage(
    int conversationId,
    String message,
    long timestamp
  ) {
    return Tasks.call(getExecutor(), () -> {
      UniversalFirebaseMLNaturalLanguageSmartReplyConversation conversation = UniversalFirebaseMLNaturalLanguageSmartReplyConversation
        .getOrCreateConversation(conversationId);
      conversation.addLocalUserMessage(message, timestamp);
      return null;
    });
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#public-static-firebasetextmessagecreateforremoteuserstring-messagetext,-long-timestampmillis,-string-remoteuserid
   */
  public Task<Void> addRemoteUserMessage(
    int conversationId,
    String message,
    long timestamp,
    String remoteUserId
  ) {
    return Tasks.call(getExecutor(), () -> {
      UniversalFirebaseMLNaturalLanguageSmartReplyConversation conversation = UniversalFirebaseMLNaturalLanguageSmartReplyConversation
        .getOrCreateConversation(conversationId);
      conversation.addRemoteUserMessage(message, timestamp, remoteUserId);
      return null;
    });
  }

  public Task<Void> destroyConversation(int conversationId) {
    return Tasks.call(getExecutor(), () -> {
      UniversalFirebaseMLNaturalLanguageSmartReplyConversation.destroyConversation(conversationId);
      return null;
    });
  }

  public Task<Void> clearMessages(int conversationId) {
    return Tasks.call(getExecutor(), () -> {
      UniversalFirebaseMLNaturalLanguageSmartReplyConversation.clearMessages(conversationId);
      return null;
    });
  }
}
