import {
  type AppDistribution,
  type AppDistributionRelease,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
  SDK_VERSION,
} from '.';

console.log(SDK_VERSION);

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

const modularAppDistribution = getAppDistribution();
console.log(modularAppDistribution.app.name);

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

const appDistributionInstance: AppDistribution = getAppDistribution();
console.log(appDistributionInstance.app.name);
