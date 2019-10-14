import firebase from '@react-native-firebase/app';
import * as admob from '@react-native-firebase/admob';

console.log(firebase.admob.AdsConsentDebugGeography.DISABLED);
console.log(firebase.admob.AdsConsentDebugGeography.EEA);
console.log(firebase.admob.AdsConsentDebugGeography.NOT_EEA);
console.log(admob.AdsConsentDebugGeography.DISABLED);
console.log(admob.AdsConsentDebugGeography.EEA);
console.log(admob.AdsConsentDebugGeography.NOT_EEA);

console.log(firebase.admob.AdsConsentStatus.NON_PERSONALIZED);
console.log(firebase.admob.AdsConsentStatus.PERSONALIZED);
console.log(firebase.admob.AdsConsentStatus.UNKNOWN);
console.log(admob.AdsConsentStatus.NON_PERSONALIZED);
console.log(admob.AdsConsentStatus.PERSONALIZED);
console.log(admob.AdsConsentStatus.UNKNOWN);

console.log(firebase.admob.MaxAdContentRating.G);
console.log(firebase.admob.MaxAdContentRating.MA);
console.log(firebase.admob.MaxAdContentRating.PG);
console.log(firebase.admob.MaxAdContentRating.T);
console.log(admob.MaxAdContentRating.G);
console.log(admob.MaxAdContentRating.MA);
console.log(admob.MaxAdContentRating.PG);
console.log(admob.MaxAdContentRating.T);

console.log(firebase.admob.AdEventType.CLICKED);
console.log(firebase.admob.AdEventType.CLOSED);
console.log(firebase.admob.AdEventType.ERROR);
console.log(firebase.admob.AdEventType.LEFT_APPLICATION);
console.log(firebase.admob.AdEventType.LOADED);
console.log(firebase.admob.AdEventType.OPENED);
console.log(admob.AdEventType.CLICKED);
console.log(admob.AdEventType.CLOSED);
console.log(admob.AdEventType.ERROR);
console.log(admob.AdEventType.LEFT_APPLICATION);
console.log(admob.AdEventType.LOADED);
console.log(admob.AdEventType.OPENED);

console.log(firebase.admob.RewardedAdEventType.LOADED);
console.log(firebase.admob.RewardedAdEventType.EARNED_REWARD);
console.log(admob.RewardedAdEventType.LOADED);
console.log(admob.RewardedAdEventType.EARNED_REWARD);

console.log(firebase.admob.BannerAdSize.BANNER);
console.log(firebase.admob.BannerAdSize.FLUID);
console.log(firebase.admob.BannerAdSize.FULL_BANNER);
console.log(admob.BannerAd);
console.log(admob.BannerAdSize.BANNER);
console.log(admob.BannerAdSize.FLUID);
console.log(admob.BannerAdSize.FULL_BANNER);

console.log(firebase.admob.TestIds.BANNER);
console.log(firebase.admob.TestIds.INTERSTITIAL);
console.log(firebase.admob.TestIds.REWARDED);
console.log(admob.TestIds.BANNER);
console.log(admob.TestIds.INTERSTITIAL);
console.log(admob.TestIds.REWARDED);

// InterstitialAd
const interstitial = admob.InterstitialAd.createForAdRequest('foo', {
  keywords: ['test'],
});

console.log(interstitial.adUnitId);

interstitial.load();
interstitial.show().then();
interstitial.onAdEvent((type, error, data) => {
  console.log(type);
  console.log(error && error.message);
  console.log(data && data.amount);
  console.log(data && data.type);
});

admob.AdsConsent.addTestDevices(['1234']).then();
admob.AdsConsent.getAdProviders().then(providers => {
  providers[0].companyId;
  providers[0].companyName;
  providers[0].privacyPolicyUrl;
});
admob.AdsConsent.getStatus().then(status => console.log(status));
admob.AdsConsent.requestInfoUpdate(['123']).then(info =>
  console.log(info.isRequestLocationInEeaOrUnknown),
);
admob.AdsConsent.setTagForUnderAgeOfConsent(true).then();
admob.AdsConsent.showForm({
  privacyPolicy: '123',
  withAdFree: true,
  withPersonalizedAds: true,
  withNonPersonalizedAds: true,
}).then();

// RewardedAd
const rewardedAd = admob.RewardedAd.createForAdRequest('foo', {
  keywords: ['test'],
});

console.log(rewardedAd.adUnitId);

rewardedAd.load();
rewardedAd.show().then();
rewardedAd.onAdEvent((type, error, data) => {
  console.log(type);
  console.log(error && error.message);
  console.log(data && data.amount);
  console.log(data && data.type);
});

// checks module exists at root
console.log(firebase.admob().app.name);

// checks module exists at app level
console.log(firebase.app().admob().app.name);

// checks statics exist
console.log(firebase.admob.SDK_VERSION);

// checks statics exist on defaultExport
console.log(admob.default.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(admob.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.admob(firebase.app()).app.name);

// checks default export supports app arg
console.log(admob.default(firebase.app()).app.name);

// test banner sizes
console.log(firebase.admob.BannerAdSize.BANNER);
console.log(firebase.admob.BannerAdSize.FULL_BANNER);
console.log(firebase.admob.BannerAdSize.LARGE_BANNER);
console.log(firebase.admob.BannerAdSize.LEADERBOARD);
console.log(firebase.admob.BannerAdSize.MEDIUM_RECTANGLE);
console.log(firebase.admob.BannerAdSize.SMART_BANNER);
