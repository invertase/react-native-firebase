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

const text = 'a message';
const timestamp = Date.now();
const remoteUserId = 'invertase';

describe('mlKitLanguage() -> Smart Replies', () => {
  describe('newSmartReplyConversation()', () => {
    it('returns a new instance of SmartReplyConversation', async () => {
      const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
      conversation.should.be.instanceOf(
        jet.require('packages/ml-natural-language/lib/SmartReplyConversation'),
      );
    });

    it('throws an error if arg is not a number', async () => {
      try {
        firebase.mlKitLanguage().newSmartReplyConversation(false);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a number or undefined');
        return Promise.resolve();
      }
    });

    it('correctly limits local message history', async () => {
      const conversation = firebase.mlKitLanguage().newSmartReplyConversation(5);
      for (let i = 0; i < 10; i++) {
        conversation.addLocalUserMessage(`${i}`, timestamp);
        conversation.messages.length.should.equal(i >= 5 ? 5 : i + 1);
        if (i >= 5) {
          // checking of older first gets sliced off
          conversation.messages[0].text.should.equal(`${i + 1 - 5}`);
        }
      }
    });

    it('correctly limits remote message history', async () => {
      const conversation = firebase.mlKitLanguage().newSmartReplyConversation(5);
      for (let i = 0; i < 10; i++) {
        conversation.addRemoteUserMessage(`${i}`, timestamp, remoteUserId);
        conversation.messages.length.should.equal(i >= 5 ? 5 : i + 1);
        if (i >= 5) {
          // checking of older first gets sliced off
          conversation.messages[0].text.should.equal(`${i + 1 - 5}`);
        }
      }
    });
  });

  describe('SmartReplyConversation', () => {
    describe('clearMessages', () => {
      it('clears all messages', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation(5);
        for (let i = 0; i < 10; i++) {
          conversation.addRemoteUserMessage(`${i}`, timestamp, remoteUserId);
          conversation.messages.length.should.equal(i >= 5 ? 5 : i + 1);
        }

        conversation.messages.length.should.equal(5);
        conversation.clearMessages();
        conversation.messages.length.should.equal(0);
      });
    });
    describe('addRemoteUserMessage', () => {
      it('adds a message for a remote user', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        conversation.addRemoteUserMessage(text, timestamp, remoteUserId);

        conversation.messages.length.should.equal(1);
        conversation.messages[0].text.should.equal(text);
        conversation.messages[0].timestamp.should.equal(timestamp);
        conversation.messages[0].remoteUserId.should.equal(remoteUserId);
      });

      it('throws if message is invalid', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        try {
          conversation.addRemoteUserMessage(false, timestamp, remoteUserId);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql(`'text' must be a string value`);
          return Promise.resolve();
        }
      });

      it('throws if timestamp is invalid', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        try {
          conversation.addRemoteUserMessage(text, false, remoteUserId);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql(`'timestamp' must be a number value`);
          return Promise.resolve();
        }
      });

      it('throws if remoteUserId is invalid', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        try {
          conversation.addRemoteUserMessage(text, timestamp, false);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql(`'remoteUserId' must be a string value`);
          return Promise.resolve();
        }
      });
    });

    describe('addLocalUserMessage', () => {
      it('adds a message for a remote user', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        conversation.addLocalUserMessage(text, timestamp);

        conversation.messages.length.should.equal(1);
        conversation.messages[0].text.should.equal(text);
        conversation.messages[0].timestamp.should.equal(timestamp);
      });

      it('throws if message is invalid', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        try {
          conversation.addLocalUserMessage(false, timestamp);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql(`'text' must be a string value`);
          return Promise.resolve();
        }
      });

      it('throws if timestamp is invalid', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        try {
          conversation.addLocalUserMessage(text, false);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql(`'timestamp' must be a number value`);
          return Promise.resolve();
        }
      });
    });

    describe('getSuggestedReplies', () => {
      it('returns an array of suggested replies and their scores', async () => {
        const conversation = firebase.mlKitLanguage().newSmartReplyConversation();
        conversation.addLocalUserMessage('Hey, long time no speak!', timestamp);
        conversation.addRemoteUserMessage(
          'I know right, it has been a while..',
          timestamp,
          remoteUserId,
        );
        conversation.addLocalUserMessage('We should catchup some time!', timestamp);
        conversation.addRemoteUserMessage(
          'Definitely, how about we go for lunch this week?',
          timestamp,
          remoteUserId,
        );

        const replies = await conversation.getSuggestedReplies();

        replies.should.be.an.Array();
        replies.length.should.equal(3);
        replies[0].text.should.equal('Sounds good!');
        // TODO not supported on ios SDK
        // replies[0].confidence.should.be.a.Number();
        // replies[0].confidence.should.be.greaterThan(0.04);

        conversation.addLocalUserMessage(replies[0].text, timestamp);
        conversation.addRemoteUserMessage(
          'Great, does Friday work for you?',
          timestamp,
          remoteUserId,
        );

        const replies2 = await conversation.getSuggestedReplies();
        replies2[0].text.should.equal('Yep!');
      });
    });
  });
});
