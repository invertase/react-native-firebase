/**
 * Return a MultiFactorUser instance the gateway to multi-factor operations.
 */
export function multiFactor(auth) {
  // eslint-disable-next-line no-console
  console.warn('This method is deprecated. Please use auth().multiFactor(user) instead');
  return new MultiFactorUser(auth);
}

export class MultiFactorUser {
  constructor(auth, user) {
    this._auth = auth;
    if (user === undefined) {
      user = auth.currentUser;
    }
    this._user = user;
    this.enrolledFactor = user.multiFactor.enrolledFactors;
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
    const { token, secret } = multiFactorAssertion;
    await this._auth.native.finalizeMultiFactorEnrollment(token, secret, displayName);

    // We need to reload the user otherwise the changes are not visible
    return this._auth.currentUser.reload();
  }

  unenroll() {
    return Promise.reject(new Error('No implemented yet.'));
  }
}
