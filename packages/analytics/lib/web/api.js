/* eslint-disable no-console */
import {
  getApp,
  getId,
  onIdChange,
  getInstallations,
  makeIDBAvailable,
} from '@react-native-firebase/app/lib/internal/web/firebaseInstallations';
import {
  getItem,
  setItem,
  isMemoryStorage,
} from '@react-native-firebase/app/lib/internal/asyncStorage';

import { isNumber } from '@react-native-firebase/app/lib/common';

/**
 * Generates a Google Analytics client ID.
 * @returns {string} The generated client ID.
 */
function generateGAClientId() {
  const randomNumber = Math.round(Math.random() * 2147483647);
  // TODO: Don't seem to need this for now.
  // var hash = 1;
  // if (seed) {
  //   for (var i = seed.length - 1; i >= 0; i--) {
  //     var char = seed.charCodeAt(i);
  //     hash = ((hash << 6) & 268435455) + char + (char << 14);
  //     var flag = hash & 266338304;
  //     hash = flag !== 0 ? hash ^ (flag >> 21) : hash;
  //   }
  // }
  // const randomPart = seed ? String(randomNumber ^ (hash & 2147483647)) : String(randomNumber);
  const randomPart = String(randomNumber);
  const timestamp = Math.round(Date.now() / 1000);
  return randomPart + '.' + timestamp;
}

class AnalyticsApi {
  constructor(appName, measurementId) {
    this.appName = appName;
    this.measurementId = measurementId;
    this.eventQueue = [];
    this.queueTimer = null;
    this.queueInterval = 250;
    this.defaultEventParameters = {};
    this.userId = null;
    this.userProperties = {};
    this.consent = {};
    this.analyticsCollectionEnabled = true;
    this.started = false;
    this.installationId = null;
    this.debug = false;
    this.currentScreen = null;

    this._getInstallationId().catch(error => {
      if (globalThis.RNFBDebug) {
        console.debug('[RNFB->Analytics][🔴] Error getting Firebase Installation Id:', error);
      } else {
        // No-op. This is a non-critical error.
      }
    });
  }

  setDefaultEventParameters(params) {
    if (params === null || params === undefined) {
      this.defaultEventParameters = {};
    } else {
      for (const [key, value] of Object.entries(params)) {
        this.defaultEventParameters[key] = value;
        if (value === null) {
          delete this.defaultEventParameters[key];
        }
      }
    }
  }

