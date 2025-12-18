import analytics, {
  firebase,
  // Types
  type Analytics,
  type AnalyticsCallOptions,
  type ConsentSettings,
  type AnalyticsSettings,
  type SettingsOptions,
  type Currency,
  type ConsentStatusString,
  type Promotion,
  type Item,
  type AddPaymentInfoEventParameters,
  type AddShippingInfoParameters,
  type AddToCartEventParameters,
  type AddToWishlistEventParameters,
  type BeginCheckoutEventParameters,
  type CampaignDetailsEventParameters,
  type EarnVirtualCurrencyEventParameters,
  type GenerateLeadEventParameters,
  type JoinGroupEventParameters,
  type LevelEndEventParameters,
  type LevelStartEventParameters,
  type LevelUpEventParameters,
  type LoginEventParameters,
  type PostScoreEventParameters,
  type SelectContentEventParameters,
  type PurchaseEventParameters,
  type RefundEventParameters,
  type RemoveFromCartEventParameters,
  type SearchEventParameters,
  type SelectItemEventParameters,
  type SetCheckoutOptionEventParameters,
  type SelectPromotionEventParameters,
  type ShareEventParameters,
  type SignUpEventParameters,
  type SpendVirtualCurrencyEventParameters,
  type UnlockAchievementEventParameters,
  type ViewCartEventParameters,
  type ViewItemEventParameters,
  type ViewItemListEventParameters,
  type ViewPromotionEventParameters,
  type ViewSearchResultsParameters,
  type ScreenViewParameters,
  type EventParams,
  type GtagConfigParams,
  type EventNameString,
  type CustomEventName,
  // Modular API
  getAnalytics,
  initializeAnalytics,
  getGoogleAnalyticsClientId,
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
  initiateOnDeviceConversionMeasurementWithHashedEmailAddress,
  initiateOnDeviceConversionMeasurementWithPhoneNumber,
  initiateOnDeviceConversionMeasurementWithHashedPhoneNumber,
  isSupported,
  setConsent,
  settings,
} from '.';

console.log(analytics().app);

// checks module exists at root
console.log(firebase.analytics().app.name);

// checks module exists at app level
console.log(firebase.app().analytics().app.name);

// Note: The 'app' property should exist on AnalyticsModule interface
// If TypeScript errors occur, it may be a type inference issue with createModuleNamespace

// checks statics exist
console.log(firebase.analytics.SDK_VERSION);

