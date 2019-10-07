import analytics, { firebase } from '@react-native-firebase/analytics';

analytics.SDK_VERSION;
analytics().app.name;
// checks module exists at root
console.log(firebase.analytics().app.name);

// checks module exists at app level
console.log(firebase.app().analytics().app.name);

// checks statics exist
console.log(firebase.analytics.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

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

console.log(analytics().logAddPaymentInfo);
console.log(analytics().logAddToCart);
console.log(analytics().logAddToWishlist);
console.log(analytics().logAppOpen);
console.log(analytics().logBeginCheckout);
console.log(analytics().logCampaignDetails);
console.log(analytics().logEarnVirtualCurrency);
console.log(analytics().logEcommercePurchase);
console.log(analytics().logEvent);
console.log(analytics().logGenerateLead);
console.log(analytics().logJoinGroup);
console.log(analytics().logLevelEnd);
console.log(analytics().logLevelStart);
console.log(analytics().logLevelUp);
console.log(analytics().logLogin);
console.log(analytics().logPresentOffer);
console.log(analytics().logPurchaseRefund);
console.log(analytics().logRemoveFromCart);
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
console.log(analytics().logViewSearchResults);
console.log(analytics().resetAnalyticsData);
console.log(analytics().setAnalyticsCollectionEnabled);
console.log(analytics().setCurrentScreen);
console.log(analytics().setMinimumSessionDuration);
console.log(analytics().setSessionTimeoutDuration);
console.log(analytics().setUserId);
console.log(analytics().setUserProperties);
console.log(analytics().setUserProperty);
