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

describe('remoteMessage modular', function () {
  describe('firebase v8 compatibility', function () {
    describe('messaging().sendMessage(*)', function () {
      it('throws if used on ios', function () {
        if (Platform.ios) {
          try {
            firebase.messaging().sendMessage(123);
            return Promise.reject(new Error('Did not throw Error.'));
          } catch (e) {
            e.message.should.containEql(
              'firebase.messaging().sendMessage() is only supported on Android devices.',
            );
            return Promise.resolve();
          }
        } else {
          Promise.resolve();
        }
      });

      it('throws if no object provided', function () {
        if (Platform.android) {
          try {
            firebase.messaging().sendMessage(123);
            return Promise.reject(new Error('Did not throw Error.'));
          } catch (e) {
            e.message.should.containEql("'remoteMessage' expected an object value");
            return Promise.resolve();
          }
        } else {
          this.skip();
        }
      });

      it('uses default values', async function () {
        if (Platform.android) {
          firebase.messaging().sendMessage({});
        } else {
          this.skip();
        }
      });

      describe('to', function () {
        it('throws if to is not a string', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                to: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.to' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom to value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              to: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('messageId', function () {
        it('throws if messageId is not a string', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                messageId: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.messageId' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom messageId value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              messageId: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('ttl', function () {
        it('throws if not a number', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                ttl: '123',
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("remoteMessage.ttl' expected a number value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('throws if negative number', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                ttl: -2,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('throws if float number', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                ttl: 123.4,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom ttl value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              ttl: 123,
            });
          } else {
            this.skip();
          }
        });
      });

      describe('data', function () {
        it('throws if data not an object', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                data: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.data' expected an object value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom data value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              data: {
                foo: 'bar',
                fooObject: { image: 'testURL' },
              },
            });
          } else {
            this.skip();
          }
        });
      });

      describe('collapseKey', function () {
        it('throws if collapseKey is not a string', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                collapseKey: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.collapseKey' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom collapseKey value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              collapseKey: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('messageType', function () {
        it('throws if messageType is not a string', function () {
          if (Platform.android) {
            try {
              firebase.messaging().sendMessage({
                messageType: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.messageType' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom messageType value', async function () {
          if (Platform.android) {
            await firebase.messaging().sendMessage({
              messageType: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });
    });
  });

  describe('modular', function () {
    describe('messaging().sendMessage(*)', function () {
      it('throws if used on ios', function () {
        const { getMessaging, sendMessage } = messagingModular;
        if (Platform.ios) {
          try {
            sendMessage(getMessaging(), 123);
            return Promise.reject(new Error('Did not throw Error.'));
          } catch (e) {
            e.message.should.containEql(
              'firebase.messaging().sendMessage() is only supported on Android devices.',
            );
            return Promise.resolve();
          }
        } else {
          Promise.resolve();
        }
      });

      it('throws if no object provided', function () {
        const { getMessaging, sendMessage } = messagingModular;
        if (Platform.android) {
          try {
            sendMessage(getMessaging(), 123);
            return Promise.reject(new Error('Did not throw Error.'));
          } catch (e) {
            e.message.should.containEql("'remoteMessage' expected an object value");
            return Promise.resolve();
          }
        } else {
          this.skip();
        }
      });

      it('uses default values', async function () {
        const { getMessaging, sendMessage } = messagingModular;
        if (Platform.android) {
          sendMessage(getMessaging(), {});
        } else {
          this.skip();
        }
      });

      describe('to', function () {
        it('throws if to is not a string', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                to: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.to' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom to value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              to: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('messageId', function () {
        it('throws if messageId is not a string', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                messageId: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.messageId' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom messageId value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              messageId: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('ttl', function () {
        it('throws if not a number', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                ttl: '123',
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("remoteMessage.ttl' expected a number value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('throws if negative number', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                ttl: -2,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('throws if float number', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                ttl: 123.4,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.ttl' expected a positive integer value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom ttl value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              ttl: 123,
            });
          } else {
            this.skip();
          }
        });
      });

      describe('data', function () {
        it('throws if data not an object', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                data: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.data' expected an object value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom data value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              data: {
                foo: 'bar',
                fooObject: { image: 'testURL' },
              },
            });
          } else {
            this.skip();
          }
        });
      });

      describe('collapseKey', function () {
        it('throws if collapseKey is not a string', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                collapseKey: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.collapseKey' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom collapseKey value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              collapseKey: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });

      describe('messageType', function () {
        it('throws if messageType is not a string', function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            try {
              sendMessage(getMessaging(), {
                messageType: 123,
              });
              return Promise.reject(new Error('Did not throw Error.'));
            } catch (e) {
              e.message.should.containEql("'remoteMessage.messageType' expected a string value");
              return Promise.resolve();
            }
          } else {
            this.skip();
          }
        });

        it('accepts custom messageType value', async function () {
          const { getMessaging, sendMessage } = messagingModular;
          if (Platform.android) {
            await sendMessage(getMessaging(), {
              messageType: 'foobar',
            });
          } else {
            this.skip();
          }
        });
      });
    });
  });
});
