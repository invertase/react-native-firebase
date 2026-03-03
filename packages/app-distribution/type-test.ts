import appDistribution, {
  firebase,
  FirebaseAppDistributionTypes,
  getAppDistribution,
  isTesterSignedIn,
  signInTester,
  checkForUpdate,
  signOutTester,
} from '.';

console.log(appDistribution().app);

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

// checks Module instance APIs
const appDistributionInstance = firebase.appDistribution() as unknown as FirebaseAppDistributionTypes.Module;
console.log(appDistributionInstance.app.name);
appDistributionInstance.isTesterSignedIn().then((v: boolean) => console.log(v));
appDistributionInstance.signInTester().then(() => {});
appDistributionInstance.checkForUpdate().then((r: FirebaseAppDistributionTypes.AppDistributionRelease) => {
  console.log(r.displayVersion, r.buildVersion);
});
appDistributionInstance.signOutTester().then(() => {});

// checks modular API functions
const modularAppDist = getAppDistribution();
console.log(modularAppDist.app.name);

const modularAppDistWithApp = getAppDistribution(firebase.app());
console.log(modularAppDistWithApp.app.name);

isTesterSignedIn(modularAppDist).then((v: boolean) => console.log(v));
signInTester(modularAppDist).then(() => {});
checkForUpdate(modularAppDist).then(release => {
  console.log(release.displayVersion, release.buildVersion, release.downloadURL);
});
signOutTester(modularAppDist).then(() => {});
