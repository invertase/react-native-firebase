/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  isAlphaNumericUnderscore,
  isNull,
  isNumber,
  isObject,
  isOneOf,
  isString,
  isUndefined,
} from '@react-native-firebase/app/lib/common';
import { validateStruct, validateCompound } from '@react-native-firebase/app/lib/common/struct';

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import { isBoolean } from '../../app/lib/common';

import version from './version';
import * as structs from './structs';

const ReservedEventNames = [
  'app_clear_data',
  'app_uninstall',
  'app_update',
  'error',
  'first_open',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'user_engagement',
];

const statics = {};

const namespace = 'analytics';

const nativeModuleName = 'RNFBAnalyticsModule';

class FirebaseAnalyticsModule extends FirebaseModule {
  logEvent(name, params = {}) {
    if (!isString(name)) {
      throw new Error("firebase.analytics().logEvent(*) 'name' expected a string value.");
    }

    if (!isUndefined(params) && !isObject(params)) {
      throw new Error("firebase.analytics().logEvent(_, *) 'params' expected an object value.");
    }

    // check name is not a reserved event name
    if (isOneOf(name, ReservedEventNames)) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' the event name '${name}' is reserved and can not be used.`,
      );
    }

    // name format validation
    if (!isAlphaNumericUnderscore(name)) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' invalid event name '${name}'. Names should contain 1 to 32 alphanumeric characters or underscores.`,
      );
    }

    // maximum number of allowed params check
    if (params && Object.keys(params).length > 25) {
      throw new Error(
        "firebase.analytics().logEvent(_, *) 'params' maximum number of parameters exceeded (25).",
      );
    }

    const entries = Object.entries(params);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isString(value) && !isNumber(value) && !isBoolean(value)) {
        throw new Error(
          `firebase.analytics().logEvent(_, *) 'params' value for parameter '${key}' is invalid, expected a string or number value.`,
        );
      }
    }

    return this.native.logEvent(name, params);
  }

  setAnalyticsCollectionEnabled(enabled) {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    return this.native.setAnalyticsCollectionEnabled(enabled);
  }

  setCurrentScreen(screenName, screenClassOverride) {
    if (!isString(screenName)) {
      throw new Error(
        "firebase.analytics().setCurrentScreen(*) 'screenName' expected a string value.",
      );
    }

    if (!isUndefined(screenClassOverride) && !isString(screenClassOverride)) {
      throw new Error(
        "firebase.analytics().setCurrentScreen(_, *) 'screenClassOverride' expected a string value.",
      );
    }

    return this.native.setCurrentScreen(screenName, screenClassOverride);
  }

  setMinimumSessionDuration(milliseconds = 10000) {
    if (!isNumber(milliseconds)) {
      throw new Error(
        "firebase.analytics().setMinimumSessionDuration(*) 'milliseconds' expected a number value.",
      );
    }

    if (milliseconds < 0) {
      throw new Error(
        "firebase.analytics().setMinimumSessionDuration(*) 'milliseconds' expected a positive number value.",
      );
    }

    return this.native.setMinimumSessionDuration(milliseconds);
  }

  setSessionTimeoutDuration(milliseconds = 1800000) {
    if (!isNumber(milliseconds)) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a number value.",
      );
    }

    if (milliseconds < 0) {
      throw new Error(
        "firebase.analytics().setSessionTimeoutDuration(*) 'milliseconds' expected a positive number value.",
      );
    }

    return this.native.setSessionTimeoutDuration(milliseconds);
  }

  setUserId(id) {
    if (!isNull(id) && !isString(id)) {
      throw new Error("firebase.analytics().setUserId(*) 'id' expected a string value.");
    }

    return this.native.setUserId(id);
  }

  setUserProperty(name, value) {
    if (!isString(name)) {
      throw new Error("firebase.analytics().setUserProperty(*) 'name' expected a string value.");
    }

    if (value !== null && !isString(value)) {
      throw new Error(
        "firebase.analytics().setUserProperty(_, *) 'value' expected a string value.",
      );
    }

    return this.native.setUserProperty(name, value);
  }

  setUserProperties(properties) {
    if (!isObject(properties)) {
      throw new Error(
        "firebase.analytics().setUserProperties(*) 'properties' expected an object of key/value pairs.",
      );
    }

    const entries = Object.entries(properties);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      if (!isNull(value) && !isString(value)) {
        throw new Error(
          `firebase.analytics().setUserProperties(*) 'properties' value for parameter '${key}' is invalid, expected a string.`,
        );
      }
    }

    return this.native.setUserProperties(properties);
  }

  resetAnalyticsData() {
    return this.native.resetAnalyticsData();
  }

  /** -------------------
   *        EVENTS
   * -------------------- */
  logAddPaymentInfo() {
    return this.logEvent('add_payment_info');
  }

  logAddToCart(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddToCart(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddToCart(*):');

    return this.logEvent(
      'add_payment_info',
      validateStruct(object, structs.AddToCart, 'firebase.analytics().logAddToCart(*):'),
    );
  }

  logAddToWishlist(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddToWishlist(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddToWishlist(*):');

    return this.logEvent(
      'add_to_wishlist',
      validateStruct(object, structs.AddToWishlist, 'firebase.analytics().logAddToWishlist(*):'),
    );
  }

  logAppOpen() {
    return this.logEvent('app_open');
  }

  logBeginCheckout(object = {}) {
    validateCompound(object, 'value', 'currency', 'firebase.analytics().logBeginCheckout(*):');

    return this.logEvent(
      'begin_checkout',
      validateStruct(object, structs.BeginCheckout, 'firebase.analytics().logBeginCheckout(*):'),
    );
  }

  logCampaignDetails(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logCampaignDetails(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'campaign_details',
      validateStruct(
        object,
        structs.CampaignDetails,
        'firebase.analytics().logCampaignDetails(*):',
      ),
    );
  }

  logEarnVirtualCurrency(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logEarnVirtualCurrency(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'earn_virtual_currency',
      validateStruct(
        object,
        structs.EarnVirtualCurrency,
        'firebase.analytics().logEarnVirtualCurrency(*):',
      ),
    );
  }

  logEcommercePurchase(object = {}) {
    validateCompound(object, 'value', 'currency', 'firebase.analytics().logEcommercePurchase(*):');

    return this.logEvent(
      'ecommerce_purchase',
      validateStruct(
        object,
        structs.EcommercePurchase,
        'firebase.analytics().logEcommercePurchase(*):',
      ),
    );
  }

  logGenerateLead(object = {}) {
    validateCompound(object, 'value', 'currency', 'firebase.analytics().logGenerateLead(*):');

    return this.logEvent(
      'generate_lead',
      validateStruct(object, structs.GenerateLead, 'firebase.analytics().logGenerateLead(*):'),
    );
  }

  logJoinGroup(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logJoinGroup(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'join_group',
      validateStruct(object, structs.JoinGroup, 'firebase.analytics().logJoinGroup(*):'),
    );
  }

  logLevelEnd(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelEnd(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_end',
      validateStruct(object, structs.LevelEnd, 'firebase.analytics().logLevelEnd(*):'),
    );
  }

  logLevelStart(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelStart(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_start',
      validateStruct(object, structs.LevelStart, 'firebase.analytics().logLevelStart(*):'),
    );
  }

  logLevelUp(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLevelUp(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'level_up',
      validateStruct(object, structs.LevelUp, 'firebase.analytics().logLevelUp(*):'),
    );
  }

  logLogin(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logLogin(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'login',
      validateStruct(object, structs.Login, 'firebase.analytics().logLogin(*):'),
    );
  }

  logPostScore(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logPostScore(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'post_score',
      validateStruct(object, structs.PostScore, 'firebase.analytics().logPostScore(*):'),
    );
  }

  logPresentOffer(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logPresentOffer(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logPresentOffer(*):');

    return this.logEvent(
      'present_offer',
      validateStruct(object, structs.PresentOffer, 'firebase.analytics().logPresentOffer(*):'),
    );
  }

  logPurchaseRefund(object = {}) {
    validateCompound(object, 'value', 'currency', 'firebase.analytics().logPresentOffer(*):');

    return this.logEvent(
      'purchase_refund',
      validateStruct(object, structs.PurchaseRefund, 'firebase.analytics().logPurchaseRefund(*):'),
    );
  }

  logRemoveFromCart(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logRemoveFromCart(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logRemoveFromCart(*):');

    return this.logEvent(
      'remove_from_cart',
      validateStruct(object, structs.RemoveFromCart, 'firebase.analytics().logRemoveFromCart(*):'),
    );
  }

  logSearch(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSearch(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'search',
      validateStruct(object, structs.Search, 'firebase.analytics().logSearch(*):'),
    );
  }

  logSelectContent(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSelectContent(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'select_content',
      validateStruct(object, structs.SelectContent, 'firebase.analytics().logSelectContent(*):'),
    );
  }

  logSetCheckoutOption(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSetCheckoutOption(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'set_checkout_option',
      validateStruct(
        object,
        structs.SetCheckoutOption,
        'firebase.analytics().logSetCheckoutOption(*):',
      ),
    );
  }

  logShare(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logShare(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'share',
      validateStruct(object, structs.Share, 'firebase.analytics().logShare(*):'),
    );
  }

  logSignUp(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSignUp(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'sign_up',
      validateStruct(object, structs.SignUp, 'firebase.analytics().logSignUp(*):'),
    );
  }

  logSpendVirtualCurrency(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSpendVirtualCurrency(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'spend_virtual_currency',
      validateStruct(
        object,
        structs.SpendVirtualCurrency,
        'firebase.analytics().logSpendVirtualCurrency(*):',
      ),
    );
  }

  logTutorialBegin() {
    return this.logEvent('tutorial_begin');
  }

  logTutorialComplete() {
    return this.logEvent('tutorial_complete');
  }

  logUnlockAchievement(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logUnlockAchievement(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'unlock_achievement',
      validateStruct(
        object,
        structs.UnlockAchievement,
        'firebase.analytics().logUnlockAchievement(*):',
      ),
    );
  }

  logViewItem(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logViewItem(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logViewItem(*):');

    return this.logEvent(
      'view_item',
      validateStruct(object, structs.ViewItem, 'firebase.analytics().logViewItem(*):'),
    );
  }

  logViewItemList(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logViewItemList(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'view_item_list',
      validateStruct(object, structs.ViewItemList, 'firebase.analytics().logViewItemList(*):'),
    );
  }

  logViewSearchResults(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logViewSearchResults(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'view_search_results',
      validateStruct(
        object,
        structs.ViewSearchResults,
        'firebase.analytics().logViewSearchResults(*):',
      ),
    );
  }
}

// import { SDK_VERSION } from '@react-native-firebase/analytics';
export const SDK_VERSION = version;

// import analytics from '@react-native-firebase/analytics';
// analytics().logEvent(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAnalyticsModule,
});

// import analytics, { firebase } from '@react-native-firebase/analytics';
// analytics().logEvent(...);
// firebase.analytics().logEvent(...);
export const firebase = getFirebaseRoot();
