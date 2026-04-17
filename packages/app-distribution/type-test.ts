import appDistribution, {
  firebase,
  FirebaseAppDistributionTypes,
  type AppDistribution,
  type AppDistributionRelease,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
} from '.';

console.log(appDistribution().app.name);

// checks module exists at root
console.log(firebase.appDistribution().app.name);

// checks module exists at app level
console.log(firebase.app().appDistribution().app.name);

// checks statics exist
console.log(firebase.appDistribution.SDK_VERSION);

// checks statics exist on defaultExport
console.log(appDistribution.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.appDistribution(firebase.app()).app.name);

// checks default export supports app arg
console.log(appDistribution(firebase.app()).app.name);

const appDistributionInstance: AppDistribution = firebase.appDistribution();
console.log(appDistributionInstance.app.name);
console.log(appDistributionInstance.isTesterSignedIn);
console.log(appDistributionInstance.signInTester);
console.log(appDistributionInstance.checkForUpdate);
console.log(appDistributionInstance.signOutTester);

const sampleRelease: AppDistributionRelease = {
  displayVersion: '1.0.0',
  buildVersion: '1',
  releaseNotes: null,
  downloadURL: 'https://example.com/app',
  isExpired: false,
};
console.log(sampleRelease.displayVersion);
console.log(sampleRelease.buildVersion);
console.log(sampleRelease.releaseNotes);
console.log(sampleRelease.downloadURL);
console.log(sampleRelease.isExpired);

appDistributionInstance.isTesterSignedIn().then((signedIn: boolean) => {
  console.log(signedIn);
});
appDistributionInstance.signInTester().then(() => {
  console.log('signed in');
});
appDistributionInstance.checkForUpdate().then((release: AppDistributionRelease) => {
  console.log(release.displayVersion);
});
appDistributionInstance.signOutTester().then(() => {
  console.log('signed out');
});

const modularAppDistribution = getAppDistribution();
const modularAppDistributionWithApp = getAppDistribution(firebase.app());
console.log(modularAppDistribution.app.name);
console.log(modularAppDistributionWithApp.app.name);

isTesterSignedIn(modularAppDistribution).then((signedIn: boolean) => {
  console.log(signedIn);
});
signInTester(modularAppDistribution).then(() => {
  console.log('signed in via modular');
});
checkForUpdate(modularAppDistribution).then((release: AppDistributionRelease) => {
  console.log(release.buildVersion);
});
signOutTester(modularAppDistribution).then(() => {
  console.log('signed out via modular');
});

const namespaceInstance: FirebaseAppDistributionTypes.Module = firebase.appDistribution();
const namespaceRelease: FirebaseAppDistributionTypes.AppDistributionRelease = sampleRelease;
const namespaceStatics: FirebaseAppDistributionTypes.Statics = firebase.appDistribution;
console.log(namespaceInstance.app.name);
console.log(namespaceRelease.downloadURL);
console.log(namespaceStatics.SDK_VERSION);
