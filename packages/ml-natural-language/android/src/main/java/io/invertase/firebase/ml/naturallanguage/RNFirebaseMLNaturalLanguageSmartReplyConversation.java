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

import android.util.SparseArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.ml.naturallanguage.FirebaseNaturalLanguage;
import com.google.firebase.ml.naturallanguage.smartreply.FirebaseTextMessage;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestion;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestionResult;

import java.util.ArrayList;
import java.util.List;

class RNFirebaseMLNaturalLanguageSmartReplyConversation {
  private static final SparseArray<RNFirebaseMLNaturalLanguageSmartReplyConversation> existingConversations = new SparseArray<>();
  private List<FirebaseTextMessage> firebaseTextMessages = new ArrayList<>();

  static RNFirebaseMLNaturalLanguageSmartReplyConversation getOrCreateConversation(int conversationId) {
    RNFirebaseMLNaturalLanguageSmartReplyConversation existingConversation = existingConversations.get(conversationId);
    if (existingConversation != null) return existingConversation;
    RNFirebaseMLNaturalLanguageSmartReplyConversation newConversation = new RNFirebaseMLNaturalLanguageSmartReplyConversation();
    existingConversations.setValueAt(conversationId, newConversation);
    return newConversation;
  }

  static void destroyConversation(int conversationId) {
    existingConversations.delete(conversationId);
  }

  static void clearMessages(int conversationId) {
    RNFirebaseMLNaturalLanguageSmartReplyConversation existingConversation = existingConversations.get(conversationId);
    if (existingConversation != null) {
      existingConversation.firebaseTextMessages.clear();
    }
  }

  static void destroyAllConversations() {
    existingConversations.clear();
  }


  /**
   * @url  https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#createForLocalUser(java.lang.String,%20long)
   */
  void addLocalUserMessage(String message, long timestamp) {
    firebaseTextMessages.add(FirebaseTextMessage.createForLocalUser(message, timestamp));
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseTextMessage.html#public-static-firebasetextmessagecreateforremoteuserstring-messagetext,-long-timestampmillis,-string-remoteuserid
   */
  void addRemoteUserMessage(String message, long timestamp, String remoteUserId) {
    firebaseTextMessages.add(FirebaseTextMessage.createForRemoteUser(message, timestamp, remoteUserId));
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseSmartReply.html#public-tasksmartreplysuggestionresultsuggestreplieslistfirebasetextmessage-textmessages
   */
  Task<WritableArray> getSuggestedReplies(FirebaseNaturalLanguage instance) {
    return instance.getSmartReply().suggestReplies(firebaseTextMessages).continueWith(task -> {
      WritableArray suggestedRepliesArray = Arguments.createArray();
      SmartReplySuggestionResult suggestionResult = task.getResult();

      if (suggestionResult == null) return suggestedRepliesArray;

      List<SmartReplySuggestion> suggestedRepliesList = suggestionResult.getSuggestions();
      for (SmartReplySuggestion suggestion : suggestedRepliesList) {
        WritableMap suggestionMap = Arguments.createMap();
        suggestionMap.putString("text", suggestion.getText());
        suggestionMap.putDouble("confidence", suggestion.getConfidence());
        suggestedRepliesArray.pushMap(suggestionMap);
      }

      return suggestedRepliesArray;
    });
  }
}
