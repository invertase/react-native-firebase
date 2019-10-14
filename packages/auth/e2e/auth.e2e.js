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

describe('auth()', () => {
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
    it('errors on invalid code', async () => {
      try {
        await firebase.auth().applyActionCode('fooby shooby dooby');
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

  describe('verifyPasswordResetCode()', () => {
    it('errors on invalid code', async () => {
      try {
        await firebase.auth().verifyPasswordResetCode('fooby shooby dooby');
      } catch (e) {
        e.message.should.containEql('code is invalid');
      }
    });
  });

  describe('confirmPasswordReset()', () => {
    it('errors on invalid code', async () => {
      try {
        await firebase.auth().confirmPasswordReset('fooby shooby dooby', 'passwordthing');
      } catch (e) {
        e.message.should.containEql('code is invalid');
      }
    });
  });

  describe('signInWithCustomToken()', () => {
    // TODO(salakar) use new testing api to create a custom token
    xit('signs in with a admin sdk created custom auth token', async () => {
      const customUID = 'zdwHCjbpzraRoNK7d64FYWv5AH02';
      const token = await firebaseAdmin.auth().createCustomToken(customUID, {
        test: null,
        roles: [
          {
            role: 'validated',
            scheme_id: null,
          },
          {
            role: 'member',
            scheme_id: 1,
          },
          {
            role: 'member',
            scheme_id: 2,
          },
        ],
      });
      const { user } = await firebase.auth().signInWithCustomToken(token);

      user.uid.should.equal(customUID);
      firebase.auth().currentUser.uid.should.equal(customUID);

      const { claims } = await firebase.auth().currentUser.getIdTokenResult(true);

      claims.roles.should.be.an.Array();

      await firebase.auth().signOut();
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

      await Utils.sleep(50);

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
      const email = 'test@test.com';
      const pass = 'test1234';

      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(email);
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
        .signInWithEmailAndPassword(email, pass)
        .then(successCb);
    });

    it('it should error on login if user is disabled', () => {
      const email = 'disabled@account.com';
      const pass = 'test1234';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-disabled');
        error.message.should.containEql('The user account has been disabled by an administrator.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if password incorrect', () => {
      const email = 'test@test.com';
      const pass = 'test1234666';

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
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if user not found', () => {
      const email = 'randomSomeone@fourOhFour.com';
      const pass = 'test1234';

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
      const credential = firebase.auth.EmailAuthProvider.credential('test@test.com', 'test1234');

      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql('test@test.com');
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
      const credential = firebase.auth.EmailAuthProvider.credential(
        'disabled@account.com',
        'test1234',
      );

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
      const credential = firebase.auth.EmailAuthProvider.credential('test@test.com', 'test1234666');

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
      const credential = firebase.auth.EmailAuthProvider.credential(
        'randomSomeone@fourOhFour.com',
        'test1234',
      );

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
      const email = 'test@test.com';
      const pass = 'test123456789';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/email-already-in-use');
        error.message.should.containEql('The email address is already in use by another account.');
        return Promise.resolve();
      };

      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
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
          .fetchSignInMethodsForEmail('test@test.com')
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
    it('it should change the language code', () => {
      firebase.auth().languageCode = 'en';
      if (firebase.auth().languageCode !== 'en') {
        throw new Error('Expected language code to be "en".');
      }
      firebase.auth().languageCode = 'fr';
      if (firebase.auth().languageCode !== 'fr') {
        throw new Error('Expected language code to be "fr".');
      }
      firebase.auth().languageCode = 'en';
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
        await firebase.auth().currentUser.delete();
      } catch (error) {
        // Reject
        await firebase.auth().currentUser.delete();
        throw new Error('sendPasswordResetEmail() caused an error', error);
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
});
