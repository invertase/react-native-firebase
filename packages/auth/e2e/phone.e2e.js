const TEST_PHONE_A = '+447445255123';
const TEST_CODE_A = '123456';

// const TEST_PHONE_B = '+447445123457';
// const TEST_CODE_B = '654321';

describe('auth() => Phone', () => {
  before(async () => {
    firebase.auth().settings.appVerificationDisabledForTesting = true;
    await firebase.auth().settings.setAutoRetrievedSmsCodeForPhoneNumber(TEST_PHONE_A, TEST_CODE_A);
    await Utils.sleep(50);
  });

  beforeEach(async () => {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });

  // TODO these are flakey on CI and sometimes fail - needs investigation
  describe('signInWithPhoneNumber', () => {
    it('signs in with a valid code', async () => {
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      const userCredential = await confirmResult.confirm(TEST_CODE_A);
      userCredential.user.should.be.instanceOf(jet.require('packages/auth/lib/User'));
      userCredential.user.phoneNumber.should.equal(TEST_PHONE_A);
    });

    it('errors on invalid code', async () => {
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      await confirmResult.confirm('666999').should.be.rejected();
      // TODO test error code and message
    });

    it('it should return an error for signing in a non string based number', () =>
      new Promise((resolve, reject) => {
        const successCb = () => {
          reject(new Error('Should not have successfully resolved.'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/argument-error');
          error.message.should.containEql(
            'signInWithPhoneNumber failed: First argument "phoneNumber" must be a valid string.',
          );
          resolve();
        };

        return firebase
          .auth()
          .signInWithPhoneNumber(0)
          .then(successCb)
          .catch(failureCb);
      }));

    it('it should return an error for signing in an empty string based phone number', () =>
      new Promise((resolve, reject) => {
        const successCb = () => {
          reject(new Error('Should not have successfully resolved.'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/argument-error');
          error.message.should.containEql(
            'signInWithPhoneNumber failed: First argument "phoneNumber" must be a valid string.',
          );
          resolve();
        };

        return firebase
          .auth()
          .signInWithPhoneNumber('')
          .then(successCb)
          .catch(failureCb);
      }));

    it('it should return an error for verifying a non string based number', () =>
      new Promise((resolve, reject) => {
        const successCb = () => {
          reject(new Error('Should not have successfully resolved.'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/argument-error');
          error.message.should.containEql(
            'signInWithPhoneNumber failed: First argument "phoneNumber" must be a valid string.',
          );
          resolve();
        };

        return firebase
          .auth()
          .verifyPhoneNumber(0)
          .then(successCb)
          .catch(failureCb);
      }));

    it('it should return an error for verifying an empty string based phone number', () =>
      new Promise((resolve, reject) => {
        const successCb = () => {
          reject(new Error('Should not have successfully resolved.'));
        };

        const failureCb = error => {
          error.code.should.equal('auth/argument-error');
          error.message.should.containEql(
            'signInWithPhoneNumber failed: First argument "phoneNumber" must be a valid string.',
          );
          resolve();
        };

        return firebase
          .auth()
          .verifyPhoneNumber('')
          .then(successCb)
          .catch(failureCb);
      }));
  });
});
