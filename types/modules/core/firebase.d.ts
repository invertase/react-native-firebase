import App from './firebase-app';
import AdMob from '../admob';
import Auth from '../auth';
import Analytics from '../analytics';
import Config from '../config';
import Crash from '../crash';
import Database from '../database';
import Firestore from '../firestore';
import Links from '../links';
import Messaging from '../messaging';
import Perf from '../perf';
import Storage from '../storage';
import Utils from '../utils';
import { FirebaseOptions } from '../../types/index';
export declare class Firebase {
    admob: () => AdMob;
    analytics: () => Analytics;
    auth: () => Auth;
    config: () => Config;
    crash: () => Crash;
    database: () => Database;
    firestore: () => Firestore;
    links: () => Links;
    messaging: () => Messaging;
    perf: () => Perf;
    storage: () => Storage;
    utils: () => Utils;
    constructor();
    /**
     * Web SDK initializeApp
     *
     * @param options
     * @param name
     * @return {*}
     */
    initializeApp(options: FirebaseOptions, name: string): App;
    /**
     * Retrieves a Firebase app instance.
     *
     * When called with no arguments, the default app is returned.
     * When an app name is provided, the app corresponding to that name is returned.
     *
     * @param name
     * @return {*}
     */
    app(name?: string): App;
    /**
     * A (read-only) array of all initialized apps.
     * @return {Array}
     */
    readonly apps: App[];
    /**
     * The current SDK version.
     * @return {string}
     */
    readonly SDK_VERSION: string;
}
declare const _default: Firebase;
export default _default;
