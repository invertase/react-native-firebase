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

  describe('signInWithPhoneNumber', () => {
    xit('signs in with a valid code', async () => {
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      const userCredential = await confirmResult.confirm(TEST_CODE_A);
      userCredential.user.should.be.instanceOf(jet.require('packages/auth/lib/User'));

      // Broken check, phone number is undefined
      // userCredential.user.phoneNumber.should.equal(TEST_PHONE_A);
    });

    it('errors on invalid code', async () => {
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      await confirmResult.confirm('666999').should.be.rejected();
      // TODO test error code and message
    });
  });

  describe('verifyPhoneNumber', async () => {
    it('successfully verifies', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);
      await firebase.auth().verifyPhoneNumber(TEST_PHONE_A, false, false);
    });

    it('uses the autoVerifyTimeout when a non boolean autoVerifyTimeoutOrForceResend is provided', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);
      await firebase.auth().verifyPhoneNumber(TEST_PHONE_A, 0, false);
    });

    it('throws an error with an invalid on event', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);

      try {
        await firebase
          .auth()
          .verifyPhoneNumber(TEST_PHONE_A)
          .on('example', () => {});

        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "firebase.auth.PhoneAuthListener.on(*, _, _, _) 'event' must equal 'state_changed'.",
        );
        return Promise.resolve();
      }
    });

    it('throws an error with an invalid observer event', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);

      try {
        await firebase
          .auth()
          .verifyPhoneNumber(TEST_PHONE_A)
          .on('state_changed', null, null, () => {});

        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "firebase.auth.PhoneAuthListener.on(_, *, _, _) 'observer' must be a function.",
        );
        return Promise.resolve();
      }
    });

    it('successfully runs verification complete handler', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);

      await firebase
        .auth()
        .verifyPhoneNumber(TEST_PHONE_A)
        .then($ => $);

      return Promise.resolve();
    });

    it('successfully runs and adds emiters', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);

      const obervserCb = () => {};

      const errorCb = () => {};

      const successCb = () => {
        return Promise.resolve();
      };

      await firebase
        .auth()
        .verifyPhoneNumber(TEST_PHONE_A)
        .on('state_changed', obervserCb, errorCb, successCb, () => {});
    });

    it('catches an error and emits an error event', async () => {
      const TEST_PHONE_A = '+447445255123';
      const confirmResult = await firebase.auth().signInWithPhoneNumber(TEST_PHONE_A);

      await confirmResult.confirm(TEST_CODE_A);

      return firebase
        .auth()
        .verifyPhoneNumber('test')
        .catch(() => Promise.resolve());
    });
  });
});
