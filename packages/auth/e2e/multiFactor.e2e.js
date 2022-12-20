const {
  clearAllUsers,
  getLastSmsCode,
  createUserWithMultiFactor,
  createVerifiedUser,
  getRandomPhoneNumber,
  signInUserWithMultiFactor,
} = require('./helpers');

const TEST_EMAIL = 'test@example.com';
const TEST_PASS = 'test1234';

describe('multi-factor', function () {
  beforeEach(async function () {
    await clearAllUsers();
    await firebase.auth().createUserWithEmailAndPassword(TEST_EMAIL, TEST_PASS);
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await Utils.sleep(50);
    }
  });
  it('has no multi-factor information if not enrolled', async function () {
    await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS);
    const { multiFactor } = firebase.auth().currentUser;
    multiFactor.should.be.an.Object();
    multiFactor.enrolledFactors.should.be.an.Array();
    multiFactor.enrolledFactors.length.should.equal(0);
    return Promise.resolve();
  });

  describe('sign-in', function () {
    it('requires multi-factor auth when enrolled', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }
      const { phoneNumber, email, password } = await createUserWithMultiFactor();

      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        const resolver = firebase.auth().getMultiFactorResolver(e);
        resolver.should.be.an.Object();
        resolver.hints.should.be.an.Array();
        resolver.hints.length.should.equal(1);
        resolver.session.should.be.a.String();

        const verificationId = await firebase
          .auth()
          .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);
        verificationId.should.be.a.String();

        let verificationCode = await getLastSmsCode(phoneNumber);
        if (verificationCode == null) {
          // iOS simulator uses a masked phone number
          const maskedNumber = '+********' + phoneNumber.substring(phoneNumber.length - 4);
          verificationCode = await getLastSmsCode(maskedNumber);
        }
        const credential = firebase.auth.PhoneAuthProvider.credential(
          verificationId,
          verificationCode,
        );
        const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
        return resolver
          .resolveSignIn(multiFactorAssertion)
          .then(userCreds => {
            userCreds.should.be.an.Object();
            userCreds.user.should.be.an.Object();
            userCreds.user.email.should.equal('verified@example.com');
            userCreds.user.multiFactor.should.be.an.Object();
            userCreds.user.multiFactor.enrolledFactors.length.should.equal(1);
            return Promise.resolve();
          })
          .catch(e => {
            return Promise.reject(e);
          });
      }

      return Promise.reject(new Error('Multi-factor users need to handle an exception on sign-in'));
    });
    it('reports an error when providing an invalid sms code', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      const { phoneNumber, email, password } = await createUserWithMultiFactor();

      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        const resolver = firebase.auth().getMultiFactorResolver(e);
        const verificationId = await firebase
          .auth()
          .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);

        const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, 'incorrect');
        const assertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
        try {
          await resolver.resolveSignIn(assertion);
        } catch (e) {
          e.message
            .toLocaleLowerCase()
            .should.containEql(
              '[auth/invalid-verification-code] The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms'.toLocaleLowerCase(),
            );

          const verificationId = await firebase
            .auth()
            .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);
          const verificationCode = await getLastSmsCode(phoneNumber);
          const credential = firebase.auth.PhoneAuthProvider.credential(
            verificationId,
            verificationCode,
          );
          const assertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
          await resolver.resolveSignIn(assertion);
          firebase.auth().currentUser.email.should.equal(email);
          return Promise.resolve();
        }
      }
      return Promise.reject();
    });
    it('reports an error when providing an invalid verification code', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }
      const { phoneNumber, email, password } = await createUserWithMultiFactor();

      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        const resolver = firebase.auth().getMultiFactorResolver(e);
        await firebase
          .auth()
          .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);
        const verificationCode = await getLastSmsCode(phoneNumber);

        const credential = firebase.auth.PhoneAuthProvider.credential(
          'incorrect',
          verificationCode,
        );
        const assertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);
        try {
          await resolver.resolveSignIn(assertion);
        } catch (e) {
          e.message.should.equal(
            '[auth/invalid-verification-id] The verification ID used to create the phone auth credential is invalid.',
          );

          return Promise.resolve();
        }
      }
      return Promise.reject();
    });
    it('reports an error when using an unknown factor', async function () {
      const { email, password } = await createUserWithMultiFactor();

      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        const resolver = firebase.auth().getMultiFactorResolver(e);
        const unknownFactor = {
          uid: 'notknown',
        };
        try {
          await firebase
            .auth()
            .verifyPhoneNumberWithMultiFactorInfo(unknownFactor, resolver.session);
        } catch (e) {
          e.code.should.equal('auth/multi-factor-info-not-found');
          e.message.should.equal(
            '[auth/multi-factor-info-not-found] The user does not have a second factor matching the identifier provided.',
          );

          return Promise.resolve();
        }
      }
      return Promise.reject();
    });
  });

  describe('enroll', function () {
    it("can't enroll an existing user without verified email", async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS);

      try {
        const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);
        const session = await multiFactorUser.getSession();
        await firebase
          .auth()
          .verifyPhoneNumberForMultiFactor({ phoneNumber: getRandomPhoneNumber(), session });
      } catch (e) {
        e.message.should.equal('[auth/unverified-email] This operation requires a verified email.');
        e.code.should.equal('auth/unverified-email');
        return Promise.resolve();
      }

      return Promise.reject(new Error('Should throw error for unverified user.'));
    });

    it('can enroll new factor', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      try {
        await createVerifiedUser('verified@example.com', 'test123');
        const phoneNumber = getRandomPhoneNumber();

        should.deepEqual(firebase.auth().currentUser.multiFactor.enrolledFactors, []);
        const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);

        const session = await multiFactorUser.getSession();

        const verificationId = await firebase
          .auth()
          .verifyPhoneNumberForMultiFactor({ phoneNumber, session });
        const verificationCode = await getLastSmsCode(phoneNumber);
        const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
        await multiFactorUser.enroll(multiFactorAssertion, 'Hint displayName');

        const enrolledFactors = firebase.auth().currentUser.multiFactor.enrolledFactors;
        enrolledFactors.length.should.equal(1);
        enrolledFactors[0].displayName.should.equal('Hint displayName');
        enrolledFactors[0].factorId.should.equal('phone');
        enrolledFactors[0].uid.should.be.a.String();
        enrolledFactors[0].enrollmentTime.should.be.a.String();
      } catch (e) {
        return Promise.reject(e);
      }
      return Promise.resolve();
    });
    it('can enroll new factor without display name', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      try {
        await createVerifiedUser('verified@example.com', 'test123');
        const phoneNumber = getRandomPhoneNumber();

        should.deepEqual(firebase.auth().currentUser.multiFactor.enrolledFactors, []);
        const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);

        const session = await multiFactorUser.getSession();

        const verificationId = await firebase
          .auth()
          .verifyPhoneNumberForMultiFactor({ phoneNumber, session });
        const verificationCode = await getLastSmsCode(phoneNumber);
        const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
        await multiFactorUser.enroll(multiFactorAssertion);

        const enrolledFactors = firebase.auth().currentUser.multiFactor.enrolledFactors;
        enrolledFactors.length.should.equal(1);
        should.equal(enrolledFactors[0].displayName, null);
      } catch (e) {
        return Promise.reject(e);
      }
      return Promise.resolve();
    });
    it('can enroll multiple factors', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      const { email, password, phoneNumber } = await createUserWithMultiFactor();
      await signInUserWithMultiFactor(email, password, phoneNumber);

      const anotherNumber = getRandomPhoneNumber();
      const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);

      const session = await multiFactorUser.getSession();
      const verificationId = await firebase
        .auth()
        .verifyPhoneNumberForMultiFactor({ phoneNumber: anotherNumber, session });
      const verificationCode = await getLastSmsCode(anotherNumber);
      const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
      const displayName = 'Another displayName';
      await multiFactorUser.enroll(multiFactorAssertion, displayName);

      const enrolledFactors = firebase.auth().currentUser.multiFactor.enrolledFactors;
      enrolledFactors.length.should.equal(2);
      const matchingFactor = enrolledFactors.find(factor => factor.displayName === displayName);
      matchingFactor.should.be.an.Object();
      matchingFactor.uid.should.be.a.String();
      matchingFactor.enrollmentTime.should.be.a.String();
      matchingFactor.factorId.should.equal('phone');

      return Promise.resolve();
    });
    it('can not enroll the same factor twice', async function () {
      this.skip();
      // This test should probably be implemented but doesn't work:
      // Every time the same phone number requests a verification code,
      // the emulator endpoint does not return a code, even though the emulator log
      // prints a code.
      // See https://github.com/firebase/firebase-tools/issues/4290#issuecomment-1281260335
      /*
        await clearAllUsers();
        const { email, password, phoneNumber } = await createUserWithMultiFactor();
        await signInUserWithMultiFactor(email, password, phoneNumber);
        const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);
        const session = await multiFactorUser.getSession();

        const verificationId = await firebase
          .auth()
          .verifyPhoneNumberForMultiFactor({ phoneNumber, session });
        const verificationCode = await getLastSmsCode(phoneNumber);

        const cred = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
        const displayName = 'Another displayName';
        try {
          await multiFactorUser.enroll(multiFactorAssertion, displayName);
        } catch (e) {
          console.error(e);
          return Promise.resolve();
        }
        return Promise.reject();
        */
    });

    it('throws an error for wrong verification id', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      const { phoneNumber, email, password } = await createUserWithMultiFactor();

      // GIVEN a MultiFactorResolver
      let resolver = null;
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        return Promise.reject();
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        resolver = firebase.auth().getMultiFactorResolver(e);
      }
      await firebase
        .auth()
        .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);

      // AND I request a verification code
      const verificationCode = await getLastSmsCode(phoneNumber);
      // AND I use an incorrect verificationId
      const credential = firebase.auth.PhoneAuthProvider.credential(
        'wrongVerificationId',
        verificationCode,
      );
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);

      try {
        // WHEN I try to resolve the sign-in
        await resolver.resolveSignIn(multiFactorAssertion);
      } catch (e) {
        // THEN an error message is thrown
        e.message.should.equal(
          '[auth/invalid-verification-id] The verification ID used to create the phone auth credential is invalid.',
        );
        return Promise.resolve();
      }
      return Promise.reject();
    });
    it('throws an error for unknown sessions', async function () {
      const { email, password } = await createUserWithMultiFactor();
      let resolver = null;
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        return Promise.reject();
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        resolver = firebase.auth().getMultiFactorResolver(e);
      }

      try {
        await firebase
          .auth()
          .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], 'unknown-session');
      } catch (e) {
        // THEN an error message is thrown
        e.message.should.equal(
          '[auth/invalid-multi-factor-session] No resolver for session found. Is the session id correct?',
        );
        return Promise.resolve();
      }
      return Promise.reject();
    });
    it('throws an error for unknown verification code', async function () {
      const { email, password } = await createUserWithMultiFactor();

      // GIVEN a MultiFactorResolver
      let resolver = null;
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        return Promise.reject();
      } catch (e) {
        e.message.should.equal(
          '[auth/multi-factor-auth-required] Please complete a second factor challenge to finish signing into this account.',
        );
        resolver = firebase.auth().getMultiFactorResolver(e);
      }
      const verificationId = await firebase
        .auth()
        .verifyPhoneNumberWithMultiFactorInfo(resolver.hints[0], resolver.session);

      // AND I use an incorrect verificationId
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        'wrong-verification-code',
      );
      const multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(credential);

      try {
        // WHEN I try to resolve the sign-in
        await resolver.resolveSignIn(multiFactorAssertion);
      } catch (e) {
        // THEN an error message is thrown
        e.message
          .toLocaleLowerCase()
          .should.containEql(
            '[auth/invalid-verification-code] The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms'.toLocaleLowerCase(),
          );

        return Promise.resolve();
      }
      return Promise.reject();
    });

    it('can not enroll with phone authentication (unsupported primary factor)', async function () {
      if (device.getPlatform() === 'ios') {
        this.skip();
      }

      // GIVEN a user that only signs in with phone
      const testPhone = getRandomPhoneNumber();
      const confirmResult = await firebase.auth().signInWithPhoneNumber(testPhone);
      const lastSmsCode = await getLastSmsCode(testPhone);
      await confirmResult.confirm(lastSmsCode);

      // WHEN they attempt to enroll a second factor
      const multiFactorUser = await firebase.auth().multiFactor(firebase.auth().currentUser);
      const session = await multiFactorUser.getSession();
      try {
        await firebase.auth().verifyPhoneNumberForMultiFactor({ phoneNumber: '+1123123', session });
      } catch (e) {
        e.message.should.equal(
          '[auth/unsupported-first-factor] Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.',
        );
        return Promise.resolve();
      }
      return Promise.reject(
        new Error('Enrolling a second factor when using phone authentication is not supported.'),
      );
    });
    it('can not enroll when phone number is missing + sign', async function () {
      await createVerifiedUser('verified@example.com', 'test123');
      const multiFactorUser = firebase.auth().multiFactor(firebase.auth().currentUser);
      const session = await multiFactorUser.getSession();
      try {
        await firebase.auth().verifyPhoneNumberForMultiFactor({ phoneNumber: '491575', session });
      } catch (e) {
        e.code.should.equal('auth/invalid-phone-number');
        e.message.should.equal(
          '[auth/invalid-phone-number] The format of the phone number provided is incorrect. Please enter the ' +
            'phone number in a format that can be parsed into E.164 format. E.164 ' +
            'phone numbers are written in the format [+][country code][subscriber ' +
            'number including area code].',
        );
        return Promise.resolve();
      }
      return Promise.reject();
    });
  });
});