  setDebug(enabled) {
    this.debug = enabled;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setCurrentScreen(screenName) {
    this.currentScreen = screenName;
  }

  setUserProperty(key, value) {
    this.userProperties[key] = value;
    if (value === null) {
      delete this.userProperties[key];
    }
  }

  setUserProperties(properties) {
    for (const [key, value] of Object.entries(properties)) {
      this.setUserProperty(key, value);
    }
  }

  setConsent(consentSettings) {
    this.consent = { ...this.consent, ...consentSettings };
  }

  setAnalyticsCollectionEnabled(enabled) {
    this.analyticsCollectionEnabled = enabled;
    if (!enabled) {
      this._stopQueueProcessing();
    } else {
      this._startQueueProcessing();
    }
  }

  logEvent(eventName, eventParams = {}) {
    if (!this.analyticsCollectionEnabled) return;
    this.eventQueue.push({
      name: eventName,
      params: { ...this.defaultEventParameters, ...eventParams },
    });
    this._startQueueProcessing();
  }

  async _getInstallationId() {
    navigator.onLine = true;
    makeIDBAvailable();
    const app = getApp(this.appName);
    const installations = getInstallations(app);
    const id = await getId(installations);
    if (globalThis.RNFBDebug) {
      console.debug('[RNFB->Analytics][📊] Firebase Installation Id:', id);
    }
    this.installationId = id;
    onIdChange(installations, newId => {
      this.installationId = newId;
    });
  }

  _startQueueProcessing() {
    if (this.started) return;
    this.sessionId = Math.floor(Date.now() / 1000);
    this.started = true;
    this.queueTimer = setInterval(
      () => this._processQueue().catch(console.error),
      this.queueInterval,
    );
  }

  _stopQueueProcessing() {
    if (!this.started) return;
    this.started = false;
    clearInterval(this.queueTimer);
  }

  async _processQueue() {
    if (this.eventQueue.length === 0) return;
    const events = this.eventQueue.splice(0, 5);
    await this._sendEvents(events);
    if (this.eventQueue.length === 0) {
      this._stopQueueProcessing();
    }
  }

  async _getCid() {
    this.cid = await getItem('analytics:cid');
    if (this.cid) {
      return this.cid;
    }
    this.cid = generateGAClientId();
    await setItem('analytics:cid', this.cid);
    if (isMemoryStorage()) {
      console.warn(
        'Firebase Analytics is using in memory persistence. This means that the analytics\n' +
          'client ID is reset every time your app is restarted which may result in\n' +
          'inaccurate data being shown on the Firebase Analytics dashboard.\n' +
          '\n' +
          'To enable persistence, provide an Async Storage implementation.\n' +
          '\n' +
          'For example, to use React Native Async Storage:\n' +
          '\n' +
          "  import AsyncStorage from '@react-native-async-storage/async-storage';\n" +
          '\n' +
          '  // Before initializing Firebase set the Async Storage implementation\n' +
          '  // that will be used to persist user sessions.\n' +
          '  firebase.setReactNativeAsyncStorage(AsyncStorage);\n' +
          '\n' +
          '  // Then initialize Firebase as normal.\n' +
          '  await firebase.initializeApp({ ... });\n',
      );
    }
    return this.cid;
  }

  async _sendEvents(events) {
    const cid = this.cid || (await this._getCid());
    for (const event of events) {
      const queryParams = new URLSearchParams({
        v: '2',
        tid: this.measurementId,
        en: event.name,
        cid,
        pscdl: 'noapi',
        sid: this.sessionId,
        'ep.origin': 'firebase',
        _z: 'fetch',
        _p: '' + Date.now(),
        _s: 1,
        _ee: 1,
        dma: 0,
        tfd: Math.round(performance.now()),
        are: 1,
        sct: 2,
        seg: 1,
        frm: 0,
      });

      if (this.debug) {
        queryParams.append('_dbg', '1');
        queryParams.append('ep.debug_mode', '1');
      }

      if (this.consent && !this.consent.ad_personalization) {
        queryParams.append('npa', '1');
      } else {
        queryParams.append('npa', '0');
      }

      if (this.userId) {
        queryParams.append('uid', this.userId);
      }

      if (this.installationId) {
        queryParams.append('_fid', this.installationId);
      }

      if (this.userProperties && Object.keys(this.userProperties).length > 0) {
        for (const [key, value] of Object.entries(this.userProperties)) {
          queryParams.append(`up.${key}`, `${value}`);
        }
      }

      if (this.currentScreen) {
        queryParams.append('ep.screen_name', this.currentScreen);
        queryParams.append('ep.firebase_screen', this.currentScreen);
      }

      if (event.params && Object.keys(event.params).length > 0) {
        // TODO we need to handle 'items' arrays and also key name conversions based on the following map;
        // const keyConvert = {
        //   item_id: 'id',
        //   item_name: 'nm',
        //   item_brand: 'br',
        //   item_category: 'ca',
        //   item_category2: 'c2',
        //   item_category3: 'c3',
        //   item_category4: 'c4',
        //   item_category5: 'c5',
        //   item_variant: 'va',
        //   price: 'pr',
        //   quantity: 'qt',
        //   coupon: 'cp',
        //   item_list_name: 'ln',
        //   index: 'lp',
        //   item_list_id: 'li',
        //   discount: 'ds',
        //   affiliation: 'af',
        //   promotion_id: 'pi',
        //   promotion_name: 'pn',
        //   creative_name: 'cn',
        //   creative_slot: 'cs',
        //   location_id: 'lo',
        //   id: 'id',
        //   name: 'nm',
        //   brand: 'br',
        //   variant: 'va',
        //   list_name: 'ln',
        //   list_position: 'lp',
        //   list: 'ln',
        //   position: 'lp',
        //   creative: 'cn',
        // };
        // items array should for example become:
        //   pr1 for items[0]
        //   pr2 for items[1]
        //   ... etc
        // with the format for each looking something like:
        //   iditem_id~nmitem_name~britem_brand~caitem_category~c2item_category2~c3item_category3~c4item_category4~c5item_category5~vaitem_variant~prprice~qtquantity~cpcoupon~lnitem_list_name~lpindex~liitem_list_id~dsdiscount~afaffiliation~pipromotion_id~pnpromotion_name~cncreative_name~cscreative_slot~lolocation_id
        for (const [key, value] of Object.entries(event.params)) {
          if (isNumber(value)) {
            queryParams.append(`epn.${key}`, `${value}`);
          } else {
            queryParams.append(`ep.${key}`, `${value}`);
          }
        }
      }

      try {
        const url = `https://www.google-analytics.com/g/collect?${queryParams.toString()}`;
        if (globalThis.RNFBDebug) {
          console.debug(`[RNFB-->Fetch][📊] Sending analytics call: ${url}`);
        }
        const response = await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'Content-Type': 'text/plain;charset=UTF-8',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-length': '0',
            origin: 'firebase',
            pragma: 'no-cache',
            'sec-fetch-dest': 'empty',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'react-native-firebase',
          },
        });
        if (globalThis.RNFBDebug) {
          console.debug(`[RNFB<--Fetch][📊] Response: ${response.status}`);
        }
      } catch (error) {
        if (globalThis.RNFBDebug) {
          console.debug('[RNFB<--Fetch][🔴] Error sending Analytics event:', error);
        }
      }
    }
  }
}

export { AnalyticsApi };
