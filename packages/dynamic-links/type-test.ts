import firebase from '@react-native-firebase/app';
import * as dynamicLinks from '@react-native-firebase/dynamic-links';

console.log(dynamicLinks.default().getInitialLink);

// checks module exists at root
console.log(firebase.dynamicLinks().app.name);

// checks module exists at app level
console.log(firebase.app().dynamicLinks().app.name);

// checks statics exist
console.log(firebase.dynamicLinks.SDK_VERSION);

// checks statics exist on defaultExport
console.log(dynamicLinks.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(dynamicLinks.firebase.SDK_VERSION);

// checks multi-app support exists
// console.log(firebase.links(firebase.app()).app.name);

// checks default export supports app arg
// console.log(defaultExport(firebase.app()).app.name);

console.log(firebase.dynamicLinks().getInitialLink());
console.log(
  firebase.dynamicLinks().buildLink({
    link: 'foo',
    domainUriPrefix: 'foo',
    analytics: {
      campaign: 'foo',
    },
  }),
);

console.log(firebase.dynamicLinks.ShortLinkType.SHORT);
