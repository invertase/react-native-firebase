import { ConfigPlugin, withXcodeProject, XcodeProject } from '@expo/config-plugins';
import { getSourceRoot } from '@expo/config-plugins/build/ios/Paths';
import {
  addResourceFileToGroup,
  getProjectName,
} from '@expo/config-plugins/build/ios/utils/Xcodeproj';
import fs from 'fs';
import path from 'path';

export const withIosGoogleServicesFile: ConfigPlugin = config => {
  return withXcodeProject(config, config => {
    if (!config.ios?.googleServicesFile) {
      throw new Error(
        'Path to GoogleService-Info.plist is not defined. Please specify the `expo.ios.googleServicesFile` field in app.json.',
      );
    }

    config.modResults = setGoogleServicesFile({
      projectRoot: config.modRequest.projectRoot,
      project: config.modResults,
      googleServicesFileRelativePath: config.ios.googleServicesFile,
    });
    return config;
  });
};

export function setGoogleServicesFile({
  projectRoot,
  project,
  googleServicesFileRelativePath,
}: {
  project: XcodeProject;
  projectRoot: string;
  googleServicesFileRelativePath: string;
}): XcodeProject {
  const googleServiceFilePath = path.resolve(projectRoot, googleServicesFileRelativePath);

  if (!fs.existsSync(googleServiceFilePath)) {
    throw new Error(
      `GoogleService-Info.plist doesn't exist in ${googleServiceFilePath}. Place it there or configure the path in app.json`,
    );
  }

  fs.copyFileSync(
    googleServiceFilePath,
    path.join(getSourceRoot(projectRoot), 'GoogleService-Info.plist'),
  );

  const projectName = getProjectName(projectRoot);
  const plistFilePath = `${projectName}/GoogleService-Info.plist`;
  if (!project.hasFile(plistFilePath)) {
    project = addResourceFileToGroup({
      filepath: plistFilePath,
      groupName: projectName,
      project,
      isBuildFile: true,
    });
  }
  return project;
}
