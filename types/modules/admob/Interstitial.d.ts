import AdRequest from './AdRequest';
export default class Interstitial {
    admob?: object;
    loaded?: boolean;
    adUnit: string;
    constructor(admob: object, adUnit: string);
    /**
     * Handle a JS emit event
     * @param event
     * @private
     */
    _onInterstitialEvent: (event: any) => void;
    /**
     * Load an ad with an instance of AdRequest
     * @param request
     * @returns {*}
     */
    loadAd(request?: AdRequest): any;
    /**
     * Return a local instance of isLoaded
     * @returns {boolean}
     */
    isLoaded(): boolean;
    /**
     * Show the advert - will only show if loaded
     * @returns {*}
     */
    show(): void;
    /**
     * Listen to an Ad event
     * @param eventType
     * @param listenerCb
     * @returns {null}
     */
    on(eventType: any, listenerCb: any): any;
}
