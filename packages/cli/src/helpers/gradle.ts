import g2js from 'gradle-to-js/lib/parser';
import { GradleDependency } from '../types/cli';

export async function getGoogleServicesPlugin(androidAppBuildGradleFile: string) {
  const androidAppBuildGradleDetails = await g2js.parseText(androidAppBuildGradleFile);

  return androidAppBuildGradleDetails.dependencies.find(
    (dependency: GradleDependency) =>
      dependency.type == 'apply' && dependency.name == "plugin: 'com.google.gms.google-services'",
  ) as GradleDependency | undefined;
}

export async function getGoogleServicesDependency(androidBuildGradleFile: string) {
  const androidBuildGradleDetails = await g2js.parseText(androidBuildGradleFile);
  return androidBuildGradleDetails.buildscript.dependencies.find(
    (dependency: GradleDependency) =>
      dependency.type == 'classpath' &&
      dependency.group == 'com.google.gms' &&
      dependency.name == 'google-services',
  ) as GradleDependency | undefined;
}
