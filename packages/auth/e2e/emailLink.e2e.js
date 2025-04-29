const { getLastOob, signInUser } = require('./helpers');

describe('auth() -> emailLink Provider', function () {
  beforeEach(async function () {
    const { getAuth, signOut } = authModular;

    const auth = getAuth();
    if (auth.currentUser) {
      await signOut(auth);
      await Utils.sleep(50);
    }
  });

  describe('sendSignInLinkToEmail', function () {
    it('should send email', async function () {
      const { getAuth, sendSignInLinkToEmail } = authModular;

      const auth = getAuth();
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      const actionCodeSettings = {
        url: 'http://localhost:1337/authLinkFoo?bar=1234',
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.testing',
        },
        android: {
          packageName: 'com.testing',
          installApp: true,
          minimumVersion: '12',
        },
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    });

    it('sign in via email works', async function () {
      const { getAuth, sendSignInLinkToEmail } = authModular;

      const auth = getAuth();
      const random = Utils.randString(12, '#aa');
      const email = `${random}@${random}.com`;
      const continueUrl = `http://${Platform.android ? '10.0.2.2' : '127.0.0.1'}:8081/authLinkFoo?bar=${random}`;
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.testing',
        },
        android: {
          packageName: 'com.testing',
          installApp: true,
          minimumVersion: '12',
        },
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      const oobInfo = await getLastOob(email);
      oobInfo.oobLink.should.containEql(encodeURIComponent(continueUrl));
      const signInResponse = await signInUser(oobInfo.oobLink);
      signInResponse.should.containEql(continueUrl);
      signInResponse.should.containEql(oobInfo.oobCode);
    });

    xit('should send email with defaults', async function () {
      const { getAuth, sendSignInLinkToEmail } = authModular;

      const auth = getAuth();
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;

      await sendSignInLinkToEmail(auth, email);
    });
  });

  describe('isSignInWithEmailLink', function () {
    it('should return true/false', async function () {
      const { getAuth, isSignInWithEmailLink } = authModular;

      const auth = getAuth();
      const emailLink1 = 'https://www.example.com/action?mode=signIn&oobCode=oobCode';
      const emailLink2 = 'https://www.example.com/action?mode=verifyEmail&oobCode=oobCode';
      const emailLink3 = 'https://www.example.com/action?mode=signIn';
      const emailLink4 =
        'https://x59dg.app.goo.gl/?link=https://rnfirebase-b9ad4.firebaseapp.com/__/auth/action?apiKey%3Dfoo%26mode%3DsignIn%26oobCode%3Dbar';
      const emailLink5 = 'https://www.example.com/action?mode=signIn&oobCode=oobCode&apiKey=foo';

      // ios does not require apiKey, but android and web/other do
      if (!Platform.ios) {
        should.equal(false, await isSignInWithEmailLink(auth, emailLink1));
      } else {
        should.equal(true, await isSignInWithEmailLink(auth, emailLink1));
      }
      should.equal(false, await isSignInWithEmailLink(auth, emailLink2));
      should.equal(false, await isSignInWithEmailLink(auth, emailLink3));
      should.equal(true, await isSignInWithEmailLink(auth, emailLink4));
      should.equal(true, await isSignInWithEmailLink(auth, emailLink5));
    });
  });

  describe('signInWithEmailLink', function () {
    it('sign in via email does not crash with missing apiKey', async function () {
      const { getAuth, sendSignInLinkToEmail, signInWithEmailLink } = authModular;

      const auth = getAuth();
      const random = Utils.randString(12, '#aa');
      const email = `${random}@${random}.com`;
      const continueUrl = `http://${Platform.android ? '10.0.2.2' : '127.0.0.1'}:8081/authLinkFoo?bar=${random}`;
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.testing',
        },
        android: {
          packageName: 'com.testing',
          installApp: true,
          minimumVersion: '12',
        },
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      const oobInfo = await getLastOob(email);
      oobInfo.oobLink.should.containEql(encodeURIComponent(continueUrl));

      // Specifically remove the apiKey param. Android requires it and needs
      // specific error handling or it crashes, See #8360
      let linkNoApiKey = oobInfo.oobLink.replace('&apiKey=fake-api-key', '');
      try {
        const signInResponse = await signInWithEmailLink(auth, email, linkNoApiKey);
        if (Platform.OS !== 'ios') {
          throw new Error('Should have rejected on Android and Other');
        } else {
          signInResponse.user.email.should.equal(email);
          auth.currentUser.email.should.equal(email);
        }
      } catch (e) {
        if (Platform.OS === 'android') {
          e.message.should.containEql('Given link is not a valid email link');
        } else if (Platform.OS === 'macos') {
          e.message.should.containEql('auth/argument-error');
        } else {
          // ios should have been fine without apiKey
          throw e;
        }
      }
    });

    // FOR MANUAL TESTING ONLY
    xit('should signIn', async function () {
      const auth = getAuth();
      const email = 'MANUAL TEST EMAIL HERE';
      const emailLink = 'MANUAL TEST CODE HERE';

      const userCredential = await signInWithEmailLink(auth, email, emailLink);

      userCredential.user.email.should.equal(email);

      await signOut(auth);
    });
  });
});
