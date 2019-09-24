import firebase from '@react-native-firebase/app';
import * as language from '@react-native-firebase/ml-natural-language';

// checks module exists at root
console.log(firebase.naturalLanguage().app.name);

// checks module exists at app level
console.log(firebase.app().naturalLanguage().app.name);

// checks statics exist
console.log(firebase.naturalLanguage.SDK_VERSION);

// checks statics exist on defaultExport
console.log(firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks firebase named export exists on module
console.log(language.firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.naturalLanguage(firebase.app()).app.name);

firebase
  .naturalLanguage()
  .identifyLanguage('foo', {
    confidenceThreshold: 0.3,
  })
  .then(str => str.replace);

firebase
  .naturalLanguage()
  .identifyPossibleLanguages('foo', {
    confidenceThreshold: 0.3,
  })
  .then(languages => languages.forEach($ => $.confidence));

firebase
  .naturalLanguage()
  .suggestReplies([
    {
      text: 'foo',
      isLocalUser: true,
      userId: '123',
      timestamp: 123,
    },
  ])
  .then(replies => {
    replies.forEach($ => $.text);
  });
