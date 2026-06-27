import type { MultiFactorAssertion as ModularMultiFactorAssertion, User } from './types/auth';
import type {
  MultiFactorInfo,
  MultiFactorSession,
  MultiFactorUser as MultiFactorUserType,
  MultiFactorAssertion,
} from './types/auth';
import type {
  AuthInternal,
  MultiFactorEnrollmentAssertionInternal,
  UserInternal,
} from './types/internal';

type MultiFactorAuthHost = {
  currentUser: User | null;
  native: AuthInternal['native'];
};
/**
 * Return a MultiFactorUser instance the gateway to multi-factor operations.
 */
export function multiFactor(auth: MultiFactorAuthHost): MultiFactorUserType {
  return new MultiFactorUser(auth);
}

export class MultiFactorUser {
  readonly enrolledFactors: MultiFactorInfo[];
  private readonly _auth: MultiFactorAuthHost;

  constructor(auth: MultiFactorAuthHost, user?: User) {
    this._auth = auth;
    if (user === undefined) {
      user = auth.currentUser as User;
    }

    if (!user) {
      throw new Error('A user is required to access multi-factor operations.');
    }

    this.enrolledFactors = user.multiFactor?.enrolledFactors ?? [];
  }

  getSession(): Promise<MultiFactorSession> {
    return this._auth.native.getSession();
  }

  /**
   * Finalize the enrollment process for the given multi-factor assertion.
   * Optionally set a displayName. This method will reload the current user
   * profile, which is necessary to see the multi-factor changes.
   */
  async enroll(
    multiFactorAssertion: MultiFactorAssertion | ModularMultiFactorAssertion,
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
    const currentUser = this._auth.currentUser as UserInternal | null;
    if (currentUser) {
      await currentUser.reload();
    }
  }

  async unenroll(enrollmentId: MultiFactorInfo | string): Promise<void> {
    await this._auth.native.unenrollMultiFactor(enrollmentId as string | MultiFactorInfo);

    if (this._auth.currentUser) {
      await (this._auth.currentUser as UserInternal).reload();
    }
  }
}
