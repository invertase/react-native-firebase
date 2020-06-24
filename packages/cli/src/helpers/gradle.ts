import g2js from 'gradle-to-js/lib/parser';
import { GradleDependency } from '../types/cli';

export const pluginVersions = require('../../plugin-versions.json');

export async function getPlugin(
  namespace: string,
  plugin: string,
  androidAppBuildGradleFile: string,
) {
  const androidAppBuildGradleDetails = await g2js.parseText(androidAppBuildGradleFile);

  return androidAppBuildGradleDetails.dependencies.find(
    (dependency: GradleDependency) =>
      dependency.type == 'apply' && dependency.name == `plugin: '${namespace}.${plugin}'`,
  ) as GradleDependency | undefined;
}

export async function getDependency(
  namespace: string,
  plugin: string,
  androidBuildGradleFile: string,
) {
  const androidBuildGradleDetails = await g2js.parseText(androidBuildGradleFile);
  return androidBuildGradleDetails.buildscript.dependencies.find(
    (dependency: GradleDependency) =>
      dependency.type == 'classpath' && dependency.group == namespace && dependency.name == plugin,
  ) as GradleDependency | undefined;
}

export function addDependency(namespace: string, plugin: string, file: string) {
  const addDependencyRegex = /buildscript[\w\W]*dependencies[\s]*{/g;
  return file.replace(addDependencyRegex, str => {
    return `${str}
    classpath '${namespace}:${plugin}:${pluginVersions[namespace][plugin]}'`;
  });
}

export function updatePluginVersion(
  namespace: string,
  plugin: string,
  oldVersion: string,
  file: string,
) {
  return file.replace(
    `'${namespace}:${plugin}:${oldVersion}'`,
    `'${namespace}:${plugin}:${pluginVersions[namespace][plugin]}}'`,
  );
}

export function registerPlugin(
  namespace: string,
  plugin: string,
  position: 'start' | 'end',
  androidAppBuildGradleFile: string,
) {
  const line = `apply plugin: ${namespace}${plugin}`;
  switch (position) {
    case 'start':
      return `${line}\n${androidAppBuildGradleFile}`;
    case 'end':
      return `${androidAppBuildGradleFile}\n${line}`;
  }
}
