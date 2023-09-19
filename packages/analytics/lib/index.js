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
  isE164PhoneNumber,
  isIOS,
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
import { isBoolean } from '@react-native-firebase/app/lib/common';

import version from './version';
import * as structs from './structs';

export {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  setSessionTimeoutDuration,
  getAppInstanceId,
  getSessionId,
  setUserId,
  setUserProperty,
  setUserProperties,
  resetAnalyticsData,
  logAddPaymentInfo,
  logScreenView,
  logAddShippingInfo,
  logAddToCart,
  logAddToWishlist,
  logAppOpen,
  logBeginCheckout,
  logCampaignDetails,
  logEarnVirtualCurrency,
  logGenerateLead,
  logJoinGroup,
  logLevelEnd,
  logLevelStart,
  logLevelUp,
  logLogin,
  logPostScore,
  logSelectContent,
  logPurchase,
  logRefund,
  logRemoveFromCart,
  logSearch,
  logSelectItem,
  logSetCheckoutOption,
  logSelectPromotion,
  logShare,
  logSignUp,
  logSpendVirtualCurrency,
  logTutorialBegin,
  logTutorialComplete,
  logUnlockAchievement,
  logViewCart,
  logViewItem,
  logViewItemList,
  logViewPromotion,
  logViewSearchResults,
  setDefaultEventParameters,
  initiateOnDeviceConversionMeasurementWithEmailAddress,
  initiateOnDeviceConversionMeasurementWithPhoneNumber,
} from './modular/index';

const ReservedEventNames = [
  'ad_activeview',
  'ad_click',
  'ad_exposure',
  // 'ad_impression', // manual ad_impression logging is allowed, See #6307
  'ad_query',
  'ad_reward',
  'adunit_exposure',
  'app_background',
  'app_clear_data',
  // 'app_exception',
  'app_remove',
  'app_store_refund',
  'app_store_subscription_cancel',
  'app_store_subscription_convert',
  'app_store_subscription_renew',
  'app_update',
  'app_upgrade',
  'dynamic_link_app_open',
  'dynamic_link_app_update',
  'dynamic_link_first_open',
  'error',
  'first_open',
  'first_visit',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'session_start_with_rollout',
  'user_engagement',
];

const statics = {};

const namespace = 'analytics';

const nativeModuleName = 'RNFBAnalyticsModule';

class FirebaseAnalyticsModule extends FirebaseModule {
  logEvent(name, params = {}, options = {}) {
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
    if (!isAlphaNumericUnderscore(name) || name.length > 40) {
      throw new Error(
        `firebase.analytics().logEvent(*) 'name' invalid event name '${name}'. Names should contain 1 to 40 alphanumeric characters or underscores.`,
      );
    }

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          "firebase.analytics().logEvent(_, _, *) 'options' expected an object value.",
        );
      }

      if (!isUndefined(options.global) && !isBoolean(options.global)) {
        throw new Error("'options.global' property expected a boolean.");
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

  getAppInstanceId() {
    return this.native.getAppInstanceId();
  }

  getSessionId() {
    return this.native.getSessionId();
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

  setUserProperties(properties, options = {}) {
    if (!isObject(properties)) {
      throw new Error(
        "firebase.analytics().setUserProperties(*) 'properties' expected an object of key/value pairs.",
      );
    }

    if (!isUndefined(options)) {
      if (!isObject(options)) {
        throw new Error(
          "firebase.analytics().logEvent(_, _, *) 'options' expected an object value.",
        );
      }

      if (!isUndefined(options.global) && !isBoolean(options.global)) {
        throw new Error("'options.global' property expected a boolean.");
      }
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
  logAddPaymentInfo(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddPaymentInfo(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddPaymentInfo(*):');

    return this.logEvent(
      'add_payment_info',
      validateStruct(object, structs.AddPaymentInfo, 'firebase.analytics().logAddPaymentInfo(*):'),
    );
  }

  logScreenView(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logScreenView(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'screen_view',
      validateStruct(object, structs.ScreenView, 'firebase.analytics().logScreenView(*):'),
    );
  }

  logAddShippingInfo(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddShippingInfo(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddShippingInfo(*):');

    return this.logEvent(
      'add_shipping_info',
      validateStruct(
        object,
        structs.AddShippingInfo,
        'firebase.analytics().logAddShippingInfo(*):',
      ),
    );
  }

  logAddToCart(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logAddToCart(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logAddToCart(*):');

    return this.logEvent(
      'add_to_cart',
      validateStruct(object, structs.AddToCart, 'firebase.analytics().logAddToCart(*):'),
    );
  }

  logAddToWishlist(object = {}) {
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
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logBeginCheckout(*): The supplied arg must be an object of key/values.',
      );
    }

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

  logGenerateLead(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logGenerateLead(*): The supplied arg must be an object of key/values.',
      );
    }

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

  logPurchase(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logPurchase(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logPurchase(*):');

    return this.logEvent(
      'purchase',
      validateStruct(object, structs.Purchase, 'firebase.analytics().logPurchaseEvent(*):'),
    );
  }

  logRefund(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logRefund(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logRefund(*):');

    return this.logEvent(
      'refund',
      validateStruct(object, structs.Refund, 'firebase.analytics().logRefund(*):'),
    );
  }

  logRemoveFromCart(object = {}) {
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

  logSelectItem(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSelectItem(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'select_item',
      validateStruct(object, structs.SelectItem, 'firebase.analytics().logSelectItem(*):'),
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

  logSelectPromotion(object) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logSelectPromotion(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'select_promotion',
      validateStruct(
        object,
        structs.SelectPromotion,
        'firebase.analytics().logSelectPromotion(*):',
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

  logViewCart(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logViewCart(*): The supplied arg must be an object of key/values.',
      );
    }

    validateCompound(object, 'value', 'currency', 'firebase.analytics().logViewCart(*):');

    return this.logEvent(
      'view_cart',
      validateStruct(object, structs.ViewCart, 'firebase.analytics().logViewCart(*):'),
    );
  }

  logViewItem(object = {}) {
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

  logViewItemList(object = {}) {
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

  logViewPromotion(object = {}) {
    if (!isObject(object)) {
      throw new Error(
        'firebase.analytics().logViewPromotion(*): The supplied arg must be an object of key/values.',
      );
    }

    return this.logEvent(
      'view_promotion',
      validateStruct(object, structs.ViewPromotion, 'firebase.analytics().logViewPromotion(*):'),
    );
  }
  /**
   * Unsupported in "Enhanced Ecommerce reports":
   * https://firebase.google.com/docs/reference/android/com/google/firebase/analytics/FirebaseAnalytics.Event#public-static-final-string-view_search_results
   */
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

  setDefaultEventParameters(params) {
    if (!isObject(params) && !isNull(params) && !isUndefined(params)) {
      throw new Error(
        "firebase.analytics().setDefaultEventParameters(*) 'params' expected an object value when it is defined.",
      );
    }

    return this.native.setDefaultEventParameters(params);
  }

  initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress) {
    if (!isString(emailAddress)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress(*) 'emailAddress' expected a string value.",
      );
    }

    if (!isIOS) {
      return;
    }

    return this.native.initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress);
  }

  initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber) {
    if (!isE164PhoneNumber(phoneNumber)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithPhoneNumber(*) 'phoneNumber' expected a string value in E.164 format.",
      );
    }

    if (!isIOS) {
      return;
    }

    return this.native.initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber);
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
