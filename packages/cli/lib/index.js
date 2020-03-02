module.exports = async function firebaseCli(args, reactNativeConfig) {
  // uncomment to sign-in
  // require('./helpers/firebase').auth.authWithBrowser();

  const account = require('./helpers/firebase').auth.getAccount();
  const api = require('./helpers/firebase').api(account);

  // const firebaseProjects = await api.management.getProjects();
  const testingProject = await api.management.getProject('react-native-firebase-testing');

  console.dir(testingProject);
  console.dir(testingProject.apps);
};
