// const TEST_EMAIL = 'test@test.com';
// const TEST_PASS = 'test1234';

const { clearAllUsers, getLastSmsCode, getRandomPhoneNumber } = require('./helpers');

describe('auth() => Phone', function () {
  before(async function () {
    try {
      await clearAllUsers();
    } catch (e) {
      throw e;
    }
    firebase.auth().settings.appVerificationDisabledForTesting = true;
    await Utils.sleep(50);
  });

  beforeEach(async function () {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });

  describe('signInWithPhoneNumber', function () {
    it('signs in with a valid code', async function () {
      const testPhone = getRandomPhoneNumber();
      const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      const lastSmsCode = await getLastSmsCode(testPhone);
      const userCredential = await confirmResult.confirm(lastSmsCode);
      userCredential.user.should.be.instanceOf(jet.require('packages/auth/lib/User'));

      // Broken check, phone number is undefined
      // userCredential.user.phoneNumber.should.equal(TEST_PHONE_A);
    });

    it('errors on invalid code', async function () {
      const testPhone = getRandomPhoneNumber();
      const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
      confirmResult.verificationId.should.be.a.String();
      should.ok(confirmResult.verificationId.length, 'verificationId string should not be empty');
      confirmResult.confirm.should.be.a.Function();
      // Get the last SMS code just to make absolutely sure we don't accidentally use it
      const lastSmsCode = await getLastSmsCode(testPhone);
      await confirmResult
        .confirm(lastSmsCode === '000000' ? '111111' : '000000')
        .should.be.rejected();
      // TODO test error code and message

      // If you don't consume the valid code, then it sticks around
      await confirmResult.confirm(lastSmsCode);
    });
  });

  describe('verifyPhoneNumber', function () {
    it('successfully verifies', async function () {
      const testPhone = getRandomPhoneNumber();
      const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
      const lastSmsCode = await getLastSmsCode(testPhone);
      await confirmResult.confirm(lastSmsCode);
      await firebase.auth().verifyPhoneNumber(testPhone, false, false);
    });

    it('uses the autoVerifyTimeout when a non boolean autoVerifyTimeoutOrForceResend is provided', async function () {
      const testPhone = getRandomPhoneNumber();
      const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
      const lastSmsCode = await getLastSmsCode(testPhone);
      await confirmResult.confirm(lastSmsCode);
      await firebase.auth().verifyPhoneNumber(testPhone, 0, false);
    });

    it('throws an error with an invalid on event', async function () {
      const testPhone = getRandomPhoneNumber();
      try {
        await firebase
          .auth()
          .verifyPhoneNumber(testPhone)
          .on('example', () => {});

        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "firebase.auth.PhoneAuthListener.on(*, _, _, _) 'event' must equal 'state_changed'.",
        );
        return Promise.resolve();
      }
    });

    it('throws an error with an invalid observer event', async function () {
      const testPhone = getRandomPhoneNumber();
      try {
        await firebase
          .auth()
          .verifyPhoneNumber(testPhone)
          .on('state_changed', null, null, () => {});

        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "firebase.auth.PhoneAuthListener.on(_, *, _, _) 'observer' must be a function.",
        );
        return Promise.resolve();
      }
    });

    it('successfully runs verification complete handler', async function () {
      const testPhone = getRandomPhoneNumber();
      await firebase
        .auth()
        .verifyPhoneNumber(testPhone)
        .then($ => $);

      return Promise.resolve();
    });

    it('successfully runs and adds emitters', async function () {
      const testPhone = await getRandomPhoneNumber();
      const obervserCb = () => {};
      const errorCb = () => {};
      const successCb = () => {
        return Promise.resolve();
      };

      await firebase
        .auth()
        .verifyPhoneNumber(testPhone)
        .on('state_changed', obervserCb, errorCb, successCb, () => {});
    });

    it('catches an error and emits an error event', async function () {
      return firebase
        .auth()
        .verifyPhoneNumber('test')
        .catch(() => Promise.resolve());
    });
  });
});
