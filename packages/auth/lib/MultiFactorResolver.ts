/**
 * Base class to facilitate multi-factor authentication.
 */
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal } from './types/internal';

type ResolverLike = {
  hints: FirebaseAuthTypes.MultiFactorInfo[];
  session: FirebaseAuthTypes.MultiFactorSession;
};

type PhoneMultiFactorAssertion = {
  token?: string;
  secret?: string;
  uid?: string;
  verificationCode?: string;
};

export default class MultiFactorResolver {
  readonly hints: FirebaseAuthTypes.MultiFactorInfo[];
  readonly session: FirebaseAuthTypes.MultiFactorSession;
  private readonly _auth: AuthInternal;

  constructor(auth: AuthInternal, resolver: ResolverLike) {
    this._auth = auth;
    this.hints = resolver.hints;
    this.session = resolver.session;
  }

  resolveSignIn(assertion: PhoneMultiFactorAssertion): Promise<FirebaseAuthTypes.UserCredential> {
    const { token, secret, uid, verificationCode } = assertion;

    if (token && secret) {
      return this._auth.resolveMultiFactorSignIn(
        this.session,
        token,
        secret,
      ) as Promise<FirebaseAuthTypes.UserCredential>;
    }

    if (uid && verificationCode) {
      return this._auth.resolveTotpSignIn(
        this.session,
        uid,
        verificationCode,
      ) as Promise<FirebaseAuthTypes.UserCredential>;
    }

    throw new Error('Invalid multi-factor assertion provided for sign-in resolution.');
  }
}
