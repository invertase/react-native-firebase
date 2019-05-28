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
import com.google.firebase.ml.naturallanguage.smartreply.FirebaseTextMessage;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestion;
import com.google.firebase.ml.naturallanguage.smartreply.SmartReplySuggestionResult;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"WeakerAccess", "UnusedReturnValue"})
class UniversalFirebaseMLNaturalLanguageSmartReplyModule extends UniversalFirebaseModule {
  UniversalFirebaseMLNaturalLanguageSmartReplyModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  @Override
  public void onTearDown() {
    super.onTearDown();
  }

  @SuppressWarnings("unchecked")
  private List<FirebaseTextMessage> buildFirebaseTextMessagesList(List<Object> messages) {
    List<FirebaseTextMessage> firebaseTextMessages = new ArrayList<>(messages.size());

    for (Object message : messages) {
      Map<String, Object> messageMap = (Map<String, Object>) message;
      if (messageMap.containsKey("remoteUserId")) {
        firebaseTextMessages.add(
          FirebaseTextMessage.createForRemoteUser(
            (String) messageMap.get("text"),
            (long) ((double) messageMap.get("timestamp")),
            (String) messageMap.get("remoteUserId")
          )
        );
      } else {
        firebaseTextMessages.add(
          FirebaseTextMessage.createForLocalUser(
            (String) messageMap.get("text"),
            (long) ((double) messageMap.get("timestamp"))
          )
        );
      }
    }

    return firebaseTextMessages;
  }

  /**
   * @url https://firebase.google.com/docs/reference/android/com/google/firebase/ml/naturallanguage/smartreply/FirebaseSmartReply.html#public-tasksmartreplysuggestionresultsuggestreplieslistfirebasetextmessage-textmessages
   */
  public Task<List<Bundle>> getSuggestedReplies(String appName, List<Object> messages) {
    return Tasks.call(getExecutor(), () -> {
      List<FirebaseTextMessage> firebaseTextMessages = buildFirebaseTextMessagesList(messages);
      FirebaseNaturalLanguage instance = FirebaseNaturalLanguage.getInstance(FirebaseApp.getInstance(appName));

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
