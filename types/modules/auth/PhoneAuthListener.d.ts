import Auth from './';
export declare enum AuthState {
    'sent' = 0,
    'timeout' = 1,
    'verified' = 2,
    'error' = 3,
}
export interface PhoneAuthSnapshot {
    state: keyof typeof AuthState;
    verificationId: string;
    code: string | null;
    error: Error | null;
}
export declare type PhoneAuthError = {
    code: string | null;
    verificationId: string;
    message: string | null;
    stack: string | null;
};
export default class PhoneAuthListener {
    private _auth;
    private _timeout;
    private _publicEvents;
    private _internalEvents;
    protected _reject: (result: any) => void | null;
    protected _resolve: (result: any) => void | null;
    private _promise;
    private _phoneAuthRequestKey;
    /**
     *
     * @param auth
     * @param phoneNumber
     * @param timeout
     */
    constructor(auth: Auth, phoneNumber: string, timeout?: number);
    /**
     * Subscribes to all EE events on this._internalEvents
     * @private
     */
    private _subscribeToEvents();
    /**
     * Subscribe a users listener cb to the snapshot events.
     * @param observer
     * @private
     */
    private _addUserObserver(observer);
    /**
     * Create a new internal deferred promise, if not already created
     * @private
     */
    private _promiseDeferred();
    on(event: string, observer: () => PhoneAuthSnapshot, errorCb?: () => PhoneAuthError, successCb?: () => PhoneAuthSnapshot): this;
    /**
     * Promise .then proxy
     * @param fn
     */
    then(fn: () => PhoneAuthSnapshot): any;
    /**
     * Promise .catch proxy
     * @param fn
     */
    catch(fn: () => Error): any;
}
