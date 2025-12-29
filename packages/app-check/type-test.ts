import appCheck, {
  firebase,
  FirebaseAppCheckTypes,
  initializeAppCheck,
  getToken,
  getLimitedUseToken,
  setTokenAutoRefreshEnabled,
  onTokenChanged,
  CustomProvider,
  ReactNativeFirebaseAppCheckProvider,
} from '.';

console.log(appCheck().app);

// checks module exists at root
console.log(firebase.appCheck().app.name);

// checks module exists at app level
console.log(firebase.app().appCheck().app.name);

// checks statics exist
console.log(firebase.appCheck.SDK_VERSION);

// checks statics exist on defaultExport
console.log(appCheck.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.appCheck(firebase.app()).app.name);

// checks default export supports app arg
console.log(appCheck(firebase.app()).app.name);

// checks CustomProvider static exists
console.log(firebase.appCheck.CustomProvider);

// checks Module instance APIs
const appCheckInstance = firebase.appCheck();
console.log(appCheckInstance.newReactNativeFirebaseAppCheckProvider());

const provider = appCheckInstance.newReactNativeFirebaseAppCheckProvider();
provider.configure({
  android: { provider: 'playIntegrity' },
  apple: { provider: 'deviceCheck' },
  web: { provider: 'reCaptchaV3', siteKey: 'test' },
});

appCheckInstance
  .initializeAppCheck({
    provider: provider,
    isTokenAutoRefreshEnabled: true,
  })
  .then(() => {
    console.log('Initialized');
  });

appCheckInstance.activate('test', true).then(() => {
  console.log('Activated');
});

appCheckInstance.setTokenAutoRefreshEnabled(true);

appCheckInstance.getToken().then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

appCheckInstance.getToken(true).then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

appCheckInstance.getLimitedUseToken().then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

const unsubscribe1 = appCheckInstance.onTokenChanged({
  next: (tokenResult: FirebaseAppCheckTypes.AppCheckListenerResult) => {
    console.log(tokenResult.token);
    console.log(tokenResult.appName);
  },
  error: (error: Error) => {
    console.log(error.message);
  },
  complete: () => {
    console.log('Complete');
  },
});

const unsubscribe2 = appCheckInstance.onTokenChanged(
  (tokenResult: FirebaseAppCheckTypes.AppCheckListenerResult) => {
    console.log(tokenResult.token);
    console.log(tokenResult.appName);
  },
  (error: Error) => {
    console.log(error.message);
  },
  () => {
    console.log('Complete');
  },
);

unsubscribe1();
unsubscribe2();

// checks modular API functions
const modularProvider = appCheckInstance.newReactNativeFirebaseAppCheckProvider();
modularProvider.configure({
  android: { provider: 'playIntegrity' },
  apple: { provider: 'deviceCheck' },
  web: { provider: 'reCaptchaV3', siteKey: 'test' },
});

initializeAppCheck(firebase.app(), {
  provider: modularProvider,
  isTokenAutoRefreshEnabled: true,
}).then((appCheckModular: FirebaseAppCheckTypes.Module) => {
  console.log(appCheckModular.app.name);
});

initializeAppCheck(undefined, {
  provider: modularProvider,
  isTokenAutoRefreshEnabled: true,
}).then((appCheckModular: FirebaseAppCheckTypes.Module) => {
  console.log(appCheckModular.app.name);
});

getToken(appCheckInstance).then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

getToken(appCheckInstance, true).then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

getLimitedUseToken(appCheckInstance).then((result: FirebaseAppCheckTypes.AppCheckTokenResult) => {
  console.log(result.token);
});

setTokenAutoRefreshEnabled(appCheckInstance, true);

const modularUnsubscribe1 = onTokenChanged(appCheckInstance, {
  next: (tokenResult: FirebaseAppCheckTypes.AppCheckTokenResult) => {
    console.log(tokenResult.token);
  },
  error: (error: Error) => {
    console.log(error.message);
  },
  complete: () => {
    console.log('Complete');
  },
});

const modularUnsubscribe2 = onTokenChanged(
  appCheckInstance,
  (tokenResult: FirebaseAppCheckTypes.AppCheckListenerResult) => {
    console.log(tokenResult.token);
    console.log(tokenResult.appName);
  },
  (error: Error) => {
    console.log(error.message);
  },
  () => {
    console.log('Complete');
  },
);

modularUnsubscribe1();
modularUnsubscribe2();

// checks modular CustomProvider class
const customProvider = new CustomProvider({
  getToken: async () => {
    return {
      token: 'test-token',
      expireTimeMillis: Date.now() + 3600000,
    };
  },
});

// CustomProvider can be used in AppCheckOptions
initializeAppCheck(firebase.app(), {
  provider: customProvider,
  isTokenAutoRefreshEnabled: true,
}).then(() => {
  console.log('CustomProvider initialized');
});

// checks modular ReactNativeFirebaseAppCheckProvider class can be instantiated directly from modular import
const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
// Test that configure method exists and can be called (reusing modularProvider for initializeAppCheck above)
rnfbProvider.configure({
  android: { provider: 'playIntegrity' },
  apple: { provider: 'deviceCheck' },
  web: { provider: 'reCaptchaV3', siteKey: 'test' },
});
