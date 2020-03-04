module.exports = async function firebaseCli(args, reactNativeConfig) {
  let account = require('./helpers/firebase').auth.getAccount();
  if (!account) {
    await require('./helpers/firebase').auth.authWithBrowser();
    account = require('./helpers/firebase').auth.getAccount();
  }
  await require('./helpers/prompt').selectFirebaseAccount();

  const api = require('./helpers/firebase').api(account);
  const selectedProject = await require('./helpers/prompt').selectFirebaseProject();
  const projectDetail = await api.management.getProject(selectedProject.projectId);

  // console.log('\nRegistered Applications:\n');
  // projectDetail.apps.apps
  //   .map(app => `${app.appId} (${app.platform})`)
  //   .forEach(app => console.log(app));

  const androidProjectConfig = reactNativeConfig.platforms.android.projectConfig(
    reactNativeConfig.root,
  );

  const iosProjectConfig = reactNativeConfig.platforms.ios.projectConfig(reactNativeConfig.root);

  console.dir(androidProjectConfig);
  console.dir(projectDetail.apps);
};
