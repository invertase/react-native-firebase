import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare type GoogleApiAvailabilityType = {
    status: number;
    isAvailable: boolean;
    isUserResolvableError?: boolean;
    hasResolution?: boolean;
    error?: string;
};
export declare const MODULE_NAME = "RNFirebaseUtils";
export default class RNFirebaseUtils extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    checkPlayServicesAvailability(): void;
    promptForPlayServices(): any;
    resolutionForPlayServices(): any;
    makePlayServicesAvailable(): any;
    /**
     * Set the global logging level for all logs.
     *
     * @param logLevel
     */
    logLevel: string;
    /**
     * Returns props from the android GoogleApiAvailability sdk
     * @android
     * @return {RNFirebase.GoogleApiAvailabilityType|{isAvailable: boolean, status: number}}
     */
    readonly playServicesAvailability: GoogleApiAvailabilityType;
    /**
     * Enable/Disable throwing an error or warning on detecting a play services problem
     * @android
     * @param bool
     */
    errorOnMissingPlayServices: boolean;
    /**
     * Enable/Disable automatic prompting of the play services update dialog
     * @android
     * @param bool
     */
    promptOnMissingPlayServices: boolean;
}
export declare const statics: {};
