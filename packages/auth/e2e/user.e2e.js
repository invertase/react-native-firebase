describe('auth().currentUser', () => {
  beforeEach(async () => {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });

  describe('getIdToken()', () => {
    it('should return a token', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;

      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, random);

      // Test
      const token = await user.getIdToken();

      // Assertions
      token.should.be.a.String();
      token.length.should.be.greaterThan(24);

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('getIdTokenResult()', () => {
    it('should return a valid IdTokenResult Object', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;

      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, random);

      // Test
      const tokenResult = await user.getIdTokenResult();

      tokenResult.token.should.be.a.String();
      tokenResult.authTime.should.be.a.String();
      tokenResult.issuedAtTime.should.be.a.String();
      tokenResult.expirationTime.should.be.a.String();

      new Date(tokenResult.authTime).toString().should.not.equal('Invalid Date');
      new Date(tokenResult.issuedAtTime).toString().should.not.equal('Invalid Date');
      new Date(tokenResult.expirationTime).toString().should.not.equal('Invalid Date');

      tokenResult.claims.should.be.a.Object();
      tokenResult.claims.iat.should.be.a.Number();
      tokenResult.claims.iss.should.be.a.String();

      tokenResult.signInProvider.should.equal('password');
      tokenResult.token.length.should.be.greaterThan(24);

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('linkWithCredential()', () => {
    it('should link anonymous account <-> email account', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      await firebase.auth().signInAnonymously();
      const { currentUser } = firebase.auth();

      // Test
      const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

      const linkedUserCredential = await currentUser.linkWithCredential(credential);

      // Assertions
      const linkedUser = linkedUserCredential.user;
      linkedUser.should.be.an.Object();
      linkedUser.should.equal(firebase.auth().currentUser);
      linkedUser.email.toLowerCase().should.equal(email.toLowerCase());
      linkedUser.isAnonymous.should.equal(false);
      linkedUser.providerId.should.equal('firebase');
      linkedUser.providerData.should.be.an.Array();
      linkedUser.providerData.length.should.equal(1);

      // Clean up
      await firebase.auth().currentUser.delete();
    });

    it('should error on link anon <-> email if email already exists', async () => {
      const email = 'test@test.com';
      const pass = 'test1234';

      await firebase.auth().signInAnonymously();
      const { currentUser } = firebase.auth();

      // Test
      try {
        const credential = firebase.auth.EmailAuthProvider.credential(email, pass);
        await currentUser.linkWithCredential(credential);

        // Clean up
        await firebase.auth().signOut();

        // Reject
        return Promise.reject(new Error('Did not error on link'));
      } catch (error) {
        // Assertions
        error.code.should.equal('auth/email-already-in-use');
        error.message.should.containEql('The email address is already in use by another account.');

        // Clean up
        await firebase.auth().currentUser.delete();
      }

      return Promise.resolve();
    });
  });

  describe('reauthenticateWithCredential()', () => {
    it('should reauthenticate correctly', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      await firebase.auth().createUserWithEmailAndPassword(email, pass);

      // Test
      const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

      await firebase.auth().currentUser.reauthenticateWithCredential(credential);

      // Assertions
      const { currentUser } = firebase.auth();
      currentUser.email.should.equal(email.toLowerCase());

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('reload()', () => {
    it('should not error', async () => {
      await firebase.auth().signInAnonymously();

      try {
        await firebase.auth().currentUser.reload();
        await firebase.auth().signOut();
      } catch (error) {
        // Reject
        await firebase.auth().signOut();
        return Promise.reject(new Error('reload() caused an error', error));
      }

      return Promise.resolve();
    });
  });

  describe('sendEmailVerification()', () => {
    it('should not error', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      await firebase.auth().createUserWithEmailAndPassword(email, random);

      try {
        await firebase.auth().currentUser.sendEmailVerification();
        await firebase.auth().currentUser.delete();
      } catch (error) {
        // Reject
        try {
          await firebase.auth().currentUser.delete();
        } catch (_) {
          /* do nothing */
        }
        return Promise.reject(new Error('sendEmailVerification() caused an error', error));
      }

      return Promise.resolve();
    });

    it('should work with actionCodeSettings', async () => {
      const actionCodeSettings = {
        handleCodeInApp: true,
        url: 'https://react-native-firebase-testing.firebaseapp.com/foo',
      };
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      await firebase.auth().createUserWithEmailAndPassword(email, random);

      try {
        await firebase.auth().currentUser.sendEmailVerification(actionCodeSettings);
        await firebase.auth().currentUser.delete();
      } catch (error) {
        console.log(error);
        // Reject
        try {
          await firebase.auth().currentUser.delete();
        } catch (_) {
          /* do nothing */
        }

        return Promise.reject(
          new Error('sendEmailVerification(actionCodeSettings) caused an error'),
        );
      }

      return Promise.resolve();
    });
  });

  describe('unlink()', () => {
    it('should unlink the email address', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;

      await firebase.auth().signInAnonymously();
      const { currentUser } = firebase.auth();

      const credential = firebase.auth.EmailAuthProvider.credential(email, pass);
      await currentUser.linkWithCredential(credential);

      // Test
      await currentUser.unlink(firebase.auth.EmailAuthProvider.PROVIDER_ID);

      // Assertions
      const unlinkedUser = firebase.auth().currentUser;
      unlinkedUser.providerData.should.be.an.Array();
      unlinkedUser.providerData.length.should.equal(0);

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('updateEmail()', () => {
    it('should update the email address', async () => {
      const random = Utils.randString(12, '#aA');
      const random2 = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const email2 = `${random2}@${random2}.com`;
      // Setup
      await firebase.auth().createUserWithEmailAndPassword(email, random);
      firebase
        .auth()
        .currentUser.email.toLowerCase()
        .should.equal(email.toLowerCase());

      // Update user email
      await firebase.auth().currentUser.updateEmail(email2);

      // Assertions
      firebase
        .auth()
        .currentUser.email.toLowerCase()
        .should.equal(email2.toLowerCase());

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('updatePassword()', () => {
    it('should update the password', async () => {
      const random = Utils.randString(12, '#aA');
      const random2 = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;
      const pass2 = random2;

      // Setup
      await firebase.auth().createUserWithEmailAndPassword(email, pass);

      // Update user password
      await firebase.auth().currentUser.updatePassword(pass2);

      // Sign out
      await firebase.auth().signOut();

      // Log in with the new password
      await firebase.auth().signInWithEmailAndPassword(email, pass2);

      // Assertions
      firebase.auth().currentUser.should.be.an.Object();
      firebase.auth().currentUser.email.should.equal(email.toLowerCase());

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('updateProfile()', () => {
    it('should update the profile', async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const pass = random;
      const displayName = random;
      const photoURL = `http://${random}.com/${random}.jpg`;

      // Setup
      await firebase.auth().createUserWithEmailAndPassword(email, pass);

      // Update user profile
      await firebase.auth().currentUser.updateProfile({
        displayName,
        photoURL,
      });

      // Assertions
      const user = firebase.auth().currentUser;
      user.should.be.an.Object();
      user.email.should.equal(email.toLowerCase());
      user.displayName.should.equal(displayName);
      user.photoURL.should.equal(photoURL);

      // Clean up
      await firebase.auth().currentUser.delete();
    });
  });

  describe('linkWithPhoneNumber()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.linkWithPhoneNumber();
      }).should.throw(
        'firebase.auth.User.linkWithPhoneNumber() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('linkWithPopup()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.linkWithPopup();
      }).should.throw(
        'firebase.auth.User.linkWithPopup() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('linkWithRedirect()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.linkWithRedirect();
      }).should.throw(
        'firebase.auth.User.linkWithRedirect() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('reauthenticateWithPhoneNumber()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.reauthenticateWithPhoneNumber();
      }).should.throw(
        'firebase.auth.User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('reauthenticateWithPopup()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.reauthenticateWithPopup();
      }).should.throw(
        'firebase.auth.User.reauthenticateWithPopup() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('reauthenticateWithRedirect()', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => {
        firebase.auth().currentUser.reauthenticateWithRedirect();
      }).should.throw(
        'firebase.auth.User.reauthenticateWithRedirect() is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('refreshToken', () => {
    it('should throw an unsupported error', async () => {
      await firebase.auth().signInAnonymously();
      (() => firebase.auth().currentUser.refreshToken).should.throw(
        'firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.',
      );
      await firebase.auth().signOut();
    });
  });

  describe('user.metadata', () => {
    it("should have the properties 'lastSignInTime' & 'creationTime' which are ISO strings", async () => {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;

      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, random);

      const { metadata } = user;

      should(metadata.lastSignInTime).be.a.String();
      should(metadata.creationTime).be.a.String();

      new Date(metadata.lastSignInTime).getFullYear().should.equal(new Date().getFullYear());
      new Date(metadata.creationTime).getFullYear().should.equal(new Date().getFullYear());

      await firebase.auth().currentUser.delete();
    });
  });
});
