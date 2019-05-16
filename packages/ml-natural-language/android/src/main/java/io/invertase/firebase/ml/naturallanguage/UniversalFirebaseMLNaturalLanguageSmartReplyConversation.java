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

import android.os.Bundle;
import android.util.SparseArray;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;
import com.google.firebase.ml.naturallanguage.smartreply.FirebaseTextMessage;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestion;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestionResult;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;

class UniversalFirebaseMLNaturalLanguageSmartReplyConversation {
  private static final SparseArray<UniversalFirebaseMLNaturalLanguageSmartReplyConversation> existingConversations = new SparseArray<>();
  private List<FirebaseTextMessage> firebaseTextMessages = new ArrayList<>();

  static UniversalFirebaseMLNaturalLanguageSmartReplyConversation getOrCreateConversation(int conversationId) {
    UniversalFirebaseMLNaturalLanguageSmartReplyConversation existingConversation = existingConversations
      .get(conversationId);
    if (existingConversation != null) return existingConversation;

    UniversalFirebaseMLNaturalLanguageSmartReplyConversation newConversation = new UniversalFirebaseMLNaturalLanguageSmartReplyConversation();
    existingConversations.put(conversationId, newConversation);
    return newConversation;
  }

  static void destroyConversation(int conversationId) {
    existingConversations.delete(conversationId);
  }

  static void clearMessages(int conversationId) {
    UniversalFirebaseMLNaturalLanguageSmartReplyConversation existingConversation = existingConversations
      .get(
        conversationId);
    if (existingConversation != null) {
      existingConversation.firebaseTextMessages.clear();
    }
  }

  static void destroyAllConversations() {
    existingConversations.clear();
  }


  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#createForLocalUser(java.lang.String,%20long)
   */
  void addLocalUserMessage(String message, long timestamp) {
    firebaseTextMessages.add(FirebaseTextMessage.createForLocalUser(message, timestamp));
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#public-static-firebasetextmessagecreateforremoteuserstring-messagetext,-long-timestampmillis,-string-remoteuserid
   */
  void addRemoteUserMessage(String message, long timestamp, String remoteUserId) {
    firebaseTextMessages.add(FirebaseTextMessage.createForRemoteUser(
      message,
      timestamp,
      remoteUserId
    ));
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseSmartReply.html#public-tasksmartreplysuggestionresultsuggestreplieslistfirebasetextmessage-textmessages
   */
  Task<List<Bundle>> getSuggestedReplies(
    ExecutorService executor,
    FirebaseNaturalLanguage instance
  ) {
    return Tasks.call(executor, () -> {
      SmartReplySuggestionResult suggestionResult = Tasks.await(
        instance.getSmartReply().suggestReplies(firebaseTextMessages)
      );

      if (suggestionResult == null) return new ArrayList<>(0);

      List<SmartReplySuggestion> suggestedRepliesListRaw = suggestionResult.getSuggestions();
      List<Bundle> suggestedRepliesListFormatted = new ArrayList<>(
        suggestedRepliesListRaw.size());


      for (SmartReplySuggestion suggestedReplyRaw : suggestedRepliesListRaw) {
        Bundle suggestReplyFormatted = new Bundle(2);
        suggestReplyFormatted.putString("text", suggestedReplyRaw.getText());
        suggestReplyFormatted.putFloat("confidence", suggestedReplyRaw.getConfidence());
        suggestedRepliesListFormatted.add(suggestReplyFormatted);
      }

      return suggestedRepliesListFormatted;
    });
  }
}
