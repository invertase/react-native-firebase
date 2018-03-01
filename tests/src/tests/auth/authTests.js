import sinon from 'sinon';
import 'should-sinon';
import should from 'should';

const randomString = (length, chars) => {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  }
  return result;
};

export default (authTests = ({ tryCatch, context, describe, it, firebase }) => {
  describe('auth()', () => {
    context('onAuthStateChanged', () => {
      it('calls callback with the current user and when auth state changes', async () => {
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onAuthStateChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(null);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });

      it('stops listening when unsubscribed', async () => {
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onAuthStateChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(null);
        callback.should.be.calledTwice();

        // Unsubscribe

        unsubscribe();

        // Sign back in

        await firebase.native.auth().signInAnonymously();

        // Assertions

        callback.should.be.calledTwice();

        // Tear down

        await firebase.native.auth().signOut();
      });
    });

    context('onIdTokenChanged', () => {
      it('calls callback with the current user and when auth state changes', async () => {
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onIdTokenChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(null);
        callback.should.be.calledTwice();

        // Tear down

        unsubscribe();
      });

      it('stops listening when unsubscribed', async () => {
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onIdTokenChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(null);
        callback.should.be.calledTwice();

        // Unsubscribe

        unsubscribe();

        // Sign back in

        await firebase.native.auth().signInAnonymously();

        // Assertions

        callback.should.be.calledTwice();

        // Tear down

        await firebase.native.auth().signOut();
      });
    });

    context('onUserChanged', () => {
      it('calls callback with the current user and when auth state changes', async () => {
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onUserChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

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
        await firebase.native.auth().signInAnonymously();

        // Test
        const callback = sinon.spy();

        let unsubscribe;
        await new Promise(resolve => {
          unsubscribe = firebase.native.auth().onUserChanged(user => {
            callback(user);
            resolve();
          });
        });

        callback.should.be.calledWith(firebase.native.auth().currentUser);
        callback.should.be.calledOnce();

        // Sign out

        await firebase.native.auth().signOut();

        await new Promise(resolve => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(null);
        // Because of the way onUserChanged works, it will be called double
        // - once for onAuthStateChanged
        // - once for onIdTokenChanged
        callback.should.have.callCount(4);

        // Unsubscribe

        unsubscribe();

        // Sign back in

        await firebase.native.auth().signInAnonymously();

        // Assertions

        callback.should.have.callCount(4);

        // Tear down

        await firebase.native.auth().signOut();
      });
    });

    context('signInAnonymously', () => {
      it('it should sign in anonymously', () => {
        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');

          currentUser.should.equal(firebase.native.auth().currentUser);

          return firebase.native.auth().signOut();
        };

        return firebase.native
          .auth()
          .signInAnonymously()
          .then(successCb);
      });
    });

    context('signInAnonymouslyAndRetrieveData', () => {
      it('it should sign in anonymously', () => {
        const successCb = currentUserCredential => {
          const currentUser = currentUserCredential.user;
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.native.auth().currentUser);

          const { additionalUserInfo } = currentUserCredential;
          additionalUserInfo.should.be.an.Object();

          return firebase.native.auth().signOut();
        };

        return firebase.native
          .auth()
          .signInAnonymouslyAndRetrieveData()
          .then(successCb);
      });
    });

    context('signInWithEmailAndPassword', () => {
      it('it should login with email and password', () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql('test@test.com');
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.native.auth().currentUser);

          return firebase.native.auth().signOut();
        };

        return firebase.native
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
          error.message.should.equal(
            'The user account has been disabled by an administrator.'
          );
          return Promise.resolve();
        };

        return firebase.native
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
          error.message.should.equal(
            'The password is invalid or the user does not have a password.'
          );
          return Promise.resolve();
        };

        return firebase.native
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
          error.message.should.equal(
            'There is no user record corresponding to this identifier. The user may have been deleted.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('signInAndRetrieveDataWithEmailAndPassword', () => {
      it('it should login with email and password', () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        const successCb = currentUserCredential => {
          const currentUser = currentUserCredential.user;
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql('test@test.com');
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.native.auth().currentUser);

          const { additionalUserInfo } = currentUserCredential;
          additionalUserInfo.should.be.an.Object();
          additionalUserInfo.isNewUser.should.equal(false);

          return firebase.native.auth().signOut();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb);
      });

      it('it should error on login if user is disabled', () => {
        const email = 'disabled@account.com';
        const pass = 'test1234';

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-disabled');
          error.message.should.equal(
            'The user account has been disabled by an administrator.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if password incorrect', () => {
        const email = 'test@test.com';
        const pass = 'test1234666';

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/wrong-password');
          error.message.should.equal(
            'The password is invalid or the user does not have a password.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if user not found', () => {
        const email = 'randomSomeone@fourOhFour.com';
        const pass = 'test1234';

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-not-found');
          error.message.should.equal(
            'There is no user record corresponding to this identifier. The user may have been deleted.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('signInWithCredential', () => {
      it('it should login with email and password', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'test@test.com',
          'test1234'
        );

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql('test@test.com');
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.native.auth().currentUser);

          return firebase.native.auth().signOut();
        };

        return firebase.native
          .auth()
          .signInWithCredential(credential)
          .then(successCb);
      });

      it('it should error on login if user is disabled', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'disabled@account.com',
          'test1234'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-disabled');
          error.message.should.equal(
            'The user account has been disabled by an administrator.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if password incorrect', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'test@test.com',
          'test1234666'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/wrong-password');
          error.message.should.equal(
            'The password is invalid or the user does not have a password.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if user not found', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'randomSomeone@fourOhFour.com',
          'test1234'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-not-found');
          error.message.should.equal(
            'There is no user record corresponding to this identifier. The user may have been deleted.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('signInAndRetrieveDataWithCredential', () => {
      it('it should login with email and password', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'test@test.com',
          'test1234'
        );

        const successCb = currentUserCredential => {
          const currentUser = currentUserCredential.user;
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql('test@test.com');
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.native.auth().currentUser);

          const { additionalUserInfo } = currentUserCredential;
          additionalUserInfo.should.be.an.Object();
          additionalUserInfo.isNewUser.should.equal(false);

          return firebase.native.auth().signOut();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then(successCb);
      });

      it('it should error on login if user is disabled', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'disabled@account.com',
          'test1234'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-disabled');
          error.message.should.equal(
            'The user account has been disabled by an administrator.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if password incorrect', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'test@test.com',
          'test1234666'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/wrong-password');
          error.message.should.equal(
            'The password is invalid or the user does not have a password.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on login if user not found', () => {
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          'randomSomeone@fourOhFour.com',
          'test1234'
        );

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/user-not-found');
          error.message.should.equal(
            'There is no user record corresponding to this identifier. The user may have been deleted.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('createUserWithEmailAndPassword', () => {
      it('it should create a user with an email and password', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = newUser => {
          newUser.uid.should.be.a.String();
          newUser.email.should.equal(email.toLowerCase());
          newUser.emailVerified.should.equal(false);
          newUser.isAnonymous.should.equal(false);
          newUser.providerId.should.equal('firebase');
          newUser.should.equal(firebase.native.auth().currentUser);
        };

        return firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass)
          .then(successCb);
      });

      it('it should error on create with invalid email', () => {
        const random = randomString(12, '#aA');
        const email = `${random}${random}.com.boop.shoop`;
        const pass = random;

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/invalid-email');
          error.message.should.equal('The email address is badly formatted.');
          return Promise.resolve();
        };

        return firebase.native
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
          error.message.should.equal(
            'The email address is already in use by another account.'
          );
          return Promise.resolve();
        };

        return firebase.native
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
          // error.message.should.equal('The given password is invalid.');
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('createUserAndRetrieveDataWithEmailAndPassword', () => {
      it('it should create a user with an email and password', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = newUserCredential => {
          const newUser = newUserCredential.user;
          newUser.uid.should.be.a.String();
          newUser.email.should.equal(email.toLowerCase());
          newUser.emailVerified.should.equal(false);
          newUser.isAnonymous.should.equal(false);
          newUser.providerId.should.equal('firebase');
          newUser.should.equal(firebase.native.auth().currentUser);
          const { additionalUserInfo } = newUserCredential;
          additionalUserInfo.should.be.an.Object();
          additionalUserInfo.isNewUser.should.equal(true);
        };

        return firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb);
      });

      it('it should error on create with invalid email', () => {
        const random = randomString(12, '#aA');
        const email = `${random}${random}.com.boop.shoop`;
        const pass = random;

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/invalid-email');
          error.message.should.equal('The email address is badly formatted.');
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });

      it('it should error on create if email in use', () => {
        const email = 'test@test.com';
        const pass = 'test123456789';

        const successCb = () => Promise.reject(new Error('Did not error.'));

        const failureCb = error => {
          error.code.should.equal('auth/email-already-in-use');
          error.message.should.equal(
            'The email address is already in use by another account.'
          );
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass)
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
          // error.message.should.equal('The given password is invalid.');
          return Promise.resolve();
        };

        return firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass)
          .then(successCb)
          .catch(failureCb);
      });
    });

    context('fetchProvidersForEmail', () => {
      it('it should return password provider for an email address', () =>
        new Promise((resolve, reject) => {
          const successCb = tryCatch(providers => {
            providers.should.be.a.Array();
            providers.should.containEql('password');
            resolve();
          }, reject);

          const failureCb = tryCatch(() => {
            reject(new Error('Should not have an error.'));
          }, reject);

          return firebase.native
            .auth()
            .fetchProvidersForEmail('test@test.com')
            .then(successCb)
            .catch(failureCb);
        }));

      it('it should return an empty array for a not found email', () =>
        new Promise((resolve, reject) => {
          const successCb = tryCatch(providers => {
            providers.should.be.a.Array();
            providers.should.be.empty();
            resolve();
          }, reject);

          const failureCb = tryCatch(() => {
            reject(new Error('Should not have an error.'));
          }, reject);

          return firebase.native
            .auth()
            .fetchProvidersForEmail('test@i-do-not-exist.com')
            .then(successCb)
            .catch(failureCb);
        }));

      it('it should return an error for a bad email address', () =>
        new Promise((resolve, reject) => {
          const successCb = tryCatch(() => {
            reject(new Error('Should not have successfully resolved.'));
          }, reject);

          const failureCb = tryCatch(error => {
            error.code.should.equal('auth/invalid-email');
            error.message.should.equal('The email address is badly formatted.');
            resolve();
          }, reject);

          return firebase.native
            .auth()
            .fetchProvidersForEmail('foobar')
            .then(successCb)
            .catch(failureCb);
        }));
    });

    context('delete()', () => {
      it('should delete a user', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = newUser => {
          newUser.uid.should.be.a.String();
          newUser.email.should.equal(email.toLowerCase());
          newUser.emailVerified.should.equal(false);
          newUser.isAnonymous.should.equal(false);
          newUser.providerId.should.equal('firebase');
          return firebase.native.auth().currentUser.delete();
        };

        return firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass)
          .then(successCb);
      });
    });

    context('languageCode', () => {
      it('it should change the language code', () => {
        // eslint-disable-next-line no-param-reassign
        firebase.native.auth().languageCode = 'en';
        if (firebase.native.auth().languageCode !== 'en') {
          throw new Error('Expected language code to be "en".');
        }
        // eslint-disable-next-line no-param-reassign
        firebase.native.auth().languageCode = 'fr';
        if (firebase.native.auth().languageCode !== 'fr') {
          throw new Error('Expected language code to be "fr".');
        }
        // eslint-disable-next-line no-param-reassign
        firebase.native.auth().languageCode = 'en';
      });
    });

    context('getRedirectResult', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.auth().getRedirectResult();
        }).should.throw(
          'firebase.auth().getRedirectResult() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('setPersistence', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.auth().setPersistence();
        }).should.throw(
          'firebase.auth().setPersistence() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('signInWithPopup', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.auth().signInWithPopup();
        }).should.throw(
          'firebase.auth().signInWithPopup() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('signInWithRedirect', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.auth().signInWithRedirect();
        }).should.throw(
          'firebase.auth().signInWithRedirect() is unsupported by the native Firebase SDKs.'
        );
      });
    });

    context('useDeviceLanguage', () => {
      it('should throw an unsupported error', () => {
        (() => {
          firebase.native.auth().useDeviceLanguage();
        }).should.throw(
          'firebase.auth().useDeviceLanguage() is unsupported by the native Firebase SDKs.'
        );
      });
    });
  });
});
