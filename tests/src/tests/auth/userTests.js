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

export default (userTests = ({ context, describe, it, firebase }) => {
  describe('User', () => {
    context('getIdToken()', () => {
      it('should return a token', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const newUser = await firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass);

        // Test
        const token = await newUser.getIdToken();

        // Assertions
        token.should.be.a.String();
        token.length.should.be.greaterThan(24);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('getToken()', () => {
      it('should return a token', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        const newUser = await firebase.native
          .auth()
          .createUserWithEmailAndPassword(email, pass);

        // Test
        const token = await newUser.getToken();

        // Assertions
        token.should.be.a.String();
        token.length.should.be.greaterThan(24);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('linkWithCredential()', () => {
      it('should link anonymous account <-> email account', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        const currentUser = firebase.native.auth().currentUser;

        // Test
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          pass
        );

        const linkedUser = await currentUser.linkWithCredential(credential);

        // Assertions
        linkedUser.should.be.an.Object();
        linkedUser.should.equal(firebase.native.auth().currentUser);
        linkedUser.email.toLowerCase().should.equal(email.toLowerCase());
        linkedUser.isAnonymous.should.equal(false);
        linkedUser.providerId.should.equal('firebase');
        linkedUser.providerData.should.be.an.Array();
        linkedUser.providerData.length.should.equal(1);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });

      it('should error on link anon <-> email if email already exists', async () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        const currentUser = firebase.native.auth().currentUser;

        // Test
        try {
          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );
          await currentUser.linkWithCredential(credential);

          // Clean up
          await firebase.native.auth().signOut();

          // Reject
          Promise.reject(new Error('Did not error on link'));
        } catch (error) {
          // Assertions
          error.code.should.equal('auth/email-already-in-use');
          error.message.should.equal(
            'The email address is already in use by another account.'
          );

          // Clean up
          await firebase.native.auth().currentUser.delete();
        }
      });
    });

    context('linkAndRetrieveDataWithCredential()', () => {
      it('should link anonymous account <-> email account', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        const currentUser = firebase.native.auth().currentUser;

        // Test
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          pass
        );

        const linkedUserCredential = await currentUser.linkAndRetrieveDataWithCredential(
          credential
        );

        // Assertions
        const linkedUser = linkedUserCredential.user;
        linkedUser.should.be.an.Object();
        linkedUser.should.equal(firebase.native.auth().currentUser);
        linkedUser.email.toLowerCase().should.equal(email.toLowerCase());
        linkedUser.isAnonymous.should.equal(false);
        linkedUser.providerId.should.equal('firebase');
        linkedUser.providerData.should.be.an.Array();
        linkedUser.providerData.length.should.equal(1);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });

      it('should error on link anon <-> email if email already exists', async () => {
        const email = 'test@test.com';
        const pass = 'test1234';

        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        const currentUser = firebase.native.auth().currentUser;

        // Test
        try {
          const credential = firebase.native.auth.EmailAuthProvider.credential(
            email,
            pass
          );
          await currentUser.linkAndRetrieveDataWithCredential(credential);

          // Clean up
          await firebase.native.auth().signOut();

          // Reject
          Promise.reject(new Error('Did not error on link'));
        } catch (error) {
          // Assertions
          error.code.should.equal('auth/email-already-in-use');
          error.message.should.equal(
            'The email address is already in use by another account.'
          );

          // Clean up
          await firebase.native.auth().currentUser.delete();
        }
      });
    });

    context('reauthenticateWithCredential()', () => {
      it('should reauthenticate correctly', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);

        // Test
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          pass
        );
        await firebase.native
          .auth()
          .currentUser.reauthenticateWithCredential(credential);

        // Assertions
        const currentUser = firebase.native.auth().currentUser;
        currentUser.email.should.equal(email.toLowerCase());

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('reauthenticateAndRetrieveDataWithCredential()', () => {
      it('should reauthenticate correctly', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);

        // Test
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          pass
        );
        await firebase.native
          .auth()
          .currentUser.reauthenticateAndRetrieveDataWithCredential(credential);

        // Assertions
        const currentUser = firebase.native.auth().currentUser;
        currentUser.email.should.equal(email.toLowerCase());

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('reload()', () => {
      it('should not error', async () => {
        await firebase.native.auth().signInAnonymouslyAndRetrieveData();

        try {
          await firebase.native.auth().currentUser.reload();
          await firebase.native.auth().signOut();
        } catch (error) {
          // Reject
          await firebase.native.auth().signOut();
          Promise.reject(new Error('reload() caused an error', error));
        }
      });
    });

    context('sendEmailVerification()', () => {
      it('should not error', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);

        try {
          await firebase.native.auth().currentUser.sendEmailVerification();
          await firebase.native.auth().currentUser.delete();
        } catch (error) {
          // Reject
          await firebase.native.auth().currentUser.delete();
          Promise.reject(
            new Error('sendEmailVerification() caused an error', error)
          );
        }
      });
    });

    context('unlink()', () => {
      it('should unlink the email address', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await firebase.native.auth().signInAnonymouslyAndRetrieveData();
        const currentUser = firebase.native.auth().currentUser;

        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          pass
        );
        await currentUser.linkAndRetrieveDataWithCredential(credential);

        // Test
        await currentUser.unlink(
          firebase.native.auth.EmailAuthProvider.PROVIDER_ID
        );

        // Assertions
        const unlinkedUser = firebase.native.auth().currentUser;
        unlinkedUser.providerData.should.be.an.Array();
        unlinkedUser.providerData.length.should.equal(0);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('updateEmail()', () => {
      it('should update the email address', async () => {
        const random = randomString(12, '#aA');
        const random2 = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const email2 = `${random2}@${random2}.com`;
        const pass = random;

        // Setup
        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);
        firebase.native
          .auth()
          .currentUser.email.toLowerCase()
          .should.equal(email.toLowerCase());

        // Update user email
        await firebase.native.auth().currentUser.updateEmail(email2);

        // Assertions
        firebase.native
          .auth()
          .currentUser.email.toLowerCase()
          .should.equal(email2.toLowerCase());

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('updatePassword()', () => {
      it('should update the password', async () => {
        const random = randomString(12, '#aA');
        const random2 = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;
        const pass2 = random2;

        // Setup
        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);

        // Update user password
        await firebase.native.auth().currentUser.updatePassword(pass2);

        // Sign out
        await firebase.native.auth().signOut();

        // Log in with the new password
        await firebase.native
          .auth()
          .signInAndRetrieveDataWithEmailAndPassword(email, pass2);

        // Assertions
        firebase.native.auth().currentUser.should.be.an.Object();
        firebase.native
          .auth()
          .currentUser.email.should.equal(email.toLowerCase());

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
    });

    context('updateProfile()', () => {
      it('should update the profile', async () => {
        const random = randomString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;
        const displayName = random;
        const photoURL = `http://${random}.com/${random}.jpg`;

        // Setup
        await firebase.native
          .auth()
          .createUserAndRetrieveDataWithEmailAndPassword(email, pass);

        // Update user profile
        await firebase.native.auth().currentUser.updateProfile({
          displayName,
          photoURL,
        });

        // Assertions
        const user = firebase.native.auth().currentUser;
        user.should.be.an.Object();
        user.email.should.equal(email.toLowerCase());
        user.displayName.should.equal(displayName);
        user.photoURL.should.equal(photoURL);

        // Clean up
        await firebase.native.auth().currentUser.delete();
      });
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
        (() => firebase.native.auth().currentUser.refreshToken).should.throw(
          'User.refreshToken is unsupported by the native Firebase SDKs.'
        );
        await firebase.native.auth().signOut();
      });
    });
  });
});
