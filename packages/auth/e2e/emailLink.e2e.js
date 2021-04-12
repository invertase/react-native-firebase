const { getLastOob, signInUser } = require('./helpers');

describe('auth() -> emailLink Provider', function () {
  beforeEach(async function () {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });

  describe('sendSignInLinkToEmail', function () {
    it('should send email', async function () {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;
      // const email = 'MANUAL TEST EMAIL HERE';
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
      await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
    });

    it('sign in via email works', async function () {
      const random = Utils.randString(12, '#aa');
      const email = `${random}@${random}.com`;
      const continueUrl = 'http://localhost:1337/authLinkFoo?bar=' + random;
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
      await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
      const oobInfo = await getLastOob(email);
      oobInfo.oobLink.should.containEql(encodeURIComponent(continueUrl));
      const signInResponse = await signInUser(oobInfo.oobLink);
      signInResponse.should.containEql(continueUrl);
      signInResponse.should.containEql(oobInfo.oobCode);
    });

    xit('should send email with defaults', async function () {
      const random = Utils.randString(12, '#aA');
      const email = `${random}@${random}.com`;

      await firebase.auth().sendSignInLinkToEmail(email);
    });
  });

  describe('isSignInWithEmailLink', function () {
    it('should return true/false', async function () {
      const emailLink1 = 'https://www.example.com/action?mode=signIn&oobCode=oobCode';
      const emailLink2 = 'https://www.example.com/action?mode=verifyEmail&oobCode=oobCode';
      const emailLink3 = 'https://www.example.com/action?mode=signIn';
      const emailLink4 =
        'https://x59dg.app.goo.gl/?link=https://rnfirebase-b9ad4.firebaseapp.com/__/auth/action?apiKey%3Dfoo%26mode%3DsignIn%26oobCode%3Dbar';

      should.equal(true, firebase.auth().isSignInWithEmailLink(emailLink1));
      should.equal(false, firebase.auth().isSignInWithEmailLink(emailLink2));
      should.equal(false, firebase.auth().isSignInWithEmailLink(emailLink3));
      should.equal(true, firebase.auth().isSignInWithEmailLink(emailLink4));
    });
  });

  // FOR MANUAL TESTING ONLY
  xdescribe('signInWithEmailLink', function () {
    it('should signIn', async function () {
      const email = 'MANUAL TEST EMAIL HERE';
      const emailLink = 'MANUAL TEST CODE HERE';

      const userCredential = await firebase.auth().signInWithEmailLink(email, emailLink);

      userCredential.user.email.should.equal(email);

      await await firebase.auth().signOut();
    });
  });
});
