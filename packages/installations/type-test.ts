import installations, {
  firebase,
  getInstallations,
  deleteInstallations,
  getId,
  getToken,
  onIdChange,
} from '.';

console.log(installations().app);

// checks module exists at root
console.log(firebase.installations().app.name);

// checks module exists at app level
console.log(firebase.app().installations().app.name);

// checks statics exist
console.log(firebase.installations.SDK_VERSION);

// checks statics exist on defaultExport
console.log(installations.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.installations(firebase.app()).app.name);
console.log(firebase.installations(firebase.app('foo')).app.name);

// checks default export supports app arg
console.log(installations(firebase.app()).app.name);
console.log(installations(firebase.app('foo')).app.name);

// checks Module instance APIs
const installationsInstance = firebase.installations();
console.log(installationsInstance.app.name);

installationsInstance.getId().then((id: string) => {
  console.log(id);
});

installationsInstance.getToken().then((token: string) => {
  console.log(token);
});

installationsInstance.getToken(true).then((token: string) => {
  console.log(token);
});

installationsInstance.delete().then(() => {
  console.log('Installation deleted');
});

// checks modular API functions
const modularInstallations1 = getInstallations();
console.log(modularInstallations1.app.name);

const modularInstallations2 = getInstallations(firebase.app());
console.log(modularInstallations2.app.name);

const modularInstallations3 = getInstallations(firebase.app('foo'));
console.log(modularInstallations3.app.name);

getId(modularInstallations1).then((id: string) => {
  console.log(id);
});

getToken(modularInstallations1).then((token: string) => {
  console.log(token);
});

getToken(modularInstallations1, true).then((token: string) => {
  console.log(token);
});

deleteInstallations(modularInstallations1).then(() => {
  console.log('Modular installation deleted');
});

// Note: onIdChange throws an error in React Native Firebase
try {
  onIdChange(modularInstallations1, (id: string) => {
    console.log(id);
  });
} catch (error) {
  console.log('Modular onIdChange not supported');
}
