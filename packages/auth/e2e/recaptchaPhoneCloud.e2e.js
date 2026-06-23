/*
 * Tier 2 — Auth reCAPTCHA Enterprise on cloud Auth (secondaryFromNative).
 *
 * Requires full dual setup (okf-bundle/recaptcha-enterprise-test-setup.md):
 * - recaptchaSiteKey in native config (Tier 1 prerequisite)
 * - Identity Platform phoneEnforcementState AUDIT + recaptchaKeys
 * - Fictional test number registered in Firebase Console (constants below)
 *
 * Does NOT use emulator helpers or appVerificationDisabledForTesting.
 */

const { getRecaptchaSiteKey } = require('../../app/e2e/helpers');

/** Register at Authentication → Phone → Phone numbers for testing. */
const RECAPTCHA_ENTERPRISE_TEST_PHONE = '+16505554343';
/** Fixed verification code paired with RECAPTCHA_ENTERPRISE_TEST_PHONE in Console. */
const RECAPTCHA_ENTERPRISE_TEST_CODE = '654321';

describe('recaptchaPhoneCloud', function () {
  if (Platform.other) {
    return;
  }

  before(function () {
    if (!getRecaptchaSiteKey()) {
      this.skip();
    }
  });

  beforeEach(async function () {
    const { getApp } = modular;
    const { getAuth, signOut } = authModular;
    const secondaryAuth = getAuth(getApp('secondaryFromNative'));

    if (secondaryAuth.currentUser) {
      await signOut(secondaryAuth);
      await Utils.sleep(50);
    }
  });

  it('initializeRecaptchaConfig + fictional phone sign-in on secondaryFromNative', async function () {
    const { getApp } = modular;
    const { getAuth, initializeRecaptchaConfig, signInWithPhoneNumber, signOut } = authModular;

    const secondaryAuth = getAuth(getApp('secondaryFromNative'));
    secondaryAuth.app.name.should.equal('secondaryFromNative');

    await initializeRecaptchaConfig(secondaryAuth);

    const confirmResult = await signInWithPhoneNumber(
      secondaryAuth,
      RECAPTCHA_ENTERPRISE_TEST_PHONE,
    );
    confirmResult.verificationId.should.be.a.String();
    confirmResult.confirm.should.be.a.Function();

    const userCredential = await confirmResult.confirm(RECAPTCHA_ENTERPRISE_TEST_CODE);
    userCredential.user.phoneNumber.should.equal(RECAPTCHA_ENTERPRISE_TEST_PHONE);

    await signOut(secondaryAuth);
  });
});
