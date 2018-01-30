import ModuleBase from '../../utils/ModuleBase';
import App from '../core/firebase-app';
export declare const MODULE_NAME = "RNFirebaseLinks";
export interface ValidParams {
    dynamicLinkDomain?: string;
    link?: string;
    androidInfo?: {
        androidPackageName: string;
        androidFallbackLink: string;
        androidMinPackageVersionCode: string;
        androidLink: string;
    };
    iosInfo?: {
        iosBundleId: string;
        iosFallbackLink: string;
        iosCustomScheme: string;
        iosIpadFallbackLink: string;
        iosIpadBundleId: string;
        iosAppStoreId: string;
    };
    socialMetaTagInfo?: {
        socialTitle: string;
        socialDescription: string;
        socialImageLink: string;
    };
    suffix?: {
        option: string;
    };
}
/**
 * @class Links
 */
export default class Links extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    readonly EVENT_TYPE: {
        Link: string;
    };
    /**
     * Returns the link that triggered application open
     * @returns {Promise.<String>}
     */
    getInitialLink(): Promise<string>;
    /**
     * Subscribe to dynamic links
     * @param listener
     * @returns {Function}
     */
    onLink(listener: Function): () => any;
    /**
     * Create long Dynamic Link from parameters
     * @param parameters
     * @returns {Promise.<String>}
     */
    createDynamicLink(parameters?: ValidParams): Promise<string>;
    /**
     * Create short Dynamic Link from parameters
     * @param parameters
     * @returns {Promise.<String>}
     */
    createShortDynamicLink(parameters?: ValidParams): Promise<String>;
}
export declare const statics: {
    EVENT_TYPE: {
        Link: string;
    };
};
