import { reload } from './modular';
/**
 * Return a MultiFactorUser instance the gateway to multi-factor operations.
 */
export function multiFactor(auth) {
  return new MultiFactorUser(auth);
}

export class MultiFactorUser {
  constructor(auth, user) {
    this._auth = auth;
    if (user === undefined) {
      user = auth.currentUser;
    }
    this._user = user;
    this.enrolledFactors = user.multiFactor.enrolledFactors;
  }

  getSession() {
    return this._auth.native.getSession();
  }

  /**
   * Finalize the enrollment process for the given multi-factor assertion.
   * Optionally set a displayName. This method will reload the current user
   * profile, which is necessary to see the multi-factor changes.
   */
  async enroll(multiFactorAssertion, displayName) {
    const { token, secret, totpSecret, verificationCode } = multiFactorAssertion;
    if (token && secret) {
      await this._auth.native.finalizeMultiFactorEnrollment(token, secret, displayName);
    } else if (totpSecret && verificationCode) {
      await this._auth.native.finalizeTotpEnrollment(totpSecret, verificationCode, displayName);
    } else {
      throw new Error('Invalid multi-factor assertion provided for enrollment.');
    }

    // We need to reload the user otherwise the changes are not visible
    // TODO reload not working on Other platform
    return reload(this._auth.currentUser);
  }

  async unenroll(enrollmentId) {
    await this._auth.native.unenrollMultiFactor(enrollmentId);

    if (this._auth.currentUser) {
      return reload(this._auth.currentUser);
    }
  }
}
