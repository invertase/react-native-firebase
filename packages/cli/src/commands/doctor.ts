import Chalk from 'chalk';
import { Config } from '@react-native-community/cli-types';
import getAccount from '../actions/getAccount';
import file from '../helpers/file';
import getConfig from '../actions/getConfig';
import prompt from '../helpers/prompt';
import firebase from '../helpers/firebase';
import { getAndroidApp } from '../actions/getApp';
import CliError from '../helpers/error';
import { getGoogleServicesDependency, getGoogleServicesPlugin } from '../helpers/gradle';

const GOOGLE_SERVICES_PLUGIN_VERSION = '4.2.0';

function validateStyle(val: string, success: boolean): string {
  if (success) return Chalk.green(val);
  return Chalk.red(val);
}

function validateSymbol(success: boolean): string {
  if (success) return Chalk.green('✓');
  return Chalk.red('✖');
}

function foundResult(success: any): string {
  return success ? 'found' : 'not found';
}

export default async function doctorCommand(args: string[], reactNativeConfig: Config) {
  const [androidProjectConfig, iosProjectConfig] = getConfig(reactNativeConfig);

  const account = await getAccount();
  var firebaseProject = await prompt.selectFirebaseProject(account);
  if (!firebaseProject)
    throw new CliError(
      `No Firebase projects exist for user ${Chalk.cyanBright(`[${account.user.email}].`)}`,
    );

  const projectDetail = await firebase
    .api(account)
    .management.getProject(firebaseProject.projectId, { android: true, ios: true, web: false });

  var androidApp = getAndroidApp(projectDetail, androidProjectConfig.packageName);

  const checks: { [key: string]: [string, string, boolean][] } = {
    Android: [],
    iOS: [],
  };

  checks['Android'].push([
    `Package '${androidProjectConfig.packageName}'`,
    foundResult(androidApp),
    !!androidApp,
  ]);

  const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);

  checks['Android'].push([
    `google-services.json`,
    foundResult(androidGoogleServicesFile),
    !!androidGoogleServicesFile,
  ]);

  const androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);
  checks['Android'].push([
    `build.gradle`,
    foundResult(androidGoogleServicesFile),
    !!androidBuildGradleFile,
  ]);
  if (androidBuildGradleFile) {
    const dependency = await getGoogleServicesDependency(androidBuildGradleFile);
    checks['Android'].push([
      `Google Services Dependency`,
      dependency ? dependency.version : 'not configured',
      !!dependency && dependency.version == GOOGLE_SERVICES_PLUGIN_VERSION,
    ]);
  }

  const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);
  checks['Android'].push([
    `App build.gradle`,
    foundResult(androidBuildGradleFile),
    !!androidAppBuildGradleFile,
  ]);
  if (androidAppBuildGradleFile) {
    const googleServicePlugin = getGoogleServicesPlugin(androidAppBuildGradleFile);
    checks['Android'].push([
      `Google Services Plugin`,
      googleServicePlugin ? 'configured' : 'not configured',
      !!androidBuildGradleFile,
    ]);
  }

  const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
  checks['iOS'].push([
    `GoogleService-Info.plist`,
    foundResult(iosGoogleServicesFile),
    !!iosGoogleServicesFile,
  ]);

  for (let [category, items] of Object.entries(checks)) {
    const pass = items.every(item => item[2]);
    console.log(`\n${validateSymbol(pass)} ${category}`);
    for (let item of items) {
      console.log(` - ${item[0]}: ${validateStyle(item[1], item[2])}`);
    }
  }
}
