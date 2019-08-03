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
  describe('suggestReplies()', () => {
    it('throws if messages is not an array', () => {
      try {
        firebase.mlKitLanguage().suggestReplies({});
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql("'messages' must be an array value");
        return Promise.resolve();
      }
    });

    it('resolves an empty array if empty array if provided', async () => {
      const replies = await firebase.mlKitLanguage().suggestReplies([]);
      replies.should.be.Array();
      replies.length.should.eql(0);
    });

    it('returns suggested replies', async () => {
      const replies = await firebase.mlKitLanguage().suggestReplies([
        { text: 'We should catchup some time!' },
        { text: 'I know right, it has been a while..', userId: '123', isLocalUser: false },
        { text: 'Lets meet up!' },
        {
          text: 'Definitely, how about we go for lunch this week?',
          userId: '123',
          isLocalUser: false,
        },
      ]);

      replies.should.be.Array();
      replies.length.should.equal(3);

      replies.forEach($ => {
        $.text.should.be.String();
        $.text.length.should.be.greaterThan(0);
      });

      const replies2 = await firebase
        .mlKitLanguage()
        .suggestReplies([
          { text: replies[0].text },
          { text: 'Great, does Friday work for you?', userId: '123', isLocalUser: false },
        ]);

      replies2[0].text.should.be.String();
      replies2[0].text.length.should.be.greaterThan(0);
    });

    describe('TextMessage', () => {
      it('throws if message is not an object', () => {
        try {
          firebase.mlKitLanguage().suggestReplies([123]);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql("'textMessage' expected an object value");
          return Promise.resolve();
        }
      });

      describe('.text', () => {
        it('throws if text option not provided', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{}]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.text' expected a string value");
            return Promise.resolve();
          }
        });

        it('throws if text option is not a string', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{ text: 123 }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.text' expected a string value");
            return Promise.resolve();
          }
        });

        it('throws if text length is zero', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{ text: '' }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.text' expected string value to not be empty");
            return Promise.resolve();
          }
        });
      });

      describe('.userId', () => {
        it('throws if local user true and id provided', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{ text: 'foo', userId: 'bar' }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql(
              "'textMessage.userId' expected 'textMessage.isLocalUser' to be false when setting a user ID",
            );
            return Promise.resolve();
          }
        });

        it('throws if text userId not provided', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{ text: 'foo', isLocalUser: false }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.userId' expected a string value");
            return Promise.resolve();
          }
        });

        it('throws if userId option is not a string', () => {
          try {
            firebase
              .mlKitLanguage()
              .suggestReplies([{ text: 'foo', isLocalUser: false, userId: 123 }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.userId' expected a string value");
            return Promise.resolve();
          }
        });

        it('throws if userId length is zero', () => {
          try {
            firebase
              .mlKitLanguage()
              .suggestReplies([{ text: 'foo', isLocalUser: false, userId: '' }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql(
              "'textMessage.userId' expected string value to not be empty",
            );
            return Promise.resolve();
          }
        });

        it('sets a user id', () => {
          firebase
            .mlKitLanguage()
            .suggestReplies([{ text: 'foo', isLocalUser: false, userId: 'bar' }]);
        });
      });

      describe('.timestamp', () => {
        it('throws if timestamp is not a number', () => {
          try {
            firebase.mlKitLanguage().suggestReplies([{ text: 'foo', timestamp: 'baz' }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.timestamp' expected number value");
            return Promise.resolve();
          }
        });

        it('sets a timestamp', () => {
          firebase.mlKitLanguage().suggestReplies([{ text: 'foo', timestamp: Date.now() + 123 }]);
        });
      });

      describe('.isLocalUser', () => {
        it('throws if isLocalUser is not a boolean', () => {
          try {
            firebase
              .mlKitLanguage()
              .suggestReplies([{ text: 'foo', userId: 'bar', isLocalUser: 'baz' }]);
            return Promise.reject(new Error('Did not throw'));
          } catch (e) {
            e.message.should.containEql("'textMessage.isLocalUser' expected boolean value");
            return Promise.resolve();
          }
        });
      });
    });
  });
});
