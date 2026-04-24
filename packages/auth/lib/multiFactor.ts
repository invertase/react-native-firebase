import { reload } from './modular';
import type {
  MultiFactorAssertion as ModularMultiFactorAssertion,
  User as ModularUser,
} from './types/auth';
import type { FirebaseAuthTypes } from './types/namespaced';
import type { AuthInternal } from './types/internal';

type EnrollmentAssertion = {
  token?: string;
  secret?: string;
  totpSecret?: string;
  verificationCode?: string;
};

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
    const assertion = multiFactorAssertion as EnrollmentAssertion;
    const { token, secret, totpSecret, verificationCode } = assertion;
    if (token && secret) {
      await this._auth.native.finalizeMultiFactorEnrollment(
        token,
        secret,
        displayName ?? undefined,
      );
    } else if (totpSecret && verificationCode) {
      await this._auth.native.finalizeTotpEnrollment(
        totpSecret,
        verificationCode,
        displayName ?? undefined,
      );
    } else {
      throw new Error('Invalid multi-factor assertion provided for enrollment.');
    }

    // We need to reload the user otherwise the changes are not visible
    // TODO reload not working on Other platform
    await reload(this._auth.currentUser as unknown as ModularUser);
  }

  async unenroll(enrollmentId: FirebaseAuthTypes.MultiFactorInfo | string): Promise<void> {
    await this._auth.native.unenrollMultiFactor(
      enrollmentId as string | FirebaseAuthTypes.MultiFactorInfo,
    );

    if (this._auth.currentUser) {
      await reload(this._auth.currentUser as unknown as ModularUser);
    }
  }
}
