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

export default (userTests = ({ tryCatch, context, describe, it, firebase }) => {
  describe('User', () => {
    context('getIdToken()', () => {
      it('should return a token', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = newUser => {
          newUser.uid.should.be.a.String();
          newUser.email.should.equal(email.toLowerCase());
          newUser.emailVerified.should.equal(false);
          newUser.isAnonymous.should.equal(false);
          newUser.providerId.should.equal('firebase');

          return newUser.getIdToken().then(token => {
            token.should.be.a.String();
            token.length.should.be.greaterThan(24);
            return firebase.native.auth().currentUser.delete();
          });
        };

        return firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass)
          .then(successCb);
      });
    });

    context('getToken()', () => {
      it('should return a token', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = newUser => {
          newUser.uid.should.be.a.String();
          newUser.email.should.equal(email.toLowerCase());
          newUser.emailVerified.should.equal(false);
          newUser.isAnonymous.should.equal(false);
          newUser.providerId.should.equal('firebase');

          return newUser.getToken().then(token => {
            token.should.be.a.String();
            token.length.should.be.greaterThan(24);
            return firebase.native.auth().currentUser.delete();
          });
        };

        return firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass)
          .then(successCb);
      });
    });

    context('linkWithCredential()', () => {
      it('it should link anonymous account <-> email account', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          firebase.native.auth().currentUser.uid.should.be.a.String();

          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );

          return currentUser
            .linkWithCredential(credential)
            .then(linkedUser => {
              linkedUser.should.be.an.Object();
              linkedUser.should.equal(firebase.native.auth().currentUser);
              linkedUser.uid.should.be.a.String();
              linkedUser.toJSON().should.be.an.Object();
              // iOS and Android are inconsistent in returning lowercase / mixed case
              linkedUser
                .toJSON()
                .email.toLowerCase()
                .should.eql(email.toLowerCase());
              linkedUser.isAnonymous.should.equal(false);
              linkedUser.providerId.should.equal('firebase');
              return firebase.native.auth().signOut();
            })
            .catch(error =>
              firebase.native
                .auth()
                .signOut()
                .then(() => Promise.reject(error))
            );
        };

        return firebase.native
          .auth()
          .signInAnonymously()
          .then(successCb);
      });

      it('it should error on link anon <-> email if email already exists', () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          firebase.native.auth().currentUser.uid.should.be.a.String();

          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );

          return currentUser
            .linkWithCredential(credential)
            .then(() =>
              firebase.native
                .auth()
                .signOut()
                .then(() => Promise.reject(new Error('Did not error on link')))
            )
            .catch(error =>
              firebase.native
                .auth()
                .signOut()
                .then(() => {
                  error.code.should.equal('auth/email-already-in-use');
                  error.message.should.equal(
                    'The email address is already in use by another account.'
                  );
                  return Promise.resolve();
                })
            );
        };

        return firebase.native
          .auth()
          .signInAnonymously()
          .then(successCb);
      });
    });

    context('linkAndRetrieveDataWithCredential()', () => {
      it('it should link anonymous account <-> email account', () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          firebase.native.auth().currentUser.uid.should.be.a.String();

          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );

          return currentUser
            .linkAndRetrieveDataWithCredential(credential)
            .then(linkedUserCredential => {
              linkedUserCredential.should.be.an.Object();
              const linkedUser = linkedUserCredential.user;
              linkedUser.should.be.an.Object();
              linkedUser.should.equal(firebase.native.auth().currentUser);
              linkedUser.uid.should.be.a.String();
              linkedUser.toJSON().should.be.an.Object();
              // iOS and Android are inconsistent in returning lowercase / mixed case
              linkedUser
                .toJSON()
                .email.toLowerCase()
                .should.eql(email.toLowerCase());
              linkedUser.isAnonymous.should.equal(false);
              linkedUser.providerId.should.equal('firebase');
              // TODO: iOS is incorrect, passes on Android
              // const additionalUserInfo = linkedUserCredential.additionalUserInfo;
              // additionalUserInfo.should.be.an.Object();
              // additionalUserInfo.isNewUser.should.equal(false);
              return firebase.native.auth().signOut();
            })
            .catch(error =>
              firebase.native
                .auth()
                .signOut()
                .then(() => Promise.reject(error))
            );
        };

        return firebase.native
          .auth()
          .signInAnonymously()
          .then(successCb);
      });

      it('it should error on link anon <-> email if email already exists', () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        const successCb = currentUser => {
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          firebase.native.auth().currentUser.uid.should.be.a.String();

          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );

          return currentUser
            .linkAndRetrieveDataWithCredential(credential)
            .then(() =>
              firebase.native
                .auth()
                .signOut()
                .then(() => Promise.reject(new Error('Did not error on link')))
            )
            .catch(error =>
              firebase.native
                .auth()
                .signOut()
                .then(() => {
                  error.code.should.equal('auth/email-already-in-use');
                  error.message.should.equal(
                    'The email address is already in use by another account.'
                  );
                  return Promise.resolve();
                })
            );
        };

        return firebase.native
          .auth()
          .signInAnonymously()
          .then(successCb);
      });
    });

    context('signOut()', () => {
      it('it should reject signOut if no currentUser', () =>
        new Promise((resolve, reject) => {
          if (firebase.native.auth().currentUser) {
            return reject(
              new Error(
                `A user is currently signed in. ${
                  firebase.native.auth().currentUser.uid
                }`
              )
            );
          }

          const successCb = tryCatch(() => {
            reject(new Error('No signOut error returned'));
          }, reject);

          const failureCb = tryCatch(error => {
            error.code.should.equal('auth/no-current-user');
            error.message.should.equal('No user currently signed in.');
            resolve();
          }, reject);

          return firebase.native
            .auth()
            .signOut()
            .then(successCb)
            .catch(failureCb);
        }));
    });

    context('linkWithPhoneNumber()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.linkWithPhoneNumber();
        }).should.throw(
          'User.linkWithPhoneNumber() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('linkWithPopup()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.linkWithPopup();
        }).should.throw(
          'User.linkWithPopup() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('linkWithRedirect()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.linkWithRedirect();
        }).should.throw(
          'User.linkWithRedirect() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('reauthenticateWithPhoneNumber()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.reauthenticateWithPhoneNumber();
        }).should.throw(
          'User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('reauthenticateWithPopup()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.reauthenticateWithPopup();
        }).should.throw(
          'User.reauthenticateWithPopup() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('reauthenticateWithRedirect()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.reauthenticateWithRedirect();
        }).should.throw(
          'User.reauthenticateWithRedirect() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('updatePhoneNumber()', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.updatePhoneNumber();
        }).should.throw(
          'User.updatePhoneNumber() is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });

    context('refreshToken', () => {
      it('should throw an unsupported error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        (() => {
          firebase.native.auth().currentUser.refreshToken;
        }).should.throw(
          'User.refreshToken is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });
  });
});
