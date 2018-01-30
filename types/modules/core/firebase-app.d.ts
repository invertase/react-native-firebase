import AdMob from '../admob';
import Auth from '../auth';
import Analytics from '../analytics';
import Config from '../config';
import Crash from '../crash';
import Crashlytics from '../fabric/crashlytics';
import Database from '../database';
import Firestore from '../firestore';
import Links from '../links';
import Messaging from '../messaging';
import Performance from '../perf';
import Storage from '../storage';
import Utils from '../utils';
import { FirebaseOptions } from '../../types';
export default class App {
    _extendedProps: {
        [key: string]: boolean;
    };
    _initialized: boolean;
    _name: string;
    _nativeInitialized: boolean;
    _options: FirebaseOptions;
    admob: () => AdMob;
    analytics: () => Analytics;
    auth: () => Auth;
    config: () => Config;
    crash: () => Crash;
    database: () => Database;
    fabric: {
        crashlytics: () => Crashlytics;
    };
    firestore: () => Firestore;
    links: () => Links;
    messaging: () => Messaging;
    perf: () => Performance;
    storage: () => Storage;
    utils: () => Utils;
    constructor(name: string, options: FirebaseOptions, fromNative?: boolean);
    /**
     *
     * @return {*}
     */
    readonly name: string;
    /**
     *
     * @return {*}
     */
    readonly options: FirebaseOptions;
    /**
     * Undocumented firebase web sdk method that allows adding additional properties onto
     * a firebase app instance.
     *
     * See: https://github.com/firebase/firebase-js-sdk/blob/master/tests/app/firebase_app.test.ts#L328
     *
     * @param props
     */
    extendApp(props: any): void;
    /**
     *
     * @return {Promise}
     */
    delete(): Promise<never>;
    /**
     *
     * @return {*}
     */
    onReady(): Promise<App>;
}
