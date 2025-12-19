import functions, {
  firebase,
  FirebaseFunctionsTypes,
  // Types
  type HttpsCallableOptions,
  type HttpsCallable,
  type HttpsCallableResult,
  type Functions,
  // Modular API
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  httpsCallableFromUrl,
} from '.';

console.log(functions().app);

// checks module exists at root
console.log(firebase.functions().app.name);

// checks module exists at app level
console.log(firebase.app().functions().app.name);

// app level module accepts string arg
console.log(firebase.app().functions('some-string').app.name);
console.log(firebase.app().functions('some-string').httpsCallable('foo'));

// checks statics exist
console.log(firebase.functions.SDK_VERSION);

// checks statics exist on defaultExport
console.log(functions.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.functions(firebase.app()).app.name);

// checks default export supports app arg
console.log(firebase.functions(firebase.app('foo')).app.name);

console.log(firebase.functions.HttpsErrorCode.ABORTED);

// test type usage
const functionsInstance: Functions = firebase.functions();
console.log(functionsInstance.app.name);
const callableOptions: HttpsCallableOptions = { timeout: 5000 };
console.log(callableOptions.timeout);
const callable: HttpsCallable<string, number> = firebase.functions().httpsCallable('test');
callable('test').then((result: HttpsCallableResult<number>) => {
  console.log('callable result:', result.data);
});
const callableResult: HttpsCallableResult<number> = { data: 123 };
console.log(callableResult.data);

// test method calls with proper types
firebase
  .functions()
  .httpsCallable('foo')(123)
  .then((result: FirebaseFunctionsTypes.HttpsCallableResult) => {
    console.log(result.data);
  })
  .catch((error: { code: any; details: any }) => {
    console.log(error.code);
    console.log(error.details);
  });

firebase.functions().useFunctionsEmulator('http://localhost:5001');

// checks all methods exist on firebase.functions()
console.log(firebase.functions().httpsCallable);
console.log(firebase.functions().httpsCallableFromUrl);
console.log(firebase.functions().useFunctionsEmulator);
console.log(firebase.functions().useEmulator);

// checks all methods exist on default export
console.log(functions().httpsCallable);
console.log(functions().httpsCallableFromUrl);
console.log(functions().useFunctionsEmulator);
console.log(functions().useEmulator);

// test method calls with missing methods
firebase
  .functions()
  .httpsCallableFromUrl('https://example.com/callable')('data')
  .then((result: HttpsCallableResult) => {
    console.log('httpsCallableFromUrl result:', result.data);
  })
  .catch((error: { code: any; details: any }) => {
    console.log(error.code);
    console.log(error.details);
  });

firebase.functions().useEmulator('localhost', 5001);

// test modular API functions
const functionsModular = getFunctions();
const functionsModularWithApp = getFunctions(firebase.app());
const functionsModularWithRegion = getFunctions(firebase.app(), 'us-central1');
console.log(functionsModularWithApp.app.name);
console.log(functionsModularWithRegion.app.name);

connectFunctionsEmulator(functionsModular, 'localhost', 5001);

const modularCallable = httpsCallable<string, number>(functionsModular, 'test', { timeout: 5000 });
modularCallable('data')
  .then((result: HttpsCallableResult<number>) => {
    console.log('modular httpsCallable result:', result.data);
  })
  .catch((error: { code: any; details: any }) => {
    console.log(error.code);
    console.log(error.details);
  });

const modularCallableFromUrl = httpsCallableFromUrl<string, number>(
  functionsModular,
  'https://example.com/callable',
  { timeout: 5000 },
);
modularCallableFromUrl('data')
  .then((result: HttpsCallableResult<number>) => {
    console.log('modular httpsCallableFromUrl result:', result.data);
  })
  .catch((error: { code: any; details: any }) => {
    console.log(error.code);
    console.log(error.details);
  });

// test FirebaseFunctionsTypes namespace
const namespaceResult: FirebaseFunctionsTypes.HttpsCallableResult<string> = { data: 'test' };
console.log(namespaceResult.data);
const namespaceCallable: FirebaseFunctionsTypes.HttpsCallable<string, number> = firebase
  .functions()
  .httpsCallable('test');
namespaceCallable('test').then((result: FirebaseFunctionsTypes.HttpsCallableResult<number>) => {
  console.log('namespaceCallable result:', result.data);
});
const namespaceOptions: FirebaseFunctionsTypes.HttpsCallableOptions = { timeout: 5000 };
console.log(namespaceOptions.timeout);
const namespaceErrorCode: FirebaseFunctionsTypes.ErrorCode = 'ok';
console.log(namespaceErrorCode);
const namespaceErrorCodeMap: FirebaseFunctionsTypes.ErrorCodeMap =
  firebase.functions.HttpsErrorCode;
console.log(namespaceErrorCodeMap.ABORTED);
