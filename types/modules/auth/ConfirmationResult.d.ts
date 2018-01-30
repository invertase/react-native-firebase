import Auth from './';
import User from './User';
export default class ConfirmationResult {
    _auth: Auth;
    _verificationId: string;
    /**
     *
     * @param auth
     * @param verificationId The phone number authentication operation's verification ID.
     */
    constructor(auth: Auth, verificationId: string);
    /**
     *
     * @param verificationCode
     * @return {*}
     */
    confirm(verificationCode: string): Promise<User>;
    readonly verificationId: string | null;
}
