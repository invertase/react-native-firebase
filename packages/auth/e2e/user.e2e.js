const TEST_EMAIL = 'test@test.com';
const TEST_PASS = 'test1234';

const {
  clearAllUsers,
  getLastSmsCode,
  getRandomPhoneNumber,
  getLastOob,
  verifyEmail,
} = require('./helpers');

describe('auth().currentUser', function () {
  describe('firebase v8 compatibility', function () {
    before(async function () {
      try {
        await clearAllUsers();
      } catch (e) {
        throw e;
      }
      firebase.auth().settings.appVerificationDisabledForTesting = true;
      try {
        await firebase.auth().createUserWithEmailAndPassword(TEST_EMAIL, TEST_PASS);
      } catch (e) {
        // they may already exist, that's fine
      }
    });

    beforeEach(async function () {
      if (firebase.auth().currentUser) {
        await firebase.auth().signOut();
        await Utils.sleep(50);
      }
    });

    describe('getIdToken()', function () {
      it('should return a token', async function () {
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

    describe('getIdTokenResult()', function () {
      it('should return a valid IdTokenResult Object', async function () {
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
        tokenResult.claims.exp.should.be.a.Number();
        tokenResult.claims.iss.should.be.a.String();

        new Date(tokenResult.issuedAtTime).getTime().should.equal(tokenResult.claims.iat * 1000);
        new Date(tokenResult.expirationTime).getTime().should.equal(tokenResult.claims.exp * 1000);

        tokenResult.signInProvider.should.equal('password');
        tokenResult.token.length.should.be.greaterThan(24);

        // Clean up
        await firebase.auth().currentUser.delete();
      });
    });

    describe('linkWithCredential()', function () {
      // hanging against auth emulator?
      it('should link anonymous account <-> email account', async function () {
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

      it('should error on link anon <-> email if email already exists', async function () {
        await firebase.auth().signInAnonymously();
        const { currentUser } = firebase.auth();

        // Test
        try {
          const credential = firebase.auth.EmailAuthProvider.credential(TEST_EMAIL, TEST_PASS);
          await currentUser.linkWithCredential(credential);

          // Clean up
          await firebase.auth().signOut();

          // Reject
          return Promise.reject(new Error('Did not error on link'));
        } catch (error) {
          // Assertions
          error.code.should.equal('auth/email-already-in-use');

          // Clean up
          await firebase.auth().currentUser.delete();
        }

        return Promise.resolve();
      });
    });

    describe('reauthenticateWithCredential()', function () {
      it('should reauthenticate correctly', async function () {
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

    describe('reload()', function () {
      it('should not error', async function () {
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

    describe('sendEmailVerification()', function () {
      it('should error if actionCodeSettings.url is not present', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({});
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.url is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({ url: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.dynamicLinkDomain is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase
            .auth()
            .currentUser.sendEmailVerification({ url: 'string', dynamicLinkDomain: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.dynamicLinkDomain' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if handleCodeInApp is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase
            .auth()
            .currentUser.sendEmailVerification({ url: 'string', handleCodeInApp: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.handleCodeInApp' expected a boolean value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.iOS is not an object', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({ url: 'string', iOS: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.iOS' expected an object value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.iOS.bundleId is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase
            .auth()
            .currentUser.sendEmailVerification({ url: 'string', iOS: { bundleId: 123 } });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android is not an object', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({ url: 'string', android: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.android' expected an object value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.packageName is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase
            .auth()
            .currentUser.sendEmailVerification({ url: 'string', android: { packageName: 123 } });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.packageName' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.installApp is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({
            url: 'string',
            android: { packageName: 'packageName', installApp: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.minimumVersion is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.sendEmailVerification({
            url: 'string',
            android: { packageName: 'packageName', minimumVersion: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should not error', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);

        try {
          await firebase.auth().currentUser.sendEmailVerification();
        } catch (error) {
          return Promise.reject(new Error('sendEmailVerification() caused an error', error));
        } finally {
          await firebase.auth().currentUser.delete();
        }

        return Promise.resolve();
      });

      it('should correctly report emailVerified status', async function () {
        const random = Utils.randString(12, '#a');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        firebase.auth().currentUser.email.should.equal(email);
        firebase.auth().currentUser.emailVerified.should.equal(false);

        try {
          await firebase.auth().currentUser.sendEmailVerification();
          const { oobCode } = await getLastOob(email);
          await verifyEmail(oobCode);
          firebase.auth().currentUser.emailVerified.should.equal(false);
          await firebase.auth().currentUser.reload();
          firebase.auth().currentUser.emailVerified.should.equal(true);
        } catch (error) {
          return Promise.reject(new Error('sendEmailVerification() caused an error', error));
        } finally {
          await firebase.auth().currentUser.delete();
        }

        return Promise.resolve();
      });

      it('should work with actionCodeSettings', async function () {
        const actionCodeSettings = {
          handleCodeInApp: true,
          url: 'https://react-native-firebase-testing.firebaseapp.com/foo',
        };
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);

        try {
          await firebase.auth().currentUser.sendEmailVerification(actionCodeSettings);
        } catch (error) {
          return Promise.reject(
            new Error('sendEmailVerification(actionCodeSettings) error' + error.message),
          );
        } finally {
          await firebase.auth().currentUser.delete();
        }

        return Promise.resolve();
      });

      it('should throw an error within an invalid action code url', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await firebase.auth().createUserWithEmailAndPassword(email, random);

        (() => {
          firebase.auth().currentUser.sendEmailVerification({ url: [] });
        }).should.throw(
          "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.url' expected a string value.",
        );
      });
    });

    describe('verifyBeforeUpdateEmail()', function () {
      it('should error if newEmail is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(123);
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'newEmail' expected a string value");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.url is not present', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {});
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.url is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, { url: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.dynamicLinkDomain is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            dynamicLinkDomain: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.dynamicLinkDomain' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if handleCodeInApp is not a boolean', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            handleCodeInApp: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.handleCodeInApp' expected a boolean value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.iOS is not an object', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            iOS: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.iOS' expected an object value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.iOS.bundleId is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            iOS: { bundleId: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android is not an object', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            android: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.android' expected an object value.");
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.packageName is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            android: { packageName: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.packageName' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.installApp is not a boolean', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            android: { packageName: 'string', installApp: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      it('should error if actionCodeSettings.android.minimumVersion is not a string', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await firebase.auth().createUserWithEmailAndPassword(email, random);
        try {
          firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail, {
            url: 'string',
            android: { packageName: 'string', minimumVersion: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
        await firebase.auth().currentUser.delete();
      });

      // FIXME ios+android failing with an internal error against auth emulator
      // com.google.firebase.FirebaseException: An internal error has occurred. [ VERIFY_AND_CHANGE_EMAIL ]
      xit('should not error', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        try {
          await firebase.auth().createUserWithEmailAndPassword(email, random);
          await firebase.auth().currentUser.verifyBeforeUpdateEmail(updateEmail);
        } catch (e) {
          return Promise.reject("'verifyBeforeUpdateEmail()' did not work");
        }
        await firebase.auth().currentUser.delete();
      });

      // FIXME ios+android failing with an internal error against auth emulator
      // com.google.firebase.FirebaseException: An internal error has occurred. [ VERIFY_AND_CHANGE_EMAIL ]
      xit('should work with actionCodeSettings', async function () {
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;
        const actionCodeSettings = {
          url: 'https://react-native-firebase-testing.firebaseapp.com/foo',
        };
        try {
          await firebase.auth().createUserWithEmailAndPassword(email, random);
          await firebase
            .auth()
            .currentUser.verifyBeforeUpdateEmail(updateEmail, actionCodeSettings);
          await firebase.auth().currentUser.delete();
        } catch (error) {
          try {
            await firebase.auth().currentUser.delete();
          } catch (e) {
            consle.log(e);
            /* do nothing */
          }

          return Promise.reject(
            "'verifyBeforeUpdateEmail()' with 'actionCodeSettings' did not work",
          );
        }
        return Promise.resolve();
      });
    });

    describe('unlink()', function () {
      it('should unlink the email address', async function () {
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

    describe('updateEmail()', function () {
      it('should update the email address', async function () {
        const random = Utils.randString(12, '#a');
        const random2 = Utils.randString(12, '#a');
        const email = `${random}@${random}.com`;
        const email2 = `${random2}@${random2}.com`;
        // Setup
        await firebase.auth().createUserWithEmailAndPassword(email, random);
        firebase.auth().currentUser.email.should.equal(email);

        // Update user email
        await firebase.auth().currentUser.updateEmail(email2);

        // Assertions
        firebase.auth().currentUser.email.should.equal(email2);

        // Clean up
        await firebase.auth().currentUser.delete();
      });
    });

    describe('updatePhoneNumber()', function () {
      // Phone number auth is not supported on other platforms
      if (Platform.other) {
        return;
      }

      it('should update the phone number', async function () {
        const testPhone = await getRandomPhoneNumber();
        const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
        const smsCode = await getLastSmsCode(testPhone);
        await confirmResult.confirm(smsCode);

        firebase.auth().currentUser.phoneNumber.should.equal(testPhone);

        const newPhone = await getRandomPhoneNumber();
        const newPhoneVerificationId = await new Promise((resolve, reject) => {
          firebase
            .auth()
            .verifyPhoneNumber(newPhone)
            .on('state_changed', phoneAuthSnapshot => {
              if (phoneAuthSnapshot.error) {
                reject(phoneAuthSnapshot.error);
              } else {
                resolve(phoneAuthSnapshot.verificationId);
              }
            });
        });

        try {
          const newSmsCode = await getLastSmsCode(newPhone);
          const credential = await firebase.auth.PhoneAuthProvider.credential(
            newPhoneVerificationId,
            newSmsCode,
          );

          //Update with number?
          await firebase
            .auth()
            .currentUser.updatePhoneNumber(credential)
            .then($ => $);
        } catch (e) {
          throw e;
        }

        firebase.auth().currentUser.phoneNumber.should.equal(newPhone);
      });
    });

    describe('updatePassword()', function () {
      it('should update the password', async function () {
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

      // Can only be run/reproduced locally with Firebase Auth rate limits lowered on the Firebase console.
      xit('should throw too many requests when limit has been reached', async function () {
        await Utils.sleep(10000);
        try {
          // Setup for creating new accounts
          const random = Utils.randString(12, '#aA');
          const email = `${random}@${random}.com`;
          const pass = random;

          const promises = [];

          // Create 10 accounts to force the error
          [...Array(10).keys()].map($ =>
            promises.push(
              new Promise(r => r(firebase.auth().createUserWithEmailAndPassword(email + $, pass))),
            ),
          );

          await Promise.all(promises);

          return Promise.reject('Should have rejected');
        } catch (ex) {
          ex.code.should.equal('auth/too-many-requests');
          return Promise.resolve();
        }
      });
    });

    describe('updateProfile()', function () {
      it('should update the profile', async function () {
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

      it('should return a valid profile when signing in anonymously', async function () {
        // Setup
        await firebase.auth().signInAnonymously();
        const { currentUser } = firebase.auth();

        // Assertions
        currentUser.should.be.an.Object();
        should.equal(currentUser.email, null);
        should.equal(currentUser.displayName, null);
        should.equal(currentUser.emailVerified, false);
        should.equal(currentUser.isAnonymous, true);
        should.equal(currentUser.phoneNumber, null);
        should.equal(currentUser.photoURL, null);
        should.exist(currentUser.metadata.lastSignInTime);
        should.exist(currentUser.metadata.creationTime);
        should.deepEqual(currentUser.providerData, []);
        should.exist(currentUser.providerId);
        should.exist(currentUser.uid);

        // Clean up
        await firebase.auth().currentUser.delete();
      });
    });

    describe('linkWithPhoneNumber()', function () {
      it('should throw an unsupported error', async function () {
        await firebase.auth().signInAnonymously();
        (() => {
          firebase.auth().currentUser.linkWithPhoneNumber();
        }).should.throw(
          'firebase.auth.User.linkWithPhoneNumber() is unsupported by the native Firebase SDKs.',
        );
        await firebase.auth().signOut();
      });
    });

    describe('reauthenticateWithPhoneNumber()', function () {
      it('should throw an unsupported error', async function () {
        await firebase.auth().signInAnonymously();
        (() => {
          firebase.auth().currentUser.reauthenticateWithPhoneNumber();
        }).should.throw(
          'firebase.auth.User.reauthenticateWithPhoneNumber() is unsupported by the native Firebase SDKs.',
        );
        await firebase.auth().signOut();
      });
    });

    describe('refreshToken', function () {
      it('should throw an unsupported error', async function () {
        await firebase.auth().signInAnonymously();
        (() => firebase.auth().currentUser.refreshToken).should.throw(
          'firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.',
        );
        await firebase.auth().signOut();
      });
    });

    describe('user.metadata', function () {
      it("should have the properties 'lastSignInTime' & 'creationTime' which are ISO strings", async function () {
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

  describe('modular', function () {
    before(async function () {
      const { getAuth, createUserWithEmailAndPassword } = authModular;
      const auth = getAuth();
      try {
        await clearAllUsers();
      } catch (e) {
        throw e;
      }
      auth.settings.appVerificationDisabledForTesting = true;
      try {
        await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASS);
      } catch (e) {
        // they may already exist, that's fine
      }
    });

    beforeEach(async function () {
      const { getAuth, signOut } = authModular;
      const auth = getAuth();

      if (auth.currentUser) {
        await signOut(auth);
        await Utils.sleep(50);
      }
    });

    describe('getIdToken()', function () {
      it('should return a token', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, getIdToken } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;

        const { user } = await createUserWithEmailAndPassword(auth, email, random);

        // Test
        const token = await getIdToken(user);

        // Assertions
        token.should.be.a.String();
        token.length.should.be.greaterThan(24);

        // Clean up
        await deleteUser(auth.currentUser);
      });
    });

    describe('getIdTokenResult()', function () {
      it('should return a valid IdTokenResult Object', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, getIdTokenResult } =
          authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;

        const { user } = await createUserWithEmailAndPassword(auth, email, random);

        // Test
        const tokenResult = await getIdTokenResult(user);

        tokenResult.token.should.be.a.String();
        tokenResult.authTime.should.be.a.String();
        tokenResult.issuedAtTime.should.be.a.String();
        tokenResult.expirationTime.should.be.a.String();

        new Date(tokenResult.authTime).toString().should.not.equal('Invalid Date');
        new Date(tokenResult.issuedAtTime).toString().should.not.equal('Invalid Date');
        new Date(tokenResult.expirationTime).toString().should.not.equal('Invalid Date');

        tokenResult.claims.should.be.a.Object();
        tokenResult.claims.iat.should.be.a.Number();
        tokenResult.claims.exp.should.be.a.Number();
        tokenResult.claims.iss.should.be.a.String();

        new Date(tokenResult.issuedAtTime).getTime().should.equal(tokenResult.claims.iat * 1000);
        new Date(tokenResult.expirationTime).getTime().should.equal(tokenResult.claims.exp * 1000);

        tokenResult.signInProvider.should.equal('password');
        tokenResult.token.length.should.be.greaterThan(24);

        // Clean up
        await deleteUser(auth.currentUser);
      });
    });

    describe('linkWithCredential()', function () {
      // hanging against auth emulator?
      it('should link anonymous account <-> email account', async function () {
        const { getAuth, signInAnonymously, deleteUser, linkWithCredential } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await signInAnonymously(auth);
        const { currentUser } = auth;

        // Test
        const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

        const linkedUserCredential = await linkWithCredential(currentUser, credential);

        // Assertions
        const linkedUser = linkedUserCredential.user;
        linkedUser.should.be.an.Object();
        linkedUser.should.equal(auth.currentUser);
        linkedUser.email.toLowerCase().should.equal(email.toLowerCase());
        linkedUser.isAnonymous.should.equal(false);
        linkedUser.providerId.should.equal('firebase');
        linkedUser.providerData.should.be.an.Array();
        linkedUser.providerData.length.should.equal(1);

        // Clean up
        await deleteUser(currentUser);
      });

      it('should error on link anon <-> email if email already exists', async function () {
        const { getAuth, signInAnonymously, deleteUser, linkWithCredential } = authModular;
        const auth = getAuth();

        await signInAnonymously(auth);
        const { currentUser } = auth;

        // Test
        try {
          const credential = firebase.auth.EmailAuthProvider.credential(TEST_EMAIL, TEST_PASS);
          await linkWithCredential(currentUser, credential);

          // Clean up
          await deleteUser(currentUser);

          // Reject
          return Promise.reject(new Error('Did not error on link'));
        } catch (error) {
          // Assertions
          error.code.should.equal('auth/email-already-in-use');

          // Clean up
          await deleteUser(currentUser);
        }

        return Promise.resolve();
      });
    });

    describe('reauthenticateWithCredential()', function () {
      it('should reauthenticate correctly', async function () {
        const {
          getAuth,
          createUserWithEmailAndPassword,
          deleteUser,
          reauthenticateWithCredential,
        } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await createUserWithEmailAndPassword(auth, email, pass);

        // Test
        const credential = firebase.auth.EmailAuthProvider.credential(email, pass);

        await reauthenticateWithCredential(auth.currentUser, credential);

        // Assertions
        const { currentUser } = auth;
        currentUser.email.should.equal(email.toLowerCase());

        // Clean up
        await deleteUser(currentUser);
      });
    });

    describe('reload()', function () {
      it('should not error', async function () {
        const { getAuth, signInAnonymously, signOut, reload } = authModular;
        const auth = getAuth();

        await signInAnonymously(auth);

        try {
          await reload(auth.currentUser);
          await signOut(auth);
        } catch (error) {
          // Reject
          await signOut(auth);
          return Promise.reject(new Error('reload() caused an error', error));
        }

        return Promise.resolve();
      });
    });

    describe('sendEmailVerification()', function () {
      it('should error if actionCodeSettings.url is not present', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, {});
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.url is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.dynamicLinkDomain is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 'string', dynamicLinkDomain: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.dynamicLinkDomain' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if handleCodeInApp is not a boolean', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 'string', handleCodeInApp: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.handleCodeInApp' expected a boolean value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.iOS is not an object', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 'string', iOS: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.iOS' expected an object value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.iOS.bundleId is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 'string', iOS: { bundleId: 123 } });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android is not an object', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, { url: 'string', android: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.android' expected an object value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.packageName is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, {
            url: 'string',
            android: { packageName: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.packageName' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.installApp is not a boolean', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, {
            url: 'string',
            android: { packageName: 'packageName', installApp: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.minimumVersion is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await sendEmailVerification(auth.currentUser, {
            url: 'string',
            android: { packageName: 'packageName', minimumVersion: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should not error', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);

        try {
          await sendEmailVerification(auth.currentUser);
        } catch (error) {
          return Promise.reject(new Error('sendEmailVerification() caused an error', error));
        } finally {
          await deleteUser(auth.currentUser);
        }

        return Promise.resolve();
      });

      it('should correctly report emailVerified status', async function () {
        const {
          getAuth,
          createUserWithEmailAndPassword,
          deleteUser,
          sendEmailVerification,
          reload,
        } = authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#a');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);
        auth.currentUser.email.should.equal(email);
        auth.currentUser.emailVerified.should.equal(false);

        try {
          await sendEmailVerification(auth.currentUser);
          const { oobCode } = await getLastOob(email);
          await verifyEmail(oobCode);
          auth.currentUser.emailVerified.should.equal(false);
          await reload(auth.currentUser);
          auth.currentUser.emailVerified.should.equal(true);
        } catch (error) {
          return Promise.reject(new Error('sendEmailVerification() caused an error', error));
        } finally {
          await deleteUser(auth.currentUser);
        }

        return Promise.resolve();
      });

      it('should work with actionCodeSettings', async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser, sendEmailVerification } =
          authModular;
        const actionCodeSettings = {
          handleCodeInApp: true,
          url: 'https://react-native-firebase-testing.firebaseapp.com/foo',
        };
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);

        try {
          await sendEmailVerification(auth.currentUser, actionCodeSettings);
        } catch (error) {
          return Promise.reject(
            new Error('sendEmailVerification(actionCodeSettings) error' + error.message),
          );
        } finally {
          await deleteUser(auth.currentUser);
        }

        return Promise.resolve();
      });

      it('should throw an error within an invalid action code url', async function () {
        const { getAuth, createUserWithEmailAndPassword, sendEmailVerification } = authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        await createUserWithEmailAndPassword(auth, email, random);

        try {
          await sendEmailVerification(auth.currentUser, { url: [] });
        } catch (error) {
          error.message.should.containEql(
            "firebase.auth.User.sendEmailVerification(*) 'actionCodeSettings.url' expected a string value.",
          );
        }
      });
    });

    describe('verifyBeforeUpdateEmail()', function () {
      it('should error if newEmail is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, 123);
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'newEmail' expected a string value");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.url is not present', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {});
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.url is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;

        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, { url: 123 });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.url' expected a string value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.dynamicLinkDomain is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            dynamicLinkDomain: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.dynamicLinkDomain' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if handleCodeInApp is not a boolean', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            handleCodeInApp: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.handleCodeInApp' expected a boolean value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.iOS is not an object', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            iOS: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.iOS' expected an object value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.iOS.bundleId is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            iOS: { bundleId: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.iOS.bundleId' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android is not an object', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            android: 123,
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql("'actionCodeSettings.android' expected an object value.");
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.packageName is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            android: { packageName: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.packageName' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.installApp is not a boolean', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            android: { packageName: 'string', installApp: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.installApp' expected a boolean value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      it('should error if actionCodeSettings.android.minimumVersion is not a string', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        await createUserWithEmailAndPassword(auth, email, random);
        try {
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, {
            url: 'string',
            android: { packageName: 'string', minimumVersion: 123 },
          });
          return Promise.reject(new Error('it did not error'));
        } catch (error) {
          error.message.should.containEql(
            "'actionCodeSettings.android.minimumVersion' expected a string value.",
          );
        }
        await deleteUser(auth.currentUser);
      });

      // FIXME ios+android failing with an internal error against auth emulator
      // com.google.firebase.FirebaseException: An internal error has occurred. [ VERIFY_AND_CHANGE_EMAIL ]
      xit('should not error', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;

        try {
          await createUserWithEmailAndPassword(auth, email, random);
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail);
        } catch (e) {
          return Promise.reject("'verifyBeforeUpdateEmail()' did not work");
        }
        await deleteUser(auth.currentUser);
      });

      // FIXME ios+android failing with an internal error against auth emulator
      // com.google.firebase.FirebaseException: An internal error has occurred. [ VERIFY_AND_CHANGE_EMAIL ]
      xit('should work with actionCodeSettings', async function () {
        const { getAuth, createUserWithEmailAndPassword, verifyBeforeUpdateEmail, deleteUser } =
          authModular;
        const auth = getAuth();
        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const updateEmail = `${random2}@${random2}.com`;
        const actionCodeSettings = {
          url: 'https://react-native-firebase-testing.firebaseapp.com/foo',
        };
        try {
          await createUserWithEmailAndPassword(auth, email, random);
          await verifyBeforeUpdateEmail(auth.currentUser, updateEmail, actionCodeSettings);
          await deleteUser(auth.currentUser);
        } catch (error) {
          try {
            await deleteUser(auth.currentUser);
          } catch (e) {
            consle.log(e);
            /* do nothing */
          }

          return Promise.reject(
            "'verifyBeforeUpdateEmail()' with 'actionCodeSettings' did not work",
          );
        }
        return Promise.resolve();
      });
    });

    describe('unlink()', function () {
      it('should unlink the email address', async function () {
        const { getAuth, signInAnonymously, linkWithCredential, unlink, deleteUser } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;

        await signInAnonymously(auth);

        const credential = firebase.auth.EmailAuthProvider.credential(email, pass);
        await linkWithCredential(auth.currentUser, credential);

        // Test
        await unlink(auth.currentUser, firebase.auth.EmailAuthProvider.PROVIDER_ID);

        // Assertions
        const unlinkedUser = auth.currentUser;
        unlinkedUser.providerData.should.be.an.Array();
        unlinkedUser.providerData.length.should.equal(0);

        // Clean up
        await deleteUser(auth.currentUser);
      });
    });

    describe('updateEmail()', function () {
      it('should update the email address', async function () {
        const { getAuth, updateEmail, deleteUser, createUserWithEmailAndPassword } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#a');
        const random2 = Utils.randString(12, '#a');
        const email = `${random}@${random}.com`;
        const email2 = `${random2}@${random2}.com`;
        // Setup
        await createUserWithEmailAndPassword(auth, email, random);
        auth.currentUser.email.should.equal(email);

        // Update user email
        await updateEmail(auth.currentUser, email2);

        // Assertions
        auth.currentUser.email.should.equal(email2);

        // Clean up
        await deleteUser(auth.currentUser);
      });
    });

    describe('updatePhoneNumber()', function () {
      // Phone numbers not supported in other environments
      if (Platform.other) {
        return;
      }

      it('should update the phone number', async function () {
        const { getAuth, signInWithPhoneNumber, updatePhoneNumber, verifyPhoneNumber } =
          authModular;
        const auth = getAuth();

        const testPhone = await getRandomPhoneNumber();
        const confirmResult = await signInWithPhoneNumber(auth, testPhone);
        const smsCode = await getLastSmsCode(testPhone);
        await confirmResult.confirm(smsCode);

        auth.currentUser.phoneNumber.should.equal(testPhone);

        const newPhone = await getRandomPhoneNumber();
        const newPhoneVerificationId = await new Promise((resolve, reject) => {
          verifyPhoneNumber(auth, newPhone).on('state_changed', phoneAuthSnapshot => {
            if (phoneAuthSnapshot.error) {
              reject(phoneAuthSnapshot.error);
            } else {
              resolve(phoneAuthSnapshot.verificationId);
            }
          });
        });

        try {
          const newSmsCode = await getLastSmsCode(newPhone);
          const credential = firebase.auth.PhoneAuthProvider.credential(
            newPhoneVerificationId,
            newSmsCode,
          );

          // Update with number?
          await updatePhoneNumber(auth.currentUser, credential);
        } catch (e) {
          throw e;
        }

        auth.currentUser.phoneNumber.should.equal(newPhone);
      });
    });

    describe('updatePassword()', function () {
      it('should update the password', async function () {
        const {
          getAuth,
          createUserWithEmailAndPassword,
          updatePassword,
          signOut,
          signInWithEmailAndPassword,
          deleteUser,
        } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const random2 = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;
        const pass2 = random2;

        // Setup
        await createUserWithEmailAndPassword(auth, email, pass);

        // Update user password
        await updatePassword(auth.currentUser, pass2);

        // Sign out
        await signOut(auth);

        // Log in with the new password
        await signInWithEmailAndPassword(auth, email, pass2);

        // Assertions
        auth.currentUser.should.be.an.Object();
        auth.currentUser.email.should.equal(email.toLowerCase());

        // Clean up
        await deleteUser(auth.currentUser);
      });

      // Can only be run/reproduced locally with Firebase Auth rate limits lowered on the Firebase console.
      xit('should throw too many requests when limit has been reached', async function () {
        const { getAuth, createUserWithEmailAndPassword } = authModular;
        const auth = getAuth();

        await Utils.sleep(10000);
        try {
          // Setup for creating new accounts
          const random = Utils.randString(12, '#aA');
          const email = `${random}@${random}.com`;
          const pass = random;

          const promises = [];

          // Create 10 accounts to force the error
          [...Array(10).keys()].map($ =>
            promises.push(
              new Promise(r => r(createUserWithEmailAndPassword(auth, email + $, pass))),
            ),
          );

          await Promise.all(promises);

          return Promise.reject('Should have rejected');
        } catch (ex) {
          ex.code.should.equal('auth/too-many-requests');
          return Promise.resolve();
        }
      });
    });

    describe('updateProfile()', function () {
      it('should update the profile', async function () {
        const { getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;
        const pass = random;
        const displayName = random;
        const photoURL = `http://${random}.com/${random}.jpg`;

        // Setup
        await createUserWithEmailAndPassword(auth, email, pass);

        // Update user profile
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL,
        });

        // Assertions
        const user = auth.currentUser;
        user.should.be.an.Object();
        user.email.should.equal(email.toLowerCase());
        user.displayName.should.equal(displayName);
        user.photoURL.should.equal(photoURL);

        // Clean up
        await deleteUser(auth.currentUser);
      });

      it('should return a valid profile when signing in anonymously', async function () {
        const { getAuth, signInAnonymously, deleteUser } = authModular;
        const auth = getAuth();

        // Setup
        await signInAnonymously(auth);
        const currentUser = auth.currentUser;

        // Assertions
        currentUser.should.be.an.Object();
        should.equal(currentUser.email, null);
        should.equal(currentUser.displayName, null);
        should.equal(currentUser.emailVerified, false);
        should.equal(currentUser.isAnonymous, true);
        should.equal(currentUser.phoneNumber, null);
        should.equal(currentUser.photoURL, null);
        should.exist(currentUser.metadata.lastSignInTime);
        should.exist(currentUser.metadata.creationTime);
        should.deepEqual(currentUser.providerData, []);
        should.exist(currentUser.providerId);
        should.exist(currentUser.uid);

        // Clean up
        await deleteUser(auth.currentUser);
      });
    });

    describe('linkWithPhoneNumber()', function () {
      it('should throw an unsupported error', async function () {
        const { getAuth, signInAnonymously, signOut, linkWithPhoneNumber } = authModular;
        const auth = getAuth();

        await signInAnonymously(auth);

        try {
          await linkWithPhoneNumber(auth.currentUser);
        } catch (e) {
          e.message.should.containEql(
            'linkWithPhoneNumber is unsupported by the native Firebase SDKs',
          );
        }
        await signOut(auth);
      });
    });

    describe('reauthenticateWithPhoneNumber()', function () {
      it('should throw an unsupported error', async function () {
        const { getAuth, signInAnonymously, signOut, reauthenticateWithPhoneNumber } = authModular;
        const auth = getAuth();

        await signInAnonymously(auth);
        try {
          await reauthenticateWithPhoneNumber(auth.currentUser);
        } catch (e) {
          e.message.should.containEql(
            'reauthenticateWithPhoneNumber is unsupported by the native Firebase SDKs',
          );
        }
        await signOut(auth);
      });
    });

    describe('refreshToken', function () {
      it('should throw an unsupported error', async function () {
        const { getAuth, signInAnonymously, signOut } = authModular;
        const auth = getAuth();

        await signInAnonymously(auth);
        (() => auth.currentUser.refreshToken).should.throw(
          'firebase.auth.User.refreshToken is unsupported by the native Firebase SDKs.',
        );
        await signOut(auth);
      });
    });

    describe('user.metadata', function () {
      it("should have the properties 'lastSignInTime' & 'creationTime' which are ISO strings", async function () {
        const { getAuth, createUserWithEmailAndPassword, deleteUser } = authModular;
        const auth = getAuth();

        const random = Utils.randString(12, '#aA');
        const email = `${random}@${random}.com`;

        const { user } = await createUserWithEmailAndPassword(auth, email, random);

        const { metadata } = user;

        should(metadata.lastSignInTime).be.a.String();
        should(metadata.creationTime).be.a.String();

        new Date(metadata.lastSignInTime).getFullYear().should.equal(new Date().getFullYear());
        new Date(metadata.creationTime).getFullYear().should.equal(new Date().getFullYear());

        await deleteUser(auth.currentUser);
      });
    });
  });
});
