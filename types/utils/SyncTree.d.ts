import DatabaseReference from '../modules/database/reference';
export declare type Listener = (DatabaseSnapshot) => any;
export declare type Registration = {
    key: string;
    path: string;
    once?: boolean;
    appName: string;
    eventType: string;
    listener: Listener;
    eventRegistrationKey: string;
    ref: DatabaseReference;
};
/**
 * Internally used to manage firebase database realtime event
 * subscriptions and keep the listeners in sync in js vs native.
 */
export declare class SyncTree {
    private _nativeEmitter;
    private _reverseLookup;
    private _tree;
    constructor();
    /**
     *
     * @param event
     * @private
     */
    private _handleSyncEvent(event);
    /**
     * Routes native database 'on' events to their js equivalent counterpart.
     * If there is no longer any listeners remaining for this event we internally
     * call the native unsub method to prevent further events coming through.
     *
     * @param event
     * @private
     */
    private _handleValueEvent(event);
    /**
     * Routes native database query listener cancellation events to their js counterparts.
     *
     * @param event
     * @private
     */
    private _handleErrorEvent(event);
    /**
     * Returns registration information such as appName, ref, path and registration keys.
     *
     * @param registration
     * @return {null}
     */
    getRegistration(registration: string): Registration | null;
    /**
     * Removes all listeners for the specified registration keys.
     *
     * @param registrations
     * @return {number}
     */
    removeListenersForRegistrations(registrations: string | string[]): number;
    /**
     * Removes a specific listener from the specified registrations.
     *
     * @param listener
     * @param registrations
     * @return {Array} array of registrations removed
     */
    removeListenerRegistrations(listener: () => any, registrations: string[]): any[];
    /**
     * Returns an array of all registration keys for the specified path.
     *
     * @param path
     * @return {Array}
     */
    getRegistrationsByPath(path: string): string[];
    /**
     * Returns an array of all registration keys for the specified path and eventType.
     *
     * @param path
     * @param eventType
     * @return {Array}
     */
    getRegistrationsByPathEvent(path: string, eventType: string): string[];
    /**
     * Returns a single registration key for the specified path, eventType, and listener
     *
     * @param path
     * @param eventType
     * @param listener
     * @return {Array}
     */
    getOneByPathEventListener(path: string, eventType: string, listener: Function): string | null;
    /**
     * Register a new listener.
     *
     * @param parameters
     * @param listener
     * @return {String}
     */
    addRegistration(registration: Registration): string;
    /**
     * Remove a registration, if it's not a `once` registration then instructs native
     * to also remove the underlying database query listener.
     *
     * @param registration
     * @return {boolean}
     */
    removeRegistration(registration: string): boolean;
    /**
     * Wraps a `once` listener with a new function that self de-registers.
     *
     * @param registration
     * @param listener
     * @return {function(...[*])}
     * @private
     */
    private _onOnceRemoveRegistration(registration, listener);
}
declare const _default: SyncTree;
export default _default;
