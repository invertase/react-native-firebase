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

describe('mlKitLanguage() -> Smart Replies', () => {
  describe('newSmartReplyConversation()', () => {
    it('returns a new instance of SmartReplyConversation', async () => {
      const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
      conversation.should.be.instanceOf(
        jet.require('packages/ml-natural-language/lib/SmartReplyConversation'),
      );

      conversation.addRemoteUserMessage('Hey, do you want to grab some lunch?', Date.now(), 'user1');
      // conversation.addLocalUserMessage('hey, are we still on for the meeting today?');
      // conversation.addLocalUserMessage('hey, are we still on for the meeting today?');

      const replies = await conversation.getSuggestedReplies();

      console.dir(replies);
    });
  });
});
