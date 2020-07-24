import Chalk from 'chalk';
import { Config } from '@react-native-community/cli-types';
import { getLoader } from '@react-native-community/cli/build/tools/loader';
import { join } from 'path';
import getAccount from '../actions/getAccount';
import file from '../helpers/file';
import { getAndroidConfig, getIosConfig } from '../actions/getConfig';
import prompt from '../helpers/prompt';
import firebase from '../helpers/firebase';
import { getAndroidApp } from '../actions/getApp';
import CliError from '../helpers/error';
import { ProjectDetail } from '../types/firebase';
import { getPluginList, getDependencyList } from '../actions/handleGradle';
import { GradleFile, pluginVersions } from '../helpers/gradle';
import validateGoogleServices from '../actions/validateGoogleServices';
import { Status, StatusGroup, FirebaseConfig, AppTypes, StatusItem } from '../types/cli';
import { getFirebaseConfigRequirements, validateField } from '../actions/handleFirebase';

const display = console.log; // eslint-disable-line no-console

function boolStatus(status: any, error: Status = Status.Error): Status {
  return status ? Status.Success : error;
}

function applyStatusColor(val: string, status: Status): string {
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

function getStatusSymbol(status: Status): string {
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

// returns true if version a > b
function compareVersion(a: string, b: string) {
  const va = a.split('.').map(i => +i),
    vb = b.split('.').map(i => +i);
  for (let i = 0; ; i++) {
    if (i == va.length) return false;
    if (i == vb.length) return true;

    if (va[i] > vb[i]) return true;
    if (va[i] < vb[i]) return false;
  }
}

export default async function doctorCommand(args: string[], reactNativeConfig: Config) {
  const androidProjectConfig = getAndroidConfig(reactNativeConfig);
  const iosProjectConfig = getIosConfig(reactNativeConfig);

  const account = await getAccount();
  const firebaseProject = await prompt.selectFirebaseProject(account);
  if (!firebaseProject)
    throw new CliError(
      `No Firebase projects exist for user ${Chalk.cyanBright(`[${account.user.email}].`)}`,
    );

  const projectDetail = await (firebase
    .api(account)
    .management.getProject(firebaseProject.projectId, {
      android: true,
      ios: true,
      web: false,
    }) as Promise<ProjectDetail>);

  const apps: { [type in AppTypes]: boolean } = {
    android: true,
    ios: false, // not implemented
    web: false, // not supported
  };

  const Loader = getLoader();
  const loader = new Loader();

  loader.start('Running diagnostics...');

  const report: StatusGroup = {};
  report['Common'] = {};

  const packageInfo = require(join(process.cwd(), 'package.json'));
  const rnfbPrefix = '@react-native-firebase/';

  report['Common']['RNFB Packages'] = {};
  for (const [pkg, version] of Object.entries(packageInfo.dependencies)) {
    if (!pkg.startsWith(rnfbPrefix)) continue;
    report['Common']['RNFB Packages'][pkg.substr(rnfbPrefix.length)] = [
      version as string,
      Status.Info,
    ];
  }

  // this script should not even be able to run without app, but who knows
  if (!report['Common']['RNFB Packages']['app'])
    report['Common']['RNFB Packages']['app'] = ['Not found', Status.Error];

  report['Common']['RN Packages'] = {
    react: [
      foundResult(packageInfo.dependencies['react']),
      packageInfo.dependencies['react'] ? Status.Info : Status.Error,
    ],
    'react-native': [
      foundResult(packageInfo.dependencies['react-native']),
      packageInfo.dependencies['react-native'] ? Status.Info : Status.Error,
    ],
  };

  report['Common']['firebase.json'] = {};
  const firebaseConfig = ((await file.readFirebaseConfig(reactNativeConfig)) ||
    {}) as FirebaseConfig;
  if (!firebaseConfig['react-native']) firebaseConfig['react-native'] = {};
  const rnfbConfig = firebaseConfig['react-native'];

  const configRequirements = getFirebaseConfigRequirements(reactNativeConfig, apps);

  for (const [key, test] of configRequirements) {
    let reportEntry: StatusItem;
    if (key instanceof Array) {
      if (!key.some(k => rnfbConfig[k])) reportEntry = ['Not found', Status.Error];
      else if (
        !validateField(
          key.map(key => rnfbConfig[key]),
          test,
        )
      )
        reportEntry = ['Invalid configuration', Status.Warning];
      else reportEntry = [null, Status.Success];
      report['Common']['firebase.json'][key.join(', ')] = reportEntry;
    } else {
      if (rnfbConfig[key] === undefined) reportEntry = ['Not found', Status.Error];
      else if (!validateField(rnfbConfig[key], test))
        reportEntry = ['Invalid configuration', Status.Warning];
      else reportEntry = [null, Status.Success];
      report['Common']['firebase.json'][key] = reportEntry;
    }
  }

  if (apps.android) {
    report['Android'] = {};

    const androidApp = getAndroidApp(projectDetail, androidProjectConfig.packageName);
    report['Android']['Firebase app'] = [
      androidApp ? androidApp.name : 'Not found',
      boolStatus(androidApp),
    ];

    const androidGoogleServicesFile = await file.readAndroidGoogleServices(androidProjectConfig);
    if (androidGoogleServicesFile) {
      if (androidApp) {
        const validationError = validateGoogleServices(
          androidGoogleServicesFile,
          projectDetail,
          androidApp,
        );
        report['Android']['google-services.json'] = [
          validationError || null,
          boolStatus(!validationError),
        ];
      } else {
        report['Android']['google-services.json'] = ['Unable to validate', Status.Warning];
      }
    } else report['Android']['google-services.json'] = ['Not found', Status.Error];

    const androidBuildGradleFile = await file.readAndroidBuildGradle(androidProjectConfig);
    if (androidBuildGradleFile) {
      const gradleFile = new GradleFile(androidBuildGradleFile);
      const dependencies = getDependencyList(reactNativeConfig);
      const dependencyReport: StatusGroup = {};
      try {
        for (const dep of dependencies) {
          const version = pluginVersions[dep[0]][dep[1]];
          const dependency = await gradleFile.getDependency(dep[0], dep[1]);
          dependencyReport[dep[1]] = [
            dependency ? `${dependency.version} >= ${version}` : 'Not configured',
            dependency
              ? boolStatus(!compareVersion(version, dependency.version), Status.Warning)
              : Status.Error,
          ];
        }
        report['Android']['build.gradle'] = { Dependencies: dependencyReport };
      } catch (e) {
        if (e instanceof CliError) {
          report['Android']['build.gradle'] = ['Invalid format', Status.Error];
        } else throw e;
      }
    } else report['Android']['build.gradle'] = ['Not found', Status.Error];

    const androidAppBuildGradleFile = await file.readAndroidAppBuildGradle(androidProjectConfig);
    if (androidAppBuildGradleFile) {
      const pluginReport: StatusGroup = {};
      const plugins = getPluginList(reactNativeConfig);
      const gradleFile = new GradleFile(androidAppBuildGradleFile);
      try {
        for (const plugin of plugins) {
          const result = gradleFile.verifyPlugin(...plugin);
          if (result === null) pluginReport[plugin[1]] = ['Not Found', Status.Error];
          else
            pluginReport[plugin[1]] = [
              result ? null : `not applied at ${plugin[2]}`,
              boolStatus(result, Status.Warning),
            ];
        }
        report['Android']['App build.gradle'] = { Plugins: pluginReport };
      } catch (e) {
        if (e instanceof CliError) {
          report['Android']['App build.gradle'] = ['Invalid format', Status.Error];
        } else throw e;
      }
    } else report['Android']['App build.gradle'] = ['Not found', Status.Error];
  }

  if (apps.ios) {
    report['iOS'] = {};

    const iosGoogleServicesFile = await file.readIosGoogleServices(iosProjectConfig);
    report['iOS']['GoogleService-Info.plist'] = [null, boolStatus(iosGoogleServicesFile)];
  }

  loader.stop();

  function getGroupStatus(checks: StatusGroup) {
    const statusList: Status[] = [];

    function statusRecursive(checks: StatusGroup) {
      for (const item of Object.values(checks)) {
        if (Array.isArray(item)) statusList.push(item[1]);
        else statusRecursive(item);
      }
    }

    statusRecursive(checks);

    const status = statusList.reduce((a, b) => (a > b ? a : b), Status.Info);
    return status;
  }

  function displayReportRecursive(checks: StatusGroup, depth = 0) {
    const indent = '  '.repeat(depth);
    for (const [name, value] of Object.entries(checks)) {
      if (Array.isArray(value)) {
        const [result, status] = value;

        if (result) {
          display(`${indent} - ${name}: ${applyStatusColor(result, status)}`);
        } else {
          display(`${indent}${getStatusSymbol(status)}${name}`);
        }
      } else {
        const status = getGroupStatus(value);
        if (depth) display(`${indent} - ${name}`);
        else display(`${indent}${getStatusSymbol(status)}${name}`);
        displayReportRecursive(value, depth + 1);
      }
      if (!depth) display('');
    }
  }
  displayReportRecursive(report);
}
