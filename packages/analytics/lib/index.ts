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

import type { FirebaseApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';
import {
  isAlphaNumericUnderscore,
  isE164PhoneNumber,
  isIOS,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  isOneOf,
  isString,
  isUndefined,
} from '@react-native-firebase/app/dist/module/common';

import {
  FirebaseModule,
  getOrCreateModularInstance,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';

import './types/internal';

// Internal types are now available through module declarations in app package
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';

import { validateStruct, validateCompound } from './struct';
import { RNFBAnalyticsModule } from './web/RNFBAnalyticsModule';
import { version } from './version';
import * as structs from './structs';
import type {
  Analytics,
  AnalyticsCallOptions,
  ConsentSettings,
  AnalyticsSettings,
  SettingsOptions,
  AddPaymentInfoEventParameters,
  ScreenViewParameters,
  AddShippingInfoParameters,
  AddToCartEventParameters,
  AddToWishlistEventParameters,
  BeginCheckoutEventParameters,
  CampaignDetailsEventParameters,
  EarnVirtualCurrencyEventParameters,
  GenerateLeadEventParameters,
  JoinGroupEventParameters,
  LevelEndEventParameters,
  LevelStartEventParameters,
  LevelUpEventParameters,
  LoginEventParameters,
  PostScoreEventParameters,
  SelectContentEventParameters,
  PurchaseEventParameters,
  RefundEventParameters,
  RemoveFromCartEventParameters,
  SearchEventParameters,
  SelectItemEventParameters,
  SetCheckoutOptionEventParameters,
  SelectPromotionEventParameters,
  ShareEventParameters,
  SignUpEventParameters,
  SpendVirtualCurrencyEventParameters,
  UnlockAchievementEventParameters,
  ViewCartEventParameters,
  ViewItemEventParameters,
  ViewItemListEventParameters,
  ViewPromotionEventParameters,
  ViewSearchResultsParameters,
  EventParams,
  CustomEventName,
} from './types/analytics';

export type {
  Analytics,
  AnalyticsCallOptions,
  ConsentSettings,
  AnalyticsSettings,
  SettingsOptions,
  Currency,
  ConsentStatusString,
  Promotion,
  Item,
  AddPaymentInfoEventParameters,
  AddShippingInfoParameters,
  AddToCartEventParameters,
  AddToWishlistEventParameters,
  BeginCheckoutEventParameters,
  CampaignDetailsEventParameters,
  EarnVirtualCurrencyEventParameters,
  GenerateLeadEventParameters,
  JoinGroupEventParameters,
  LevelEndEventParameters,
  LevelStartEventParameters,
  LevelUpEventParameters,
  LoginEventParameters,
  PostScoreEventParameters,
  SelectContentEventParameters,
  PurchaseEventParameters,
  RefundEventParameters,
  RemoveFromCartEventParameters,
  SearchEventParameters,
  SelectItemEventParameters,
  SetCheckoutOptionEventParameters,
  SelectPromotionEventParameters,
  ShareEventParameters,
  SignUpEventParameters,
  SpendVirtualCurrencyEventParameters,
  UnlockAchievementEventParameters,
  ViewCartEventParameters,
  ViewItemEventParameters,
  ViewItemListEventParameters,
  ViewPromotionEventParameters,
  ViewSearchResultsParameters,
  ScreenViewParameters,
  EventParams,
  GtagConfigParams,
  EventNameString,
  CustomEventName,
} from './types/analytics';

const ReservedEventNames: readonly string[] = [
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
] as const;

const namespace = 'analytics';

const nativeModuleName = 'NativeRNFBTurboAnalytics' as const;

class FirebaseAnalyticsModule extends FirebaseModule<typeof nativeModuleName> {
  logEvent(
    name: string,
    params: { [key: string]: any } = {},
    options: AnalyticsCallOptions = { global: false },
  ): Promise<void> {
    if (!isString(name)) {
      throw new Error("firebase.analytics().logEvent(*) 'name' expected a string value.");
    }

    if (!isUndefined(params) && !isObject(params)) {
      throw new Error("firebase.analytics().logEvent(_, *) 'params' expected an object value.");
    }

    // check name is not a reserved event name
    if (isOneOf(name, ReservedEventNames as any[])) {
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

  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
      );
    }

    return this.native.setAnalyticsCollectionEnabled(enabled);
  }

  setSessionTimeoutDuration(milliseconds: number = 1800000): Promise<void> {
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

  getAppInstanceId(): Promise<string | null> {
    return this.native.getAppInstanceId();
  }

  getSessionId(): Promise<number | null> {
    return this.native.getSessionId();
  }

  setUserId(id: string | null): Promise<void> {
    if (!isNull(id) && !isString(id)) {
      throw new Error("firebase.analytics().setUserId(*) 'id' expected a string value.");
    }

    return this.native.setUserId(id);
  }

  setUserProperty(name: string, value: string | null): Promise<void> {
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

  setUserProperties(
    properties: { [key: string]: string | null },
    options: AnalyticsCallOptions = { global: false },
  ): Promise<void> {
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
      const entry = entries[i];
      if (!entry) continue;
      const [key, value] = entry;
      if (!isNull(value) && !isString(value)) {
        throw new Error(
          `firebase.analytics().setUserProperties(*) 'properties' value for parameter '${key}' is invalid, expected a string.`,
        );
      }
    }

    return this.native.setUserProperties(properties);
  }

  resetAnalyticsData(): Promise<void> {
    return this.native.resetAnalyticsData();
  }

  setConsent(consentSettings: ConsentSettings): Promise<void> {
    if (!isObject(consentSettings)) {
      throw new Error(
        'firebase.analytics().setConsent(*): The supplied arg must be an object of key/values.',
      );
    }

    const entries = Object.entries(consentSettings);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      const [key, value] = entry;
      if (key === 'security_storage') {
        if (!isOneOf(value, ['granted', 'denied'])) {
          throw new Error(
            `firebase.analytics().setConsent(*) 'consentSettings' value for parameter '${key}' is invalid, expected one of 'granted' or 'denied'.`,
          );
        }
        continue;
      }
      if (!isBoolean(value)) {
        throw new Error(
          `firebase.analytics().setConsent(*) 'consentSettings' value for parameter '${key}' is invalid, expected a boolean.`,
        );
      }
    }

    return this.native.setConsent(consentSettings);
  }

  /** -------------------
   *        EVENTS
   * -------------------- */
  logAddPaymentInfo(object: AddPaymentInfoEventParameters): Promise<void> {
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

  logScreenView(object: ScreenViewParameters): Promise<void> {
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

  logAddShippingInfo(object: AddShippingInfoParameters = {}): Promise<void> {
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

  logAddToCart(object: AddToCartEventParameters = {}): Promise<void> {
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

  logAddToWishlist(object: AddToWishlistEventParameters = {}): Promise<void> {
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

  logAppOpen(): Promise<void> {
    return this.logEvent('app_open');
  }

  logBeginCheckout(object: BeginCheckoutEventParameters = {}): Promise<void> {
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

  logCampaignDetails(object: CampaignDetailsEventParameters): Promise<void> {
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

  logEarnVirtualCurrency(object: EarnVirtualCurrencyEventParameters): Promise<void> {
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

  logGenerateLead(object: GenerateLeadEventParameters = {}): Promise<void> {
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

  logJoinGroup(object: JoinGroupEventParameters): Promise<void> {
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

  logLevelEnd(object: LevelEndEventParameters): Promise<void> {
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

  logLevelStart(object: LevelStartEventParameters): Promise<void> {
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

  logLevelUp(object: LevelUpEventParameters): Promise<void> {
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

  logLogin(object: LoginEventParameters): Promise<void> {
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

  logPostScore(object: PostScoreEventParameters): Promise<void> {
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

  logSelectContent(object: SelectContentEventParameters): Promise<void> {
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

  logPurchase(object: PurchaseEventParameters = {}): Promise<void> {
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

  logRefund(object: RefundEventParameters = {}): Promise<void> {
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

  logRemoveFromCart(object: RemoveFromCartEventParameters = {}): Promise<void> {
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

  logSearch(object: SearchEventParameters): Promise<void> {
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

  logSelectItem(object: SelectItemEventParameters): Promise<void> {
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

  logSetCheckoutOption(object: SetCheckoutOptionEventParameters): Promise<void> {
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

  logSelectPromotion(object: SelectPromotionEventParameters): Promise<void> {
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

  logShare(object: ShareEventParameters): Promise<void> {
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

  logSignUp(object: SignUpEventParameters): Promise<void> {
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

  logSpendVirtualCurrency(object: SpendVirtualCurrencyEventParameters): Promise<void> {
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

  logTutorialBegin(): Promise<void> {
    return this.logEvent('tutorial_begin');
  }

  logTutorialComplete(): Promise<void> {
    return this.logEvent('tutorial_complete');
  }

  logUnlockAchievement(object: UnlockAchievementEventParameters): Promise<void> {
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

  logViewCart(object: ViewCartEventParameters = {}): Promise<void> {
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

  logViewItem(object: ViewItemEventParameters = {}): Promise<void> {
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

  logViewItemList(object: ViewItemListEventParameters = {}): Promise<void> {
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

  logViewPromotion(object: ViewPromotionEventParameters = {}): Promise<void> {
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
  logViewSearchResults(object: ViewSearchResultsParameters): Promise<void> {
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

  setDefaultEventParameters(params?: { [key: string]: any }): Promise<void> {
    if (!isObject(params) && !isNull(params) && !isUndefined(params)) {
      throw new Error(
        "firebase.analytics().setDefaultEventParameters(*) 'params' expected an object value when it is defined.",
      );
    }

    return this.native.setDefaultEventParameters(params);
  }

  initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress: string): Promise<void> {
    if (!isString(emailAddress)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress(*) 'emailAddress' expected a string value.",
      );
    }

    if (!isIOS) {
      return Promise.resolve();
    }

    return (
      this.native.initiateOnDeviceConversionMeasurementWithEmailAddress?.(emailAddress) ??
      Promise.resolve()
    );
  }

  initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
    hashedEmailAddress: string,
  ): Promise<void> {
    if (!isString(hashedEmailAddress)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress(*) 'hashedEmailAddress' expected a string value.",
      );
    }

    if (!isIOS) {
      return Promise.resolve();
    }

    return (
      this.native.initiateOnDeviceConversionMeasurementWithHashedEmailAddress?.(
        hashedEmailAddress,
      ) ?? Promise.resolve()
    );
  }

  initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber: string): Promise<void> {
    if (!isE164PhoneNumber(phoneNumber)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithPhoneNumber(*) 'phoneNumber' expected a string value in E.164 format.",
      );
    }

    if (!isIOS) {
      return Promise.resolve();
    }

    return (
      this.native.initiateOnDeviceConversionMeasurementWithPhoneNumber?.(phoneNumber) ??
      Promise.resolve()
    );
  }

  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
    hashedPhoneNumber: string,
  ): Promise<void> {
    if (isE164PhoneNumber(hashedPhoneNumber)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a sha256-hashed value of a phone number in E.164 format.",
      );
    }

    if (!isString(hashedPhoneNumber)) {
      throw new Error(
        "firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(*) 'hashedPhoneNumber' expected a string value.",
      );
    }

    if (!isIOS) {
      return Promise.resolve();
    }

    return (
      this.native.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber?.(hashedPhoneNumber) ??
      Promise.resolve()
    );
  }
}

const config: ModuleConfig = {
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  turboModule: true,
};

export const SDK_VERSION: string = version;

/**
 * Returns an Analytics instance for the given app.
 */
export function getAnalytics(app?: FirebaseApp): Analytics {
  return getOrCreateModularInstance(FirebaseAnalyticsModule, config, app) as unknown as Analytics;
}

/**
 * Returns an Analytics instance for the given app.
 */
export function initializeAnalytics(app: FirebaseApp, _options?: AnalyticsSettings): Analytics {
  return getAnalytics(app);
}

/**
 * Retrieves a unique Google Analytics identifier for the web client.
 */
export async function getGoogleAnalyticsClientId(analytics: Analytics): Promise<string> {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    throw new Error('getGoogleAnalyticsClientId is web-only.');
  } else {
    const instanceId = await getAppInstanceId(analytics);
    return instanceId || '';
  }
}

import type { AnalyticsInternal } from './types/internal';

/**
 * Log a custom event with optional params.
 */
// Overloads for standard event names
export function logEvent(
  analytics: Analytics,
  name: 'add_payment_info',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
    coupon?: EventParams['coupon'];
    payment_type?: EventParams['payment_type'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'add_shipping_info',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
    coupon?: EventParams['coupon'];
    shipping_tier?: EventParams['shipping_tier'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'add_to_cart',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'add_to_wishlist',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'begin_checkout',
  params?: {
    currency?: EventParams['currency'];
    value?: EventParams['value'];
    coupon?: EventParams['coupon'];
    items?: EventParams['items'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'checkout_progress',
  params?: {
    checkout_step?: EventParams['checkout_step'];
    checkout_option?: EventParams['checkout_option'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'exception',
  params?: {
    description?: EventParams['description'];
    fatal?: EventParams['fatal'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'generate_lead',
  params?: {
    currency?: EventParams['currency'];
    value?: EventParams['value'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'login',
  params: {
    method: EventParams['method'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'page_view',
  params?: {
    page_title?: EventParams['page_title'];
    page_location?: EventParams['page_location'];
    page_path?: EventParams['page_path'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'purchase',
  params?: {
    affiliation?: EventParams['affiliation'];
    coupon?: EventParams['coupon'];
    currency?: EventParams['currency'];
    items?: EventParams['items'];
    shipping?: EventParams['shipping'];
    tax?: EventParams['tax'];
    value?: EventParams['value'];
    transaction_id?: EventParams['transaction_id'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'refund',
  params?: {
    affiliation?: EventParams['affiliation'];
    coupon?: EventParams['coupon'];
    currency?: EventParams['currency'];
    items?: EventParams['items'];
    shipping?: EventParams['shipping'];
    tax?: EventParams['tax'];
    value?: EventParams['value'];
    transaction_id?: EventParams['transaction_id'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'remove_from_cart',
  params?: {
    items?: EventParams['items'];
    value?: EventParams['value'];
    currency?: EventParams['currency'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'screen_view',
  params?: {
    screen_name?: EventParams['screen_name'];
    screen_class?: EventParams['screen_class'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'search',
  params: {
    search_term: EventParams['search_term'];
    number_of_nights?: number;
    number_of_rooms?: number;
    number_of_passengers?: number;
    origin?: string;
    destination?: string;
    start_date?: string;
    end_date?: string;
    travel_class?: string;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'select_content',
  params: {
    content_type: EventParams['content_type'];
    item_id: EventParams['item_id'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'select_item',
  params: {
    items?: EventParams['items'];
    content_type: EventParams['content_type'];
    item_list_id: EventParams['item_list_id'];
    item_list_name: EventParams['item_list_name'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'select_promotion',
  params: {
    creative_name: string;
    creative_slot: string;
    items?: EventParams['items'];
    location_id: string;
    promotion_id: EventParams['promotion_id'];
    promotion_name: EventParams['promotion_name'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'set_checkout_option',
  params?: {
    checkout_step?: EventParams['checkout_step'];
    checkout_option?: EventParams['checkout_option'];
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'share',
  params: {
    content_type: EventParams['content_type'];
    item_id: EventParams['item_id'];
    method: EventParams['method'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'sign_up',
  params: {
    method: EventParams['method'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'timing_complete',
  params?: {
    [key: string]: any;
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'view_cart',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'view_item',
  params?: {
    items?: EventParams['items'];
    currency?: EventParams['currency'];
    value?: EventParams['value'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'view_item_list',
  params?: {
    items?: EventParams['items'];
    item_list_id?: EventParams['item_list_id'];
    item_list_name?: EventParams['item_list_name'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'view_promotion',
  params?: {
    items?: EventParams['items'];
    location_id?: string;
    creative_name?: string;
    creative_slot?: string;
    promotion_id?: EventParams['promotion_id'];
    promotion_name?: EventParams['promotion_name'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: 'view_search_results',
  params: {
    search_term: EventParams['search_term'];
  },
  options?: AnalyticsCallOptions,
): Promise<void>;

// Generic fallback for custom event names
export function logEvent<T extends string>(
  analytics: Analytics,
  name: CustomEventName<T>,
  params?: { [key: string]: any },
  options?: AnalyticsCallOptions,
): Promise<void>;

export function logEvent(
  analytics: Analytics,
  name: string,
  params: { [key: string]: any } = {},
  options: AnalyticsCallOptions = { global: false },
): Promise<void> {
  return analytics.logEvent(name, params, options);
}

/**
 * Logs verified in-app purchase events in Google Analytics for Firebase after a purchase is
 * successful.
 *
 * @remarks iOS only (StoreKit 2). On Android and web the promise **rejects** before reaching
 * native — unlike `initiateOnDeviceConversionMeasurement*`, which resolve as a no-op on
 * non-iOS platforms.
 */
export function logTransaction(analytics: Analytics, transaction_id: string): Promise<void> {
  if (Platform.OS !== 'ios') {
    return Promise.reject(new Error('logTransaction is only available on iOS'));
  }

  return (analytics as AnalyticsInternal).native.logTransaction(transaction_id);
}

/**
 * If true, allows the device to collect analytical data and send it to Firebase. Useful for GDPR.
 */
export function setAnalyticsCollectionEnabled(
  analytics: Analytics,
  enabled: boolean,
): Promise<void> {
  return analytics.setAnalyticsCollectionEnabled(enabled);
}

/**
 * Sets the duration of inactivity that terminates the current session.
 */
export function setSessionTimeoutDuration(
  analytics: Analytics,
  milliseconds: number = 1800000,
): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.setSessionTimeoutDuration(milliseconds);
}

/**
 * Retrieve the app instance id of the application.
 */
export function getAppInstanceId(analytics: Analytics): Promise<string | null> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.getAppInstanceId();
}

/**
 * Retrieves the session id from the client.
 * On iOS, Firebase SDK may return an error that is handled internally and may take many minutes to return a valid value. Check native debug logs for more details.
 */
export function getSessionId(analytics: Analytics): Promise<number | null> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.getSessionId();
}

/**
 * Gives a user a unique identification.
 */
export function setUserId(analytics: Analytics, id: string | null): Promise<void> {
  return analytics.setUserId(id);
}

/**
 * Sets a key/value pair of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 */
export function setUserProperty(
  analytics: Analytics,
  name: string,
  value: string | null,
): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.setUserProperty(name, value);
}

/**
 * Sets multiple key/value pairs of data on the current user. Each Firebase project can have up to 25 uniquely named (case-sensitive) user properties.
 */
export function setUserProperties(
  analytics: Analytics,
  properties: { [key: string]: string | null },
  options: AnalyticsCallOptions = { global: false },
): Promise<void> {
  return analytics.setUserProperties(properties, options);
}

/**
 * Clears all analytics data for this instance from the device and resets the app instance ID.
 */
export function resetAnalyticsData(analytics: Analytics): Promise<void> {
  // This doesn't exist on firebase-js-sdk, but probably should keep this for android & iOS
  return analytics.resetAnalyticsData();
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user. Note: This is different from the in-app purchase event, which is reported automatically for Google Play-based apps.
 */
export function logAddPaymentInfo(
  analytics: Analytics,
  params: AddPaymentInfoEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddPaymentInfo(params);
}

/**
 * Sets or clears the screen name and class the user is currently viewing.
 */
export function logScreenView(analytics: Analytics, params: ScreenViewParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logScreenView(params);
}

/**
 * Add Payment Info event. This event signifies that a user has submitted their payment information to your app.
 */
export function logAddShippingInfo(
  analytics: Analytics,
  params: AddShippingInfoParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddShippingInfo(params);
}

/**
 * E-Commerce Add To Cart event.
 */
export function logAddToCart(
  analytics: Analytics,
  params: AddToCartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToCart(params);
}

/**
 * E-Commerce Add To Wishlist event. This event signifies that an item was added to a wishlist.
 */
export function logAddToWishlist(
  analytics: Analytics,
  params: AddToWishlistEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAddToWishlist(params);
}

/**
 * App Open event. By logging this event when an App is moved to the foreground, developers can understand how often users leave and return during the course of a Session.
 */
export function logAppOpen(analytics: Analytics): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logAppOpen();
}

/**
 * E-Commerce Begin Checkout event. This event signifies that a user has begun the process of checking out.
 */
export function logBeginCheckout(
  analytics: Analytics,
  params: BeginCheckoutEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logBeginCheckout(params);
}

/**
 * Log this event to supply the referral details of a re-engagement campaign.
 */
export function logCampaignDetails(
  analytics: Analytics,
  params: CampaignDetailsEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logCampaignDetails(params);
}

/**
 * Earn Virtual Currency event. This event tracks the awarding of virtual currency in your app.
 */
export function logEarnVirtualCurrency(
  analytics: Analytics,
  params: EarnVirtualCurrencyEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logEarnVirtualCurrency(params);
}

/**
 * Generate Lead event. Log this event when a lead has been generated in the app.
 */
export function logGenerateLead(
  analytics: Analytics,
  params: GenerateLeadEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logGenerateLead(params);
}

/**
 * Join Group event. Log this event when a user joins a group such as a guild, team or family.
 */
export function logJoinGroup(
  analytics: Analytics,
  params: JoinGroupEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logJoinGroup(params);
}

/**
 * Level End event.
 */
export function logLevelEnd(analytics: Analytics, params: LevelEndEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelEnd(params);
}

/**
 * Level Start event.
 */
export function logLevelStart(
  analytics: Analytics,
  params: LevelStartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelStart(params);
}

/**
 * Level Up event. This event signifies that a player has leveled up in your gaming app.
 */
export function logLevelUp(analytics: Analytics, params: LevelUpEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLevelUp(params);
}

/**
 * Login event. Apps with a login feature can report this event to signify that a user has logged in.
 */
export function logLogin(analytics: Analytics, params: LoginEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logLogin(params);
}

/**
 * Post Score event. Log this event when the user posts a score in your gaming app.
 */
export function logPostScore(
  analytics: Analytics,
  params: PostScoreEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logPostScore(params);
}

/**
 * Select Content event. This general purpose event signifies that a user has selected some content of a certain type in an app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectContentEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectContent(
  analytics: Analytics,
  params: SelectContentEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectContent(params);
}

/**
 * E-Commerce Purchase event. This event signifies that an item(s) was purchased by a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {PurchaseEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logPurchase(analytics: Analytics, params: PurchaseEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logPurchase(params);
}

/**
 * E-Commerce Refund event. This event signifies that a refund was issued.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RefundEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRefund(analytics: Analytics, params: RefundEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logRefund(params);
}

/**
 * Remove from cart event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {RemoveFromCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logRemoveFromCart(
  analytics: Analytics,
  params: RemoveFromCartEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logRemoveFromCart(params);
}

/**
 * Search event. Apps that support search features can use this event to contextualize search operations by supplying the appropriate, corresponding parameters.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SearchEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSearch(analytics: Analytics, params: SearchEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSearch(params);
}

/**
 * Select Item event. This event signifies that an item was selected by a user from a list.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectItem(
  analytics: Analytics,
  params: SelectItemEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectItem(params);
}

/**
 * Set checkout option event.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SetCheckoutOptionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSetCheckoutOption(
  analytics: Analytics,
  params: SetCheckoutOptionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSetCheckoutOption(params);
}

/**
 * Select promotion event. This event signifies that a user has selected a promotion offer.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SelectPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSelectPromotion(
  analytics: Analytics,
  params: SelectPromotionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSelectPromotion(params);
}

/**
 * Share event. Apps with social features can log the Share event to identify the most viral content.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ShareEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logShare(analytics: Analytics, params: ShareEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logShare(params);
}

/**
 * Sign Up event. This event indicates that a user has signed up for an account in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SignUpEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSignUp(analytics: Analytics, params: SignUpEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSignUp(params);
}

/**
 * Spend Virtual Currency event. This event tracks the sale of virtual goods in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {SpendVirtualCurrencyEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logSpendVirtualCurrency(
  analytics: Analytics,
  params: SpendVirtualCurrencyEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logSpendVirtualCurrency(params);
}

/**
 * Tutorial Begin event. This event signifies the start of the on-boarding process in your app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialBegin(analytics: Analytics): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialBegin();
}

/**
 * Tutorial End event. Use this event to signify the user's completion of your app's on-boarding process.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @returns {Promise<void>}
 */
export function logTutorialComplete(analytics: Analytics): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logTutorialComplete();
}

/**
 * Unlock Achievement event. Log this event when the user has unlocked an achievement in your game.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {UnlockAchievementEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logUnlockAchievement(
  analytics: Analytics,
  params: UnlockAchievementEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logUnlockAchievement(params);
}

/**
 * E-commerce View Cart event. This event signifies that a user has viewed their cart.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewCartEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewCart(analytics: Analytics, params: ViewCartEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewCart(params);
}

/**
 * View Item event. This event signifies that some content was shown to the user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItem(analytics: Analytics, params: ViewItemEventParameters): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItem(params);
}

/**
 * View Item List event. Log this event when the user has been presented with a list of items of a certain category.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewItemListEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewItemList(
  analytics: Analytics,
  params: ViewItemListEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewItemList(params);
}

/**
 * View Promotion event. This event signifies that a promotion was shown to a user.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewPromotionEventParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewPromotion(
  analytics: Analytics,
  params: ViewPromotionEventParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewPromotion(params);
}

/**
 * View Search Results event. Log this event when the user has been presented with the results of a search.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ViewSearchResultsParameters} params - Event parameters.
 * @returns {Promise<void>}
 */
export function logViewSearchResults(
  analytics: Analytics,
  params: ViewSearchResultsParameters,
): Promise<void> {
  // This is deprecated for both namespaced and modular.
  return analytics.logViewSearchResults(params);
}

/**
 * Adds parameters that will be set on every event logged from the SDK, including automatic ones.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {object} [params={}] - Parameters to be added to the map of parameters added to every event.
 * @returns {Promise<void>}
 */
export function setDefaultEventParameters(
  analytics: Analytics,
  params: { [key: string]: any } = {},
): Promise<void> {
  return analytics.setDefaultEventParameters(params);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 *
 * @remarks On Android and web the promise resolves without calling native (no-op). Unlike
 * `logTransaction`, non-iOS platforms do not reject.
 *
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} emailAddress - Email address, properly formatted complete with domain name e.g, 'user@example.com'.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithEmailAddress(
  analytics: Analytics,
  emailAddress: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithEmailAddress(emailAddress);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 * {@link https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials}
 *
 * @remarks On Android and web the promise resolves without calling native (no-op). Unlike
 * `logTransaction`, non-iOS platforms do not reject.
 *
 * @param analytics Analytics instance.
 * @param hashedEmailAddress sha256-hashed of normalized email address, properly formatted complete with domain name e.g, 'user@example.com'
 */
export function initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
  analytics: Analytics,
  hashedEmailAddress: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedEmailAddress(hashedEmailAddress);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 *
 * @remarks On Android and web the promise resolves without calling native (no-op). Unlike
 * `logTransaction`, non-iOS platforms do not reject.
 *
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {string} phoneNumber - Phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 * @returns {Promise<void>}
 */
export function initiateOnDeviceConversionMeasurementWithPhoneNumber(
  analytics: Analytics,
  phoneNumber: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithPhoneNumber(phoneNumber);
}

/**
 * start privacy-sensitive on-device conversion management.
 * This is iOS-only.
 * This is a no-op if you do not include '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true' in your Podfile
 * {@link https://firebase.google.com/docs/tutorials/ads-ios-on-device-measurement/step-3#use-hashed-credentials}
 *
 * @remarks On Android and web the promise resolves without calling native (no-op). Unlike
 * `logTransaction`, non-iOS platforms do not reject.
 *
 * @param analytics Analytics instance.
 * @param hashedPhoneNumber sha256-hashed of normalized phone number in E.164 format - that is a leading + sign, then up to 15 digits, no dashes or spaces.
 */
export function initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
  analytics: Analytics,
  hashedPhoneNumber: string,
): Promise<void> {
  return analytics.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(hashedPhoneNumber);
}

/**
 * Checks four different things.
 * 1. Checks if it's not a browser extension environment.
 * 2. Checks if cookies are enabled in current browser.
 * 3. Checks if IndexedDB is supported by the browser environment.
 * 4. Checks if the current browser context is valid for using IndexedDB.open().
 * @returns {Promise<boolean>}
 */
export function isSupported(): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * Sets the applicable end user consent state for this app.
 * @param {FirebaseAnalytics} analytics - Analytics instance.
 * @param {ConsentSettings} consentSettings - See ConsentSettings.
 * @returns {Promise<void>}
 */
export function setConsent(analytics: Analytics, consentSettings: ConsentSettings): Promise<void> {
  return analytics.setConsent(consentSettings);
}

/**
 * Configures Firebase Analytics to use custom gtag or dataLayer names.
 * Intended to be used if gtag.js script has been installed on this page independently of Firebase Analytics, and is using non-default names for either the gtag function or for dataLayer. Must be called before calling `getAnalytics()` or it won't have any effect. Web only.
 * @param {SettingsOptions} _options - See SettingsOptions - currently unused.
 * @returns {void}
 */

export function settings(_options: SettingsOptions): void {
  // Returns nothing until Web implemented.
}

setReactNativeModule(nativeModuleName, RNFBAnalyticsModule as unknown as Record<string, unknown>);
