import firebase from '@react-native-firebase/app';
import * as analytics from '@react-native-firebase/analytics';

// checks module exists at root
console.log(firebase.analytics().app.name);

// checks module exists at app level
console.log(firebase.app().analytics().app.name);

// checks statics exist
console.log(firebase.analytics.SDK_VERSION);

// checks statics exist on defaultExport
console.log(analytics.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(analytics.firebase.SDK_VERSION);

firebase
  .analytics()
  .logAddPaymentInfo()
  .then();
firebase
  .analytics()
  .logAddToCart({ item_id: '123', item_category: '123', item_name: '123', quantity: 3 })
  .then();
firebase
  .analytics()
  .logLogin({ method: 'foo' })
  .then();
firebase
  .analytics()
  .setUserProperties({ foo: 'bar' })
  .then();

console.log(firebase.analytics().logAddPaymentInfo);
console.log(firebase.analytics().logAddToCart);
console.log(firebase.analytics().logAddToWishlist);
console.log(firebase.analytics().logAppOpen);
console.log(firebase.analytics().logBeginCheckout);
console.log(firebase.analytics().logCampaignDetails);
console.log(firebase.analytics().logEarnVirtualCurrency);
console.log(firebase.analytics().logEcommercePurchase);
console.log(firebase.analytics().logEvent);
console.log(firebase.analytics().logGenerateLead);
console.log(firebase.analytics().logJoinGroup);
console.log(firebase.analytics().logLevelEnd);
console.log(firebase.analytics().logLevelStart);
console.log(firebase.analytics().logLevelUp);
console.log(firebase.analytics().logLogin);
console.log(firebase.analytics().logPresentOffer);
console.log(firebase.analytics().logPurchaseRefund);
console.log(firebase.analytics().logRemoveFromCart);
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
console.log(firebase.analytics().logViewSearchResults);
console.log(firebase.analytics().resetAnalyticsData);
console.log(firebase.analytics().setAnalyticsCollectionEnabled);
console.log(firebase.analytics().setCurrentScreen);
console.log(firebase.analytics().setMinimumSessionDuration);
console.log(firebase.analytics().setSessionTimeoutDuration);
console.log(firebase.analytics().setUserId);
console.log(firebase.analytics().setUserProperties);
console.log(firebase.analytics().setUserProperty);
