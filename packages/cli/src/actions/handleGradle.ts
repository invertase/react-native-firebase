import { join } from 'path';
import * as gradle from '../helpers/gradle';
import log from '../helpers/log';

export function compilePluginList() {
  // Compile list of plugins to handle
  const packageInfo = require(join(process.cwd(), 'package.json'));
  const plugins: [string, string, 'start' | 'end'][] = [
    ['com.google.gms', 'google-services', 'end'],
  ];
  if (packageInfo.dependencies['@react-native-firebase/perf'])
    plugins.push(['com.google.firebase', 'perf-plugin', 'start']);
  return plugins;
}

export async function handleGradleDependency(
  namespace: string,
  plugin: string,
  androidBuildGradleFile: string,
) {
  const dependency = await gradle.getDependency(namespace, plugin, androidBuildGradleFile);
  const version = gradle.pluginVersions[namespace][plugin];

  if (dependency) {
    if (dependency.version == version) log.success(`${plugin} dependency already set.`);
    else {
      log.info(
        `${plugin} dependency version ${dependency.version} found instead of ${version}, updating "/android/build.gradle"...`,
      );
      androidBuildGradleFile = gradle.updatePluginVersion(
        namespace,
        plugin,
        dependency.version,
        androidBuildGradleFile,
      );
    }
  } else {
    // Update the file with the added dependency
    log.info(`${plugin} dependency not found, updating "/android/build.gradle"...`);
    androidBuildGradleFile = gradle.addDependency(namespace, plugin, androidBuildGradleFile);
  }

  return androidBuildGradleFile;
}

export async function handleGradlePlugin(
  namespace: string,
  plugin: string,
  position: 'start' | 'end',
  androidAppBuildGradleFile: string,
) {
  const registeredPlugin = gradle.getPlugin(namespace, plugin, androidAppBuildGradleFile);
  // Check whether plugin has been registered
  if (!registeredPlugin) {
    log.info(`${plugin} plugin has not been registered, updating "/android/app/build.gradle"`);
    androidAppBuildGradleFile = gradle.registerPlugin(
      namespace,
      plugin,
      position,
      androidAppBuildGradleFile,
    );
  } else {
    log.success(`${plugin} plugin already registered.`);
  }
  return androidAppBuildGradleFile;
}
