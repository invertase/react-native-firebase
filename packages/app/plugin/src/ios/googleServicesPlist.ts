import { ConfigPlugin, withXcodeProject, XcodeProject } from '@expo/config-plugins';
import { getSourceRoot } from '@expo/config-plugins/build/ios/Paths';
import {
  addResourceFileToGroup,
  getProjectName,
} from '@expo/config-plugins/build/ios/utils/Xcodeproj';
import fs from 'fs';
import path from 'path';

export const withIosGoogleServicesFile: ConfigPlugin<{ relativePath: string }> = (
  config,
  { relativePath },
) => {
  return withXcodeProject(config, config => {
    config.modResults = setGoogleServicesFile({
      projectRoot: config.modRequest.projectRoot,
      project: config.modResults,
      googleServicesFileRelativePath: relativePath,
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
