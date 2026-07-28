/**
 * Base class to facilitate multi-factor authentication.
 */
import type { MultiFactorInfo, MultiFactorSession, UserCredential } from './types/auth';
import type { AuthInternal } from './types/internal';

type ResolverLike = {
  hints: MultiFactorInfo[];
  session: MultiFactorSession;
};

type PhoneMultiFactorAssertion = {
  token?: string;
  secret?: string;
  uid?: string;
  verificationCode?: string;
};

export default class MultiFactorResolver {
  readonly hints: MultiFactorInfo[];
  readonly session: MultiFactorSession;
  private readonly _auth: AuthInternal;

  constructor(auth: AuthInternal, resolver: ResolverLike) {
    this._auth = auth;
    this.hints = resolver.hints;
    this.session = resolver.session;
  }

  resolveSignIn(assertion: PhoneMultiFactorAssertion): Promise<UserCredential> {
    const { token, secret, uid, verificationCode } = assertion;

    if (token && secret) {
      return this._auth.resolveMultiFactorSignIn(
        this.session,
        token,
        secret,
      ) as Promise<UserCredential>;
    }

    if (uid && verificationCode) {
      return this._auth.resolveTotpSignIn(
        this.session,
        uid,
        verificationCode,
      ) as Promise<UserCredential>;
    }

    throw new Error('Invalid multi-factor assertion provided for sign-in resolution.');
  }
}
