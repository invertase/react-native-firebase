/**
 * Base class to facilitate multi-factor authentication.
 */
export default class MultiFactorResolver {
  constructor(auth, resolver) {
    this._auth = auth;
    this.hints = resolver.hints;
    this.session = resolver.session;
  }

  resolveSignIn(assertion) {
    const { token, secret, uid, verificationCode } = assertion;

    if (token && secret) {
      return this._auth.resolveMultiFactorSignIn(this.session, token, secret);
    }

    return this._auth.resolveTotpSignIn(this.session, uid, verificationCode);
  }
}
