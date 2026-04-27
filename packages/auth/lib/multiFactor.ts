import { reload } from './modular';
import type {
  MultiFactorAssertion as ModularMultiFactorAssertion,
  User,
} from './types/auth';
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal, MultiFactorEnrollmentAssertionInternal } from './types/internal';

type MultiFactorAuthHost = {
  currentUser: FirebaseAuthTypes.User | null;
  native: AuthInternal['native'];
};
/**
 * Return a MultiFactorUser instance the gateway to multi-factor operations.
 */
export function multiFactor(auth: MultiFactorAuthHost): FirebaseAuthTypes.MultiFactorUser {
  return new MultiFactorUser(auth);
}

export class MultiFactorUser {
  readonly enrolledFactors: FirebaseAuthTypes.MultiFactorInfo[];
  private readonly _auth: MultiFactorAuthHost;

  constructor(auth: MultiFactorAuthHost, user?: FirebaseAuthTypes.User) {
    this._auth = auth;
    if (user === undefined) {
      user = auth.currentUser as FirebaseAuthTypes.User;
    }

    if (!user) {
      throw new Error('A user is required to access multi-factor operations.');
    }

    this.enrolledFactors = user.multiFactor?.enrolledFactors ?? [];
  }

  getSession(): Promise<FirebaseAuthTypes.MultiFactorSession> {
    return this._auth.native.getSession();
  }

  /**
   * Finalize the enrollment process for the given multi-factor assertion.
   * Optionally set a displayName. This method will reload the current user
   * profile, which is necessary to see the multi-factor changes.
   */
  async enroll(
    multiFactorAssertion: FirebaseAuthTypes.MultiFactorAssertion | ModularMultiFactorAssertion,
    displayName?: string | null,
  ): Promise<void> {
    const assertion = multiFactorAssertion as MultiFactorEnrollmentAssertionInternal;

    if (assertion.factorId === 'phone') {
      await this._auth.native.finalizeMultiFactorEnrollment(
        assertion.token,
        assertion.secret,
        displayName ?? undefined,
      );
    } else if (assertion.factorId === 'totp') {
      await this._auth.native.finalizeTotpEnrollment(
        assertion.totpSecret,
        assertion.verificationCode,
        displayName ?? undefined,
      );
    } else {
      // Runtime guard for callers that bypass the typed MFA assertion helpers.
      throw new Error('Invalid multi-factor assertion provided for enrollment.');
    }

    // We need to reload the user otherwise the changes are not visible
    // TODO reload not working on Other platform
    await reload(this._auth.currentUser as unknown as User);
  }

  async unenroll(enrollmentId: FirebaseAuthTypes.MultiFactorInfo | string): Promise<void> {
    await this._auth.native.unenrollMultiFactor(
      enrollmentId as string | FirebaseAuthTypes.MultiFactorInfo,
    );

    if (this._auth.currentUser) {
      await reload(this._auth.currentUser as unknown as User);
    }
  }
}
