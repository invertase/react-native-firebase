describe('auth() -> emailLink Provider', () => {
  describe('sendSignInLinkToEmail', () => {
    it('should send email', async () => {
      const random = randomString(12, '#aA');
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
  });

  // FOR MANUAL TESTING ONLY
  xdescribe('signInWithEmailLink', () => {
    it('should signIn', async () => {
      const email = 'MANUAL TEST EMAIL HERE';
      const emailLink = 'MANUAL TEST CODE HERE';

      const userCredential = await firebase
        .auth()
        .signInWithEmailLink(email, emailLink);

      userCredential.user.email.should.equal(email);

      await await firebase.auth().signOut();
    });
  });
});
