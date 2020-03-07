export default [
  {
    name: 'firebase',
    options: [
      {
        name: 'platform',
        description: 'Run the init script for a specific platform, e.g. android or ios.',
        default: '',
      },
    ],
    func: firebaseCli,
  },
];

async function firebaseCli(args: string, reactNativeConfig: object) {
  const [command, ...cmdArgs] = args;

  switch (command) {
    case 'init':
      await require('./commands/init')(cmdArgs, reactNativeConfig);
      break;
    case 'doctor':
      await require('./commands/doctor')(cmdArgs, reactNativeConfig);
      break;
    case 'playground':
      await require('./commands/playground')(cmdArgs, reactNativeConfig);
      break;
    default:
      console.log('No command found - show help');
  }
}

//
//   process.exit();

//
//   let account = require('./helpers/firebase').auth.getAccount();
//   if (!account) {
//     await require('./helpers/firebase').auth.authWithBrowser();
//     account = require('./helpers/firebase').auth.getAccount();
//   }
//   await require('./helpers/prompt').selectFirebaseAccount();
//
//   const api = require('./helpers/firebase').api(account);
//   const selectedProject = await require('./helpers/prompt').selectFirebaseProject();
//   const projectDetail = await api.management.getProject(selectedProject.projectId);
//
//   // console.log('\nRegistered Applications:\n');
//   // projectDetail.apps.apps
//   //   .map(app => `${app.appId} (${app.platform})`)
//   //   .forEach(app => console.log(app));
//
//   const androidProjectConfig = reactNativeConfig.platforms.android.projectConfig(
//     reactNativeConfig.root,
//   );
//
//   const iosProjectConfig = reactNativeConfig.platforms.ios.projectConfig(reactNativeConfig.root);
//
//   console.dir(androidProjectConfig);
//   console.dir(projectDetail.apps);
// };
