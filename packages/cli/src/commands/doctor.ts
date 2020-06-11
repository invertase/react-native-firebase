import Chalk from 'chalk';
import { Config } from '@react-native-community/cli-types';
import { getLoader } from '@react-native-community/cli/build/tools/loader';
import { join } from 'path';
import getAccount from '../actions/getAccount';
import file from '../helpers/file';
import getConfig from '../actions/getConfig';
import prompt from '../helpers/prompt';
import firebase from '../helpers/firebase';
import { getAndroidApp } from '../actions/getApp';
import CliError from '../helpers/error';
import { getGoogleServicesDependency, getGoogleServicesPlugin } from '../helpers/gradle';

const GOOGLE_SERVICES_PLUGIN_VERSION = '4.2.0';

const display = console.log; // eslint-disable-line no-console

// sorted ASC by severity
enum Status {
  Info,
  Success,
  Warning,
  Error,
}

function boolStatus(status: any, error: Status = Status.Error): Status {
  return status ? Status.Success : error;
}

function validateStyle(val: string, status: Status): string {
  switch (status) {
    case Status.Info:
      return Chalk.blue(val);
    case Status.Success:
      return Chalk.green(val);
    case Status.Warning:
      return Chalk.yellow(val);
    case Status.Error:
      return Chalk.red(val);
  }
}

function validateSymbol(status: Status): string {
  switch (status) {
    case Status.Success:
      return Chalk.green(' ✓ ');
    case Status.Error:
      return Chalk.red(' ✖ ');
    case Status.Warning:
      return Chalk.yellow(' ● ');
    case Status.Info:
      return ' - ';
  }
}

function foundResult(condition: any): string {
  return condition ? condition.toString() : 'Not found';
}

export default async function doctorCommand(args: string[], reactNativeConfig: Config) {
  const [androidProjectConfig, iosProjectConfig] = getConfig(reactNativeConfig);

  const account = await getAccount();
  const firebaseProject = await prompt.selectFirebaseProject(account);
  if (!firebaseProject)
    throw new CliError(
      `No Firebase projects exist for user ${Chalk.cyanBright(`[${account.user.email}].`)}`,
    );

  const projectDetail = await firebase
    .api(account)
    .management.getProject(firebaseProject.projectId, { android: true, ios: true, web: false });

  const Loader = getLoader();
  const loader = new Loader();

  loader.start('Running diagnostics...');

  type CheckItem = [string | null, Status];
  interface CheckGroup {
    [key: string]: CheckGroup | CheckItem;
  }

  const checks: CheckGroup = {};

  const packageInfo = require(join(process.cwd(), 'package.json'));
  const rnfbPackages: CheckGroup = {};
  const rnPackages: CheckGroup = {};
  const rnfbPrefix = '@react-native-firebase/';

  for (const [pkg, version] of Object.entries(packageInfo.dependencies)) {
    if (!pkg.startsWith(rnfbPrefix)) continue;
    rnfbPackages[pkg.substr(rnfbPrefix.length)] = [version as string, Status.Info];
  }

  // this script should not even be able to run without app, but who knows
  if (!rnfbPackages['app']) rnfbPackages['app'] = ['Not found', Status.Error];

  rnPackages['react-native'] = {
    react: [
      foundResult(packageInfo.dependencies['react']),
      packageInfo.dependencies['react'] ? Status.Info : Status.Error,
    ],
    'react-native': [
      foundResult(packageInfo.dependencies['react-native']),
      packageInfo.dependencies['react-native'] ? Status.Info : Status.Error,
    ],
  };

  checks['Common'] = {
    'RNFB Packages': rnfbPackages,
    'React-Native Packages': rnPackages,
  };

  const androidApp = getAndroidApp(projectDetail, androidProjectConfig.packageName);
  checks['Android'] = {};

  checks['Android'][`Firebase app`] = [
    androidApp ? androidApp.name : 'Not found',
    boolStatus(androidApp),
  ];

  const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);

  checks['Android'][`google-services.json`] = [null, boolStatus(androidGoogleServicesFile)];

  const androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);
  checks['Android'][`build.gradle`] = {};
  checks['Android'][`build.gradle`]['File'] = [
    androidGoogleServicesFile ? androidProjectConfig.buildGradlePath : 'Not found',
    boolStatus(androidBuildGradleFile),
  ];

  if (androidBuildGradleFile) {
    const dependency = await getGoogleServicesDependency(androidBuildGradleFile);
    checks['Android'][`build.gradle`][`Google Services Dependency`] = [
      dependency ? dependency.version : 'Not configured',
      dependency
        ? boolStatus(dependency.version == GOOGLE_SERVICES_PLUGIN_VERSION, Status.Warning)
        : Status.Error,
    ];
  }

  const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);
  checks['Android'][`App build.gradle`] = {};
  checks['Android'][`App build.gradle`]['File'] = [
    androidBuildGradleFile
      ? join(androidProjectConfig.sourceDir, 'app', 'build.gradle')
      : 'Not found',
    boolStatus(androidAppBuildGradleFile),
  ];
  if (androidAppBuildGradleFile) {
    const googleServicePlugin = getGoogleServicesPlugin(androidAppBuildGradleFile);
    checks['Android'][`App build.gradle`][`Google Services Plugin`] = [
      googleServicePlugin ? 'configured' : 'Not configured',
      boolStatus(androidBuildGradleFile),
    ];
  }

  checks['iOS'] = {};
  const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
  checks['iOS'][`GoogleService-Info.plist`] = [null, boolStatus(iosGoogleServicesFile)];

  loader.stop();

  function groupStatus(checks: CheckGroup) {
    const statusList: Status[] = [];

    function statusRecursive(checks: CheckGroup) {
      for (const item of Object.values(checks)) {
        if (Array.isArray(item)) statusList.push(item[1]);
        else statusRecursive(item);
      }
    }

    statusRecursive(checks);

    const status = statusList.reduce((a, b) => (a > b ? a : b), Status.Info);
    return status;
  }

  function displayChecksRecursive(checks: CheckGroup, depth = 0) {
    const indent = '  '.repeat(depth);
    for (const [name, value] of Object.entries(checks)) {
      if (Array.isArray(value)) {
        const [result, status] = value;

        if (result) {
          display(`${indent} - ${name}: ${validateStyle(result, status)}`);
        } else {
          display(`${indent}${validateSymbol(status)}${name}`);
        }
      } else {
        const status = groupStatus(value);
        display(`${indent}${validateSymbol(status)}${name}`);
        displayChecksRecursive(value, depth + 1);
      }
      if (!depth) display('');
    }
  }
  displayChecksRecursive(checks);
}
