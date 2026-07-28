import { getApp } from '@react-native-firebase/app';
import {
  getAnalytics,
  initializeAnalytics,
  getGoogleAnalyticsClientId,
  logEvent,
  logTransaction,
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
  SDK_VERSION,
  type Analytics,
  type AnalyticsCallOptions,
  type ConsentSettings,
  type AnalyticsSettings,
  type SettingsOptions,
  type AddPaymentInfoEventParameters,
  type ScreenViewParameters,
} from '.';

const analytics = getAnalytics();
console.log(analytics.app.name);

const analyticsWithApp = getAnalytics(getApp());
console.log(analyticsWithApp.app.name);

const initializedAnalytics = initializeAnalytics(getApp(), {});
console.log(initializedAnalytics.app.name);

const typedAnalytics: Analytics = analytics;
const typedCallOptions: AnalyticsCallOptions = { global: false };
const typedConsent: ConsentSettings = { ad_storage: true };
const typedSettings: AnalyticsSettings = {};
const typedSettingsOptions: SettingsOptions = {};
const typedAddPaymentInfo: AddPaymentInfoEventParameters = { currency: 'USD', value: 1 };
const typedScreenView: ScreenViewParameters = { screen_name: 'Home' };

console.log(typedCallOptions);
console.log(typedConsent);
console.log(typedSettings);
console.log(typedSettingsOptions);
console.log(typedAddPaymentInfo);
console.log(typedScreenView);
console.log(SDK_VERSION);

logEvent(analytics, 'invertase_event');
logEvent(analytics, 'screen_view', typedScreenView);
setAnalyticsCollectionEnabled(analytics, true);
setSessionTimeoutDuration(analytics, 1800000);
getAppInstanceId(analytics).then(id => console.log(id));
getSessionId(analytics).then(id => console.log(id));
setUserId(analytics, 'user');
setUserProperty(analytics, 'prop', 'value');
setUserProperties(analytics, { prop: 'value' });
resetAnalyticsData(analytics);
setDefaultEventParameters(analytics, { foo: 'bar' });
setConsent(analytics, typedConsent);
settings(typedSettingsOptions);

logAddPaymentInfo(analytics, typedAddPaymentInfo);
logScreenView(analytics, typedScreenView);
logAddShippingInfo(analytics, { currency: 'USD', value: 1 });
logAddToCart(analytics, { currency: 'USD', value: 1 });
logAddToWishlist(analytics, { currency: 'USD', value: 1 });
logAppOpen(analytics);
logBeginCheckout(analytics, { currency: 'USD', value: 1 });
logCampaignDetails(analytics, { source: 'src', medium: 'med', campaign: 'camp' });
logEarnVirtualCurrency(analytics, { virtual_currency_name: 'coins', value: 1 });
logGenerateLead(analytics, { currency: 'USD', value: 1 });
logJoinGroup(analytics, { group_id: 'group' });
logLevelEnd(analytics, { level: 1, success: true });
logLevelStart(analytics, { level: 1 });
logLevelUp(analytics, { level: 1, character: 'hero' });
logLogin(analytics, { method: 'email' });
logPostScore(analytics, { score: 100, level: 1, character: 'hero' });
logSelectContent(analytics, { content_type: 'type', item_id: 'id' });
logPurchase(analytics, { currency: 'USD', value: 1 });
logRefund(analytics, { currency: 'USD', value: 1 });
logRemoveFromCart(analytics, { currency: 'USD', value: 1 });
logSearch(analytics, { search_term: 'term' });
logSelectItem(analytics, { content_type: 'type', item_list_id: 'list', item_list_name: 'name' });
logSetCheckoutOption(analytics, { checkout_step: 1, checkout_option: 'option' });
logSelectPromotion(analytics, {
  creative_name: 'creative',
  creative_slot: 'slot',
  location_id: 'loc',
  promotion_id: 'promo',
  promotion_name: 'Promo',
});
logShare(analytics, { content_type: 'type', item_id: 'id', method: 'method' });
logSignUp(analytics, { method: 'email' });
logSpendVirtualCurrency(analytics, { virtual_currency_name: 'coins', value: 1, item_name: 'item' });
logTutorialBegin(analytics);
logTutorialComplete(analytics);
logUnlockAchievement(analytics, { achievement_id: 'ach' });
logViewCart(analytics, { currency: 'USD', value: 1 });
logViewItem(analytics, { currency: 'USD', value: 1 });
logViewItemList(analytics, { items: [] });
logViewPromotion(analytics, { items: [] });
logViewSearchResults(analytics, { search_term: 'term' });

initiateOnDeviceConversionMeasurementWithEmailAddress(analytics, 'user@example.com');
initiateOnDeviceConversionMeasurementWithHashedEmailAddress(
  analytics,
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
);
initiateOnDeviceConversionMeasurementWithPhoneNumber(analytics, '+15551234567');
initiateOnDeviceConversionMeasurementWithHashedPhoneNumber(
  analytics,
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
);

isSupported().then(supported => console.log(supported));
getGoogleAnalyticsClientId(analytics).then(clientId => console.log(clientId));
logTransaction(analytics, 'transaction-id');

console.log(typedAnalytics.logEvent);
console.log(typedAnalytics.setAnalyticsCollectionEnabled);