// checks statics exist on defaultExport
console.log(analytics.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// test method calls with proper types
firebase
  .analytics()
  .logAddPaymentInfo({ value: 123, currency: 'USD' })
  .then(() => {
    console.log('logAddPaymentInfo completed');
  });

firebase
  .analytics()
  .logAddToCart({ value: 123, currency: 'USD' })
  .then(() => {
    console.log('logAddToCart completed');
  });

firebase
  .analytics()
  .logLogin({ method: 'foo' })
  .then(() => {
    console.log('logLogin completed');
  });

firebase
  .analytics()
  .setUserProperties({ foo: 'bar' })
  .then(() => {
    console.log('setUserProperties completed');
  });

firebase.analytics().setConsent({ ad_storage: true });

// test type usage
const analyticsInstance: Analytics = firebase.analytics();
console.log(analyticsInstance.app.name);
const callOptions: AnalyticsCallOptions = { global: true };
console.log(callOptions.global);
const consentSettings: ConsentSettings = { ad_storage: true, analytics_storage: false };
const analyticsSettings: AnalyticsSettings = {};
console.log(analyticsSettings);
const settingsOptions: SettingsOptions = {};
console.log(settingsOptions);
const currency: Currency = 123;
console.log(currency);
const consentStatus: ConsentStatusString = 'granted';
console.log(consentStatus);
const promotion: Promotion = { id: 'promo1', name: 'Promotion' };
console.log(promotion.id);
const item: Item = { item_id: 'item1', item_name: 'Item' };
console.log(item.item_id);
const addPaymentInfoParams: AddPaymentInfoEventParameters = { value: 123, currency: 'USD' };
const addShippingInfoParams: AddShippingInfoParameters = { value: 123, currency: 'USD' };
const addToCartParams: AddToCartEventParameters = { value: 123, currency: 'USD' };
const addToWishlistParams: AddToWishlistEventParameters = { value: 123, currency: 'USD' };
const beginCheckoutParams: BeginCheckoutEventParameters = { value: 123, currency: 'USD' };
const campaignDetailsParams: CampaignDetailsEventParameters = {
  source: 'source',
  medium: 'medium',
  campaign: 'campaign',
};
const earnVirtualCurrencyParams: EarnVirtualCurrencyEventParameters = {
  virtual_currency_name: 'coins',
  value: 100,
};
const generateLeadParams: GenerateLeadEventParameters = { value: 123, currency: 'USD' };
const joinGroupParams: JoinGroupEventParameters = { group_id: 'group1' };
const levelEndParams: LevelEndEventParameters = { level: 1, success: 'true' };
const levelStartParams: LevelStartEventParameters = { level: 1 };
const levelUpParams: LevelUpEventParameters = { level: 5, character: 'character1' };
const loginParams: LoginEventParameters = { method: 'email' };
const postScoreParams: PostScoreEventParameters = { score: 100, level: 5 };
const selectContentParams: SelectContentEventParameters = {
  content_type: 'type',
  item_id: 'item1',
};
const purchaseParams: PurchaseEventParameters = {
  value: 123,
  currency: 'USD',
  transaction_id: 'tx1',
};
const refundParams: RefundEventParameters = { value: 123, currency: 'USD', transaction_id: 'tx1' };
const removeFromCartParams: RemoveFromCartEventParameters = { value: 123, currency: 'USD' };
const searchParams: SearchEventParameters = { search_term: 'term' };
const selectItemParams: SelectItemEventParameters = {
  item_list_id: 'list1',
  item_list_name: 'List',
  content_type: 'type',
};
const setCheckoutOptionParams: SetCheckoutOptionEventParameters = {
  checkout_step: 1,
  checkout_option: 'option',
};
const selectPromotionParams: SelectPromotionEventParameters = {
  promotion_id: 'promo1',
  promotion_name: 'Promotion',
  creative_name: 'Creative',
  creative_slot: 'Slot',
  location_id: 'location1',
};
const shareParams: ShareEventParameters = {
  method: 'email',
  content_type: 'type',
  item_id: 'item1',
};
const signUpParams: SignUpEventParameters = { method: 'email' };
const spendVirtualCurrencyParams: SpendVirtualCurrencyEventParameters = {
  virtual_currency_name: 'coins',
  value: 50,
  item_name: 'item',
};
const unlockAchievementParams: UnlockAchievementEventParameters = { achievement_id: 'ach1' };
const viewCartParams: ViewCartEventParameters = { value: 123, currency: 'USD' };
const viewItemParams: ViewItemEventParameters = { value: 123, currency: 'USD' };
const viewItemListParams: ViewItemListEventParameters = {
  item_list_id: 'list1',
  item_list_name: 'List',
};
const viewPromotionParams: ViewPromotionEventParameters = { promotion_id: 'promo1' };
const viewSearchResultsParams: ViewSearchResultsParameters = { search_term: 'term' };
const screenViewParams: ScreenViewParameters = { screen_name: 'screen', screen_class: 'Screen' };
const eventParams: EventParams = { key: 'value' };
console.log(eventParams.key);
const gtagConfigParams: GtagConfigParams = {};
console.log(gtagConfigParams);
const eventNameString: EventNameString = 'add_payment_info';
console.log(eventNameString);
const customEventName: CustomEventName<'my_custom_event'> = 'my_custom_event';
console.log(customEventName);

// checks all methods exist on firebase.analytics()
console.log(firebase.analytics().logAddPaymentInfo);
console.log(firebase.analytics().logAddToCart);
console.log(firebase.analytics().logAddShippingInfo);
console.log(firebase.analytics().logAddToWishlist);
console.log(firebase.analytics().logAppOpen);
console.log(firebase.analytics().logBeginCheckout);
console.log(firebase.analytics().logCampaignDetails);
console.log(firebase.analytics().logEarnVirtualCurrency);
console.log(firebase.analytics().logEvent);
console.log(firebase.analytics().logGenerateLead);
console.log(firebase.analytics().logJoinGroup);
console.log(firebase.analytics().logLevelEnd);
console.log(firebase.analytics().logLevelStart);
console.log(firebase.analytics().logLevelUp);
console.log(firebase.analytics().logLogin);
console.log(firebase.analytics().logPostScore);
console.log(firebase.analytics().logPurchase);
console.log(firebase.analytics().logRemoveFromCart);
console.log(firebase.analytics().logRefund);
console.log(firebase.analytics().logSearch);
console.log(firebase.analytics().logSelectContent);
console.log(firebase.analytics().logSetCheckoutOption);
console.log(firebase.analytics().logShare);
console.log(firebase.analytics().logSignUp);
console.log(firebase.analytics().logSpendVirtualCurrency);
console.log(firebase.analytics().logTutorialBegin);
console.log(firebase.analytics().logTutorialComplete);
console.log(firebase.analytics().logUnlockAchievement);
console.log(firebase.analytics().logViewItem);
console.log(firebase.analytics().logViewItemList);
console.log(firebase.analytics().resetAnalyticsData);
console.log(firebase.analytics().logViewCart);
console.log(firebase.analytics().setAnalyticsCollectionEnabled);
console.log(firebase.analytics().logSelectPromotion);
console.log(firebase.analytics().logScreenView);
console.log(firebase.analytics().logViewPromotion);
console.log(firebase.analytics().setSessionTimeoutDuration);
console.log(firebase.analytics().setUserId);
console.log(firebase.analytics().setUserProperties);
console.log(firebase.analytics().logViewSearchResults);
console.log(firebase.analytics().setUserProperty);
console.log(firebase.analytics().setConsent);

// checks all methods exist on default export
console.log(analytics().logAddPaymentInfo);
console.log(analytics().logAddToCart);
console.log(analytics().logAddShippingInfo);
console.log(analytics().logAddToWishlist);
console.log(analytics().logAppOpen);
console.log(analytics().logBeginCheckout);
console.log(analytics().logCampaignDetails);
console.log(analytics().logEarnVirtualCurrency);
console.log(analytics().logEvent);
console.log(analytics().logGenerateLead);
console.log(analytics().logJoinGroup);
console.log(analytics().logLevelEnd);
console.log(analytics().logLevelStart);
console.log(analytics().logLevelUp);
console.log(analytics().logLogin);
console.log(analytics().logPostScore);
console.log(analytics().logPurchase);
console.log(analytics().logRemoveFromCart);
console.log(analytics().logRefund);
console.log(analytics().logSearch);
console.log(analytics().logSelectContent);
console.log(analytics().logSetCheckoutOption);
console.log(analytics().logShare);
console.log(analytics().logSignUp);
console.log(analytics().logSpendVirtualCurrency);
console.log(analytics().logTutorialBegin);
console.log(analytics().logTutorialComplete);
console.log(analytics().logUnlockAchievement);
console.log(analytics().logViewItem);
console.log(analytics().logViewItemList);
console.log(analytics().resetAnalyticsData);
console.log(analytics().logViewCart);
console.log(analytics().setAnalyticsCollectionEnabled);
console.log(analytics().logSelectPromotion);
console.log(analytics().logScreenView);
console.log(analytics().logViewPromotion);
console.log(analytics().setSessionTimeoutDuration);
console.log(analytics().setUserId);
console.log(analytics().setUserProperties);
console.log(analytics().logViewSearchResults);
console.log(analytics().setUserProperty);
console.log(analytics().setConsent);

// checks missing methods exist on firebase.analytics()
console.log(firebase.analytics().getAppInstanceId);
console.log(firebase.analytics().getSessionId);
console.log(firebase.analytics().setDefaultEventParameters);
console.log(firebase.analytics().logSelectItem);
console.log(firebase.analytics().initiateOnDeviceConversionMeasurementWithEmailAddress);
console.log(firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress);
console.log(firebase.analytics().initiateOnDeviceConversionMeasurementWithPhoneNumber);
console.log(firebase.analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber);

// checks missing methods exist on default export
console.log(analytics().getAppInstanceId);
console.log(analytics().getSessionId);
console.log(analytics().setDefaultEventParameters);
console.log(analytics().logSelectItem);
console.log(analytics().initiateOnDeviceConversionMeasurementWithEmailAddress);
console.log(analytics().initiateOnDeviceConversionMeasurementWithHashedEmailAddress);
console.log(analytics().initiateOnDeviceConversionMeasurementWithPhoneNumber);
console.log(analytics().initiateOnDeviceConversionMeasurementWithHashedPhoneNumber);

// test method calls with missing methods
firebase
  .analytics()
  .getAppInstanceId()
  .then((id: string | null) => {
    console.log('getAppInstanceId:', id);
  });

firebase
  .analytics()
  .getSessionId()
  .then((id: number | null) => {
    console.log('getSessionId:', id);
  });

firebase
  .analytics()
  .setDefaultEventParameters({ key: 'value' })
  .then(() => {
    console.log('setDefaultEventParameters completed');
  });

firebase
  .analytics()
  .logSelectItem({ item_list_id: 'list1', item_list_name: 'List', content_type: 'type' })
  .then(() => {
    console.log('logSelectItem completed');
  });

firebase
  .analytics()
  .initiateOnDeviceConversionMeasurementWithEmailAddress('test@example.com')
  .then(() => {
    console.log('initiateOnDeviceConversionMeasurementWithEmailAddress completed');
  });

firebase
  .analytics()
  .initiateOnDeviceConversionMeasurementWithHashedEmailAddress('hashed')
  .then(() => {
    console.log('initiateOnDeviceConversionMeasurementWithHashedEmailAddress completed');
  });

firebase
  .analytics()
  .initiateOnDeviceConversionMeasurementWithPhoneNumber('+1234567890')
  .then(() => {
    console.log('initiateOnDeviceConversionMeasurementWithPhoneNumber completed');
  });

firebase
  .analytics()
  .initiateOnDeviceConversionMeasurementWithHashedPhoneNumber('hashed')
  .then(() => {
    console.log('initiateOnDeviceConversionMeasurementWithHashedPhoneNumber completed');
  });

// test modular API functions
const analyticsModular = getAnalytics();
const analyticsModularWithApp = getAnalytics(firebase.app());
console.log(analyticsModularWithApp.app.name);

const initializedAnalytics = initializeAnalytics(firebase.app(), {});
console.log(initializedAnalytics.app.name);

getGoogleAnalyticsClientId(analyticsModular).then((id: string) => {
  console.log('getGoogleAnalyticsClientId:', id);
});

logEvent(analyticsModular, 'event_name', { key: 'value' }, { global: false }).then(() => {
  console.log('logEvent completed');
});

setAnalyticsCollectionEnabled(analyticsModular, true).then(() => {
  console.log('setAnalyticsCollectionEnabled completed');
});

setSessionTimeoutDuration(analyticsModular, 1800000).then(() => {
  console.log('setSessionTimeoutDuration completed');
});

getAppInstanceId(analyticsModular).then((id: string | null) => {
  console.log('getAppInstanceId modular:', id);
});

getSessionId(analyticsModular).then((id: number | null) => {
  console.log('getSessionId modular:', id);
});

setUserId(analyticsModular, 'user123').then(() => {
  console.log('setUserId completed');
});

setUserProperty(analyticsModular, 'property', 'value').then(() => {
  console.log('setUserProperty completed');
});

setUserProperties(analyticsModular, { prop1: 'value1', prop2: 'value2' }, { global: false }).then(
  () => {
    console.log('setUserProperties completed');
  },
);

resetAnalyticsData(analyticsModular).then(() => {
  console.log('resetAnalyticsData completed');
});

logAddPaymentInfo(analyticsModular, addPaymentInfoParams).then(() => {
  console.log('logAddPaymentInfo modular completed');
});

logScreenView(analyticsModular, screenViewParams).then(() => {
  console.log('logScreenView modular completed');
});

logAddShippingInfo(analyticsModular, addShippingInfoParams).then(() => {
  console.log('logAddShippingInfo modular completed');
});

logAddToCart(analyticsModular, addToCartParams).then(() => {
  console.log('logAddToCart modular completed');
});

logAddToWishlist(analyticsModular, addToWishlistParams).then(() => {
  console.log('logAddToWishlist modular completed');
});

logAppOpen(analyticsModular).then(() => {
  console.log('logAppOpen modular completed');
});

logBeginCheckout(analyticsModular, beginCheckoutParams).then(() => {
  console.log('logBeginCheckout modular completed');
});

logCampaignDetails(analyticsModular, campaignDetailsParams).then(() => {
  console.log('logCampaignDetails modular completed');
});

logEarnVirtualCurrency(analyticsModular, earnVirtualCurrencyParams).then(() => {
  console.log('logEarnVirtualCurrency modular completed');
});

logGenerateLead(analyticsModular, generateLeadParams).then(() => {
  console.log('logGenerateLead modular completed');
});

logJoinGroup(analyticsModular, joinGroupParams).then(() => {
  console.log('logJoinGroup modular completed');
});

logLevelEnd(analyticsModular, levelEndParams).then(() => {
  console.log('logLevelEnd modular completed');
});

logLevelStart(analyticsModular, levelStartParams).then(() => {
  console.log('logLevelStart modular completed');
});

logLevelUp(analyticsModular, levelUpParams).then(() => {
  console.log('logLevelUp modular completed');
});

logLogin(analyticsModular, loginParams).then(() => {
  console.log('logLogin modular completed');
});

logPostScore(analyticsModular, postScoreParams).then(() => {
  console.log('logPostScore modular completed');
});

logSelectContent(analyticsModular, selectContentParams).then(() => {
  console.log('logSelectContent modular completed');
});

logPurchase(analyticsModular, purchaseParams).then(() => {
  console.log('logPurchase modular completed');
});

logRefund(analyticsModular, refundParams).then(() => {
  console.log('logRefund modular completed');
});

logRemoveFromCart(analyticsModular, removeFromCartParams).then(() => {
  console.log('logRemoveFromCart modular completed');
});

logSearch(analyticsModular, searchParams).then(() => {
  console.log('logSearch modular completed');
});

logSelectItem(analyticsModular, selectItemParams).then(() => {
  console.log('logSelectItem modular completed');
});

logSetCheckoutOption(analyticsModular, setCheckoutOptionParams).then(() => {
  console.log('logSetCheckoutOption modular completed');
});

logSelectPromotion(analyticsModular, selectPromotionParams).then(() => {
  console.log('logSelectPromotion modular completed');
});

logShare(analyticsModular, shareParams).then(() => {
  console.log('logShare modular completed');
});

logSignUp(analyticsModular, signUpParams).then(() => {
  console.log('logSignUp modular completed');
});

logSpendVirtualCurrency(analyticsModular, spendVirtualCurrencyParams).then(() => {
  console.log('logSpendVirtualCurrency modular completed');
});

logTutorialBegin(analyticsModular).then(() => {
  console.log('logTutorialBegin modular completed');
});

logTutorialComplete(analyticsModular).then(() => {
  console.log('logTutorialComplete modular completed');
});

logUnlockAchievement(analyticsModular, unlockAchievementParams).then(() => {
  console.log('logUnlockAchievement modular completed');
});

logViewCart(analyticsModular, viewCartParams).then(() => {
  console.log('logViewCart modular completed');
});

logViewItem(analyticsModular, viewItemParams).then(() => {
  console.log('logViewItem modular completed');
});

logViewItemList(analyticsModular, viewItemListParams).then(() => {
  console.log('logViewItemList modular completed');
});

logViewPromotion(analyticsModular, viewPromotionParams).then(() => {
  console.log('logViewPromotion modular completed');
});

logViewSearchResults(analyticsModular, viewSearchResultsParams).then(() => {
  console.log('logViewSearchResults modular completed');
});

setDefaultEventParameters(analyticsModular, { key: 'value' }).then(() => {
  console.log('setDefaultEventParameters modular completed');
});

initiateOnDeviceConversionMeasurementWithEmailAddress(analyticsModular, 'test@example.com').then(
  () => {
    console.log('initiateOnDeviceConversionMeasurementWithEmailAddress modular completed');
  },
);

initiateOnDeviceConversionMeasurementWithHashedEmailAddress(analyticsModular, 'hashed').then(() => {
  console.log('initiateOnDeviceConversionMeasurementWithHashedEmailAddress modular completed');
});

initiateOnDeviceConversionMeasurementWithPhoneNumber(analyticsModular, '+1234567890').then(() => {
  console.log('initiateOnDeviceConversionMeasurementWithPhoneNumber modular completed');
});

initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(analyticsModular, 'hashed').then(() => {
  console.log('initiateOnDeviceConversionMeasurementWithHashedPhoneNumber modular completed');
});

isSupported().then((supported: boolean) => {
  console.log('isSupported:', supported);
});

setConsent(analyticsModular, consentSettings).then(() => {
  console.log('setConsent modular completed');
});

settings(settingsOptions);
