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

const TEST_EMAIL = 'test@example.com';
const TEST_PASS = 'test1234';

const DISABLED_EMAIL = 'disabled@example.com';
const DISABLED_PASS = 'test1234';

const { clearAllUsers, disableUser, getLastOob, resetPassword } = require('./helpers');

describe('auth()', () => {
  before(async () => {
    await clearAllUsers();
    await firebase.auth().createUserWithEmailAndPassword(TEST_EMAIL, TEST_PASS);
    const disabledUserCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(DISABLED_EMAIL, DISABLED_PASS);
    await disableUser(disabledUserCredential.user.uid);
  });

  beforeEach(async () => {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });

  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.auth);
      app.auth().app.should.equal(app);
    });

    // removing as pending if module.options.hasMultiAppSupport = true
    it('supports multiple apps', async () => {
      firebase.auth().app.name.should.equal('[DEFAULT]');

      firebase
        .auth(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .auth()
        .app.name.should.equal('secondaryFromNative');
    });
  });

  describe('applyActionCode()', () => {
    // Needs a different setup to work against the auth emulator
    xit('works as expected', async () => {
      await firebase
        .auth()
        .applyActionCode('fooby shooby dooby')
        .then($ => $);
    });
    it('errors on invalid code', async () => {
      try {
        await firebase
          .auth()
          .applyActionCode('fooby shooby dooby')
          .then($ => $);
      } catch (e) {
        e.message.should.containEql('code is invalid');
      }
    });
  });

  describe('checkActionCode()', () => {
    it('errors on invalid code', async () => {
      try {
        await firebase.auth().checkActionCode('fooby shooby dooby');
      } catch (e) {
        e.message.should.containEql('code is invalid');
      }
    });
  });

  describe('reload()', () => {
    it('Meta data returns as expected with annonymous sign in', async () => {
      await firebase.auth().signInAnonymously();
      await Utils.sleep(50);
      const firstUser = firebase.auth().currentUser;
      await firstUser.reload();

      await firebase.auth().signOut();

      await firebase.auth().signInAnonymously();
      await Utils.sleep(50);
      const secondUser = firebase.auth().currentUser;
      await secondUser.reload();

      firstUser.metadata.creationTime.should.not.equal(secondUser.metadata.creationTime);
    });

    it('Meta data returns as expected with email and password sign in', async () => {
      const random = Utils.randString(12, '#aA');
      const email1 = `${random}@${random}.com`;
      const pass = random;

      await firebase.auth().createUserWithEmailAndPassword(email1, pass);
      const firstUser = firebase.auth().currentUser;
      await firstUser.reload();

      await firebase.auth().signOut();

      const anotherRandom = Utils.randString(12, '#aA');
      const email2 = `${anotherRandom}@${anotherRandom}.com`;

      await firebase.auth().createUserWithEmailAndPassword(email2, pass);
      const secondUser = firebase.auth().currentUser;
      await secondUser.reload();

      firstUser.metadata.creationTime.should.not.equal(secondUser.metadata.creationTime);
    });
  });

  describe('confirmPasswordReset()', () => {
    it('errors on invalid code via API', async () => {
      try {
        await firebase.auth().confirmPasswordReset('fooby shooby dooby', 'passwordthing');
      } catch (e) {
        e.message.should.containEql('code is invalid');
      }
    });
  });

  describe('signInWithCustomToken()', () => {
    // Needs a different setup when running against the emulator
    xit('signs in with a admin sdk created custom auth token', async () => {
      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(TEST_EMAIL);
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(firebase.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();
        additionalUserInfo.isNewUser.should.equal(false);

        return currentUser;
      };

      const user = await firebase
        .auth()
        .signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS)
        .then(successCb);

      const IdToken = await firebase.auth().currentUser.getIdToken();

      firebase.auth().signOut();
      await Utils.sleep(50);

      const token = await new TestAdminApi(IdToken).auth().createCustomToken(user.uid, {});

      await firebase.auth().signInWithCustomToken(token);

      firebase.auth().currentUser.email.should.equal(TEST_EMAIL);
    });
  });

  describe('onAuthStateChanged()', () => {
    it('calls callback with the current user and when auth state changes', async () => {
      await firebase.auth().signInAnonymously();

      await Utils.sleep(50);

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();

      // Assertions

      await Utils.sleep(50);

      callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Tear down

      unsubscribe();
    });

    it('accept observer instead callback as well', async () => {
      await firebase.auth().signInAnonymously();

      await Utils.sleep(50);

      // Test
      const observer = {
        next(user) {
          // Test this access
          this.onNext();
          this.user = user;
        },
      };

      let unsubscribe;
      await new Promise(resolve => {
        observer.onNext = resolve;
        unsubscribe = firebase.auth().onAuthStateChanged(observer);
      });
      should.exist(observer.user);

      // Sign out

      await firebase.auth().signOut();

      // Assertions

      await Utils.sleep(50);

      should.not.exist(observer.user);

      // Tear down

      unsubscribe();
    });

    it('stops listening when unsubscribed', async () => {
      await firebase.auth().signInAnonymously();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();

      await Utils.sleep(50);

      // Assertions

      callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Unsubscribe

      unsubscribe();

      // Sign back in

      await firebase.auth().signInAnonymously();

      // Assertions

      callback.should.be.calledTwice();

      // Tear down

      await firebase.auth().signOut();
      await Utils.sleep(50);
    });

    it('returns the same user with multiple subscribers #1815', async () => {
      const callback = sinon.spy();

      let unsubscribe1;
      let unsubscribe2;
      let unsubscribe3;

      await new Promise(resolve => {
        unsubscribe1 = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      await new Promise(resolve => {
        unsubscribe2 = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      await new Promise(resolve => {
        unsubscribe3 = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledThrice();
      callback.should.be.calledWith(null);

      await firebase.auth().signInAnonymously();
      await Utils.sleep(800);

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();

      callback.should.be.callCount(6);

      const uid = callback.getCall(3).args[0].uid;

      callback.getCall(4).args[0].uid.should.eql(uid);
      callback.getCall(5).args[0].uid.should.eql(uid);

      await firebase.auth().signOut();
      await Utils.sleep(50);
    });
  });

  describe('onIdTokenChanged()', () => {
    it('calls callback with the current user and when auth state changes', async () => {
      await firebase.auth().signInAnonymously();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onIdTokenChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();
      await Utils.sleep(50);

      // Assertions

      callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Tear down

      unsubscribe();
    });

    it('stops listening when unsubscribed', async () => {
      await firebase.auth().signInAnonymously();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onIdTokenChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();
      await Utils.sleep(50);

      // Assertions

      callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Unsubscribe

      unsubscribe();

      // Sign back in

      await firebase.auth().signInAnonymously();

      // Assertions

      callback.should.be.calledTwice();

      // Tear down

      await firebase.auth().signOut();
      await Utils.sleep(50);
    });

    it('listens to a null user when auth result is not defined', async () => {
      let unsubscribe;

      const callback = sinon.spy();

      await new Promise(resolve => {
        unsubscribe = firebase.auth().onIdTokenChanged(user => {
          callback(user);
          resolve();
        });

        unsubscribe();
      });
    });
  });

  describe('onUserChanged()', () => {
    it('calls callback with the current user and when auth state changes', async () => {
      await firebase.auth().signInAnonymously();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onUserChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();

      await Utils.sleep(500);

      // Assertions

      callback.should.be.calledWith(null);
      // Because of the way onUserChanged works, it will be called double
      // - once for onAuthStateChanged
      // - once for onIdTokenChanged
      callback.should.have.callCount(4);

      // Tear down

      unsubscribe();
    });

    it('stops listening when unsubscribed', async () => {
      await firebase.auth().signInAnonymously();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onUserChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();
      await Utils.sleep(50);

      // Assertions

      callback.should.be.calledWith(null);
      // Because of the way onUserChanged works, it will be called double
      // - once for onAuthStateChanged
      // - once for onIdTokenChanged
      callback.should.have.callCount(4);

      // Unsubscribe

      unsubscribe();

      // Sign back in

      await firebase.auth().signInAnonymously();

      // Assertions

      callback.should.have.callCount(4);

      // Tear down

      await firebase.auth().signOut();
    });
  });

  describe('signInAnonymously()', () => {
    it('it should sign in anonymously', () => {
      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(firebase.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();

        return firebase.auth().signOut();
      };

      return firebase
        .auth()
        .signInAnonymously()
        .then(successCb);
    });
  });

  describe('signInWithEmailAndPassword()', () => {
    it('it should login with email and password', () => {
      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(TEST_EMAIL);
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(firebase.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();
        additionalUserInfo.isNewUser.should.equal(false);

        return firebase.auth().signOut();
      };

      return firebase
        .auth()
        .signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS)
        .then(successCb);
    });

    it('it should error on login if user is disabled', () => {
      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-disabled');
        error.message.should.containEql('The user account has been disabled by an administrator.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithEmailAndPassword(DISABLED_EMAIL, DISABLED_PASS)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if password incorrect', () => {
      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/wrong-password');
        error.message.should.containEql(
          'The password is invalid or the user does not have a password.',
        );
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS + '666')
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if user not found', () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-not-found');
        error.message.should.containEql(
          'There is no user record corresponding to this identifier. The user may have been deleted.',
        );
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });
  });

  describe('signInWithCredential()', () => {
    it('it should login with email and password', () => {
      const credential = firebase.auth.EmailAuthProvider.credential(TEST_EMAIL, TEST_PASS);

      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(TEST_EMAIL);
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(firebase.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();
        additionalUserInfo.isNewUser.should.equal(false);

        return firebase.auth().signOut();
      };

      return firebase
        .auth()
        .signInWithCredential(credential)
        .then(successCb);
    });

    it('it should error on login if user is disabled', () => {
      const credential = firebase.auth.EmailAuthProvider.credential(DISABLED_EMAIL, DISABLED_PASS);

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-disabled');
        error.message.should.containEql('The user account has been disabled by an administrator.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithCredential(credential)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if password incorrect', () => {
      const credential = firebase.auth.EmailAuthProvider.credential(TEST_EMAIL, TEST_PASS + '666');

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/wrong-password');
        error.message.should.containEql(
          'The password is invalid or the user does not have a password.',
        );
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithCredential(credential)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if user not found', () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-not-found');
        error.message.should.containEql(
          'There is no user record corresponding to this identifier. The user may have been deleted.',
        );
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithCredential(credential)
        .then(successCb)
        .catch(failureCb);
    });
  });

  describe('createUserWithEmailAndPassword()', () => {
    it('it should create a user with an email and password', () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      const successCb = newUserCredential => {
        const newUser = newUserCredential.user;
        newUser.uid.should.be.a.String();
        newUser.email.should.equal(email.toLowerCase());
        newUser.emailVerified.should.equal(false);
        newUser.isAnonymous.should.equal(false);
        newUser.providerId.should.equal('firebase');
        newUser.should.equal(firebase.auth().currentUser);
        const { additionalUserInfo } = newUserCredential;
        additionalUserInfo.should.be.an.Object();
        additionalUserInfo.isNewUser.should.equal(true);

        return newUser.delete();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then(successCb);
    });

    it('it should error on create with invalid email', () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}${random}.com.boop.shoop`;
      const pass = random;

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/invalid-email');
        error.message.should.containEql('The email address is badly formatted.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on create if email in use', () => {
      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/email-already-in-use');
        error.message.should.containEql('The email address is already in use by another account.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(TEST_EMAIL, TEST_PASS)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on create if password weak', () => {
      const email = 'testy@testy.com';
      const pass = '123';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/weak-password');
        // cannot test this message - it's different on the web client than ios/android return
        // error.message.should.containEql('The given password is invalid.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });
  });

  describe('fetchSignInMethodsForEmail()', () => {
    it('it should return password provider for an email address', () =>
      new Promise((resolve, reject) => {
        const successCb = providers => {
          providers.should.be.a.Array();
          providers.should.containEql('password');
          resolve();
        };

        const failureCb = () => {
          reject(new Error('Should not have an error.'));
        };

        return firebase
          .auth()
          .fetchSignInMethodsForEmail(TEST_EMAIL)
          .then(successCb)
          .catch(failureCb);
      }));

    it('it should return an empty array for a not found email', () =>
      new Promise((resolve, reject) => {
        const successCb = providers => {
          providers.should.be.a.Array();
          providers.should.be.empty();
          resolve();
        };

        const failureCb = () => {
          reject(new Error('Should not have an error.'));
        };

        return firebase
          .auth()
          .fetchSignInMethodsForEmail('test@i-do-not-exist.com')
          .then(successCb)
          .catch(failureCb);
      }));

    it('it should return an error for a bad email address', () =>
      new Promise((resolve, reject) => {
        const successCb = () => {
          reject(new Error('Should not have successfully resolved.'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/invalid-email');
          error.message.should.containEql('The email address is badly formatted.');
          resolve();
        };

        return firebase
          .auth()
          .fetchSignInMethodsForEmail('foobar')
          .then(successCb)
          .catch(failureCb);
      }));
  });

  describe('signOut()', () => {
    it('it should reject signOut if no currentUser', () =>
      new Promise((resolve, reject) => {
        if (firebase.auth().currentUser) {
          return reject(
            new Error(`A user is currently signed in. ${firebase.auth().currentUser.uid}`),
          );
        }

        const successCb = () => {
          reject(new Error('No signOut error returned'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/no-current-user');
          error.message.should.containEql('No user currently signed in.');
          resolve();
        };

        return firebase
          .auth()
          .signOut()
          .then(successCb)
          .catch(failureCb);
      }));
  });

  describe('delete()', () => {
    it('should delete a user', () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      const successCb = authResult => {
        const newUser = authResult.user;
        newUser.uid.should.be.a.String();
        newUser.email.should.equal(email.toLowerCase());
        newUser.emailVerified.should.equal(false);
        newUser.isAnonymous.should.equal(false);
        newUser.providerId.should.equal('firebase');
        return firebase.auth().currentUser.delete();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then(successCb);
    });
  });

  describe('languageCode', () => {
    it('it should change the language code', async () => {
      await firebase.auth().setLanguageCode('en');

      if (firebase.auth().languageCode !== 'en') {
        throw new Error('Expected language code to be "en".');
      }
      await firebase.auth().setLanguageCode('fr');

      if (firebase.auth().languageCode !== 'fr') {
        throw new Error('Expected language code to be "fr".');
      }
      // expect no error
      await firebase.auth().setLanguageCode(null);

      try {
        await firebase.auth().setLanguageCode(123);
        return Promise.reject('It did not error');
      } catch (e) {
        e.message.should.containEql("expected 'languageCode' to be a string or null value");
      }

      await firebase.auth().setLanguageCode('en');
    });
  });

  describe('getRedirectResult()', () => {
    it('should throw an unsupported error', () => {
      (() => {
        firebase.auth().getRedirectResult();
      }).should.throw(
        'firebase.auth().getRedirectResult() is unsupported by the native Firebase SDKs.',
      );
    });
  });

  describe('setPersistence()', () => {
    it('should throw an unsupported error', () => {
      (() => {
        firebase.auth().setPersistence();
      }).should.throw(
        'firebase.auth().setPersistence() is unsupported by the native Firebase SDKs.',
      );
    });
  });

  describe('signInWithPopup', () => {
    it('should throw an unsupported error', () => {
      (() => {
        firebase.auth().signInWithPopup();
      }).should.throw(
        'firebase.auth().signInWithPopup() is unsupported by the native Firebase SDKs.',
      );
    });
  });

  describe('sendPasswordResetEmail()', () => {
    it('should not error', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      await firebase.auth().createUserWithEmailAndPassword(email, random);

      try {
        await firebase.auth().sendPasswordResetEmail(email);
      } catch (error) {
        throw new Error('sendPasswordResetEmail() caused an error', error);
      } finally {
        await firebase.auth().currentUser.delete();
      }
    });

    it('should verify with valid code', async () => {
      // FIXME Fails on android against auth emulator with:
      // com.google.firebase.FirebaseException: An internal error has occurred.
      if (device.getPlatform() === 'ios') {
        const random = Utils.randString(12, '#a');
        const email = `${random}@${random}.com`;
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, random);
        userCredential.user.emailVerified.should.equal(false);
        firebase.auth().currentUser.email.should.equal(email);
        firebase.auth().currentUser.emailVerified.should.equal(false);

        try {
          await firebase.auth().sendPasswordResetEmail(email);
          const { oobCode } = await getLastOob(email);
          await firebase.auth().verifyPasswordResetCode(oobCode);
        } catch (error) {
          throw new Error('sendPasswordResetEmail() caused an error', error);
        } finally {
          await firebase.auth().currentUser.delete();
        }
      }
    });

    it('should fail to verify with invalid code', async () => {
      const random = Utils.randString(12, '#a');
      const email = `${random}@${random}.com`;
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, random);
      userCredential.user.emailVerified.should.equal(false);
      firebase.auth().currentUser.email.should.equal(email);
      firebase.auth().currentUser.emailVerified.should.equal(false);

      try {
        await firebase.auth().sendPasswordResetEmail(email);
        const { oobCode } = await getLastOob(email);
        await firebase.auth().verifyPasswordResetCode(oobCode + 'badcode');
        throw new Error('Invalid code should throw an error');
      } catch (error) {
        error.message.should.containEql('[auth/invalid-action-code]');
      } finally {
        await firebase.auth().currentUser.delete();
      }
    });

    it('should change password correctly OOB', async () => {
      const random = Utils.randString(12, '#a');
      const email = `${random}@${random}.com`;
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, random);
      userCredential.user.emailVerified.should.equal(false);
      firebase.auth().currentUser.email.should.equal(email);
      firebase.auth().currentUser.emailVerified.should.equal(false);

      try {
        await firebase.auth().sendPasswordResetEmail(email);
        const { oobCode } = await getLastOob(email);
        await resetPassword(oobCode, 'testNewPassword');
        await firebase.auth().signOut();
        await Utils.sleep(50);
        await firebase.auth().signInWithEmailAndPassword(email, 'testNewPassword');
      } catch (error) {
        throw new Error('sendPasswordResetEmail() caused an error', error);
      } finally {
        await firebase.auth().currentUser.delete();
      }
    });

    it('should change password correctly via API', async () => {
      const random = Utils.randString(12, '#a');
      const email = `${random}@${random}.com`;
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, random);
      userCredential.user.emailVerified.should.equal(false);
      firebase.auth().currentUser.email.should.equal(email);
      firebase.auth().currentUser.emailVerified.should.equal(false);

      try {
        await firebase.auth().sendPasswordResetEmail(email);
        const { oobCode } = await getLastOob(email);
        await firebase.auth().confirmPasswordReset(oobCode, 'testNewPassword');
        await firebase.auth().signOut();
        await Utils.sleep(50);
        await firebase.auth().signInWithEmailAndPassword(email, 'testNewPassword');
      } catch (error) {
        throw new Error('sendPasswordResetEmail() caused an error', error);
      } finally {
        await firebase.auth().currentUser.delete();
      }
    });
  });

  describe('signInWithRedirect()', () => {
    it('should throw an unsupported error', () => {
      (() => {
        firebase.auth().signInWithRedirect();
      }).should.throw(
        'firebase.auth().signInWithRedirect() is unsupported by the native Firebase SDKs.',
      );
    });
  });

  describe('useDeviceLanguage()', () => {
    it('should throw an unsupported error', () => {
      (() => {
        firebase.auth().useDeviceLanguage();
      }).should.throw(
        'firebase.auth().useDeviceLanguage() is unsupported by the native Firebase SDKs.',
      );
    });
  });

  describe('useUserAccessGroup()', () => {
    it('should return "null" on successful keychain implementation', async () => {
      const successfulKeychain = await firebase.auth().useUserAccessGroup('mysecretkeychain');

      should.not.exist(successfulKeychain);

      //clean up
      const resetKeychain = await firebase.auth().useUserAccessGroup(null);

      should.not.exist(resetKeychain);
    });
  });
});
