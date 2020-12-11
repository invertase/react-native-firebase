import { Config } from '@react-native-community/cli-types';
import { GradleFile, pluginVersions } from '../helpers/gradle';
import log from '../helpers/log';

// Compile list of applied plugins to process
export function getPluginList(reactNativeConfig: Config) {
    const plugins: [string, string, 'top' | 'bottom'][] = [
        ['com.google.gms', 'google-services', 'bottom'],
    ];
    if (reactNativeConfig.dependencies['@react-native-firebase/perf'])
        plugins.push(['com.google.firebase', 'firebase-perf', 'top']);
    return plugins;
}

// Compile list of dependencies to process
export function getDependencyList(reactNativeConfig: Config) {
    const dependencies: [string, string][] = [['com.google.gms', 'google-services']];
    if (reactNativeConfig.dependencies['@react-native-firebase/perf'])
        dependencies.push(['com.google.firebase', 'perf-plugin']);
    return dependencies;
}

export async function handleGradleDependency(
    namespace: string,
    plugin: string,
    gradleFile: GradleFile,
) {
    const dependency = await gradleFile.getDependency(namespace, plugin);
    const version = pluginVersions[namespace][plugin];

    if (dependency) {
        if (dependency.version == version) log.success(`${plugin} dependency already set.`);
        else {
            log.info(
                `${plugin} dependency version ${dependency.version} found instead of ${version}, updating "/android/build.gradle"...`,
            );
            gradleFile.updatePluginVersion(namespace, plugin, dependency.version);
        }
    } else {
        log.info(`${plugin} dependency not found, updating "/android/build.gradle"...`);
        gradleFile.addDependency(namespace, plugin);
    }
}

export function handleGradlePlugin(
    namespace: string,
    plugin: string,
    position: 'top' | 'bottom',
    gradleFile: GradleFile,
) {
    const registeredPlugin = gradleFile.verifyPlugin(namespace, plugin, position);
    if (registeredPlugin === null) {
        log.info(
            `${plugin} plugin has not been registered, applying at ${position} of Gradle file`,
        );
        gradleFile.registerPlugin(namespace, plugin, position);
    } else if (registeredPlugin) {
        log.success(`${plugin} plugin already registered.`);
    } else {
        log.warn(`${plugin} registered incorrectly, moving plugin to ${position} of Gradle file`);
        gradleFile.removePlugin(namespace, plugin);
        gradleFile.registerPlugin(namespace, plugin, position);
    }
}
