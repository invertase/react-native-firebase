import * as path from 'path';
import {
  ConfigPlugin,
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} from '@expo/config-plugins';
import * as fs from 'fs';
import { copyFile, readFile, writeFile } from './fsutils';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  DEFAULT_BUNDLE_SHORT_VERSION,
  DEFAULT_BUNDLE_VERSION,
  GROUP_IDENTIFIER_TEMPLATE_REGEX,
  IPHONEOS_DEPLOYMENT_TARGET,
  NSE_EXT_FILES,
  NSE_PODFILE_REGEX,
  NSE_PODFILE_SNIPPET,
  NSE_SOURCE_FILE,
  NSE_TARGET_NAME,
  TARGETED_DEVICE_FAMILY,
} from './constants';
import { ExpoConfig } from '@expo/config-types';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
export type PluginProps = {
  installNSE?: boolean;
  /**
   * (required) Used to configure APNs environment entitlement. "development" or "production"
   */
  mode: Mode;

  /**
   * (optional) Used to configure Apple Team ID. You can find your Apple Team ID by running expo credentials:manager e.g: "91SW8A37CR"
   */
  devTeam?: string;

  /**
   * (optional) Target IPHONEOS_DEPLOYMENT_TARGET value to be used when adding the iOS NSE. A deployment target is nothing more than
   * the minimum version of the operating system the application can run on. This value should match the value in your Podfile e.g: "12.0".
   */
  iPhoneDeploymentTarget?: string;
};

export enum Mode {
  Dev = 'development',
  Prod = 'production',
}

const entitlementsFileName = `RNFirebaseNotificationServiceExtension.entitlements`;
const plistFileName = `RNFirebaseNotificationServiceExtension-Info.plist`;

async function updateNSEEntitlements(nsePath: string, groupIdentifier: string): Promise<void> {
  const entitlementsFilePath = `${nsePath}/${entitlementsFileName}`;
  let entitlementsFile = await readFile(entitlementsFilePath);
  entitlementsFile = entitlementsFile.replace(GROUP_IDENTIFIER_TEMPLATE_REGEX, groupIdentifier);
  await writeFile(entitlementsFilePath, entitlementsFile);
}

async function updateNSEBundleVersion(nsePath: string, version: string): Promise<void> {
  const plistFilePath = `${nsePath}/${plistFileName}`;
  let plistFile = await readFile(plistFilePath);
  plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);
  await writeFile(plistFilePath, plistFile);
}

async function updateNSEBundleShortVersion(nsePath: string, version: string): Promise<void> {
  const plistFilePath = `${nsePath}/${plistFileName}`;
  let plistFile = await readFile(plistFilePath);
  plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);
  await writeFile(plistFilePath, plistFile);
}

async function updatePodfile(iosPath: string): Promise<void> {
  const podfile = await readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);

  if (matches) {
    // eslint-disable-next-line no-console
    console.log(
      'RNFirebaseNotificationServiceExtension target already added to Podfile. Skipping...',
    );
  } else {
    fs.appendFile(`${iosPath}/Podfile`, NSE_PODFILE_SNIPPET, err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error writing to Podfile');
      }
    });
  }

  const result = mergeContents({
    src: await readFile(`${iosPath}/Podfile`),
    tag: '@react-native-firebase/messaging',
    newSrc: `  pod 'GoogleUtilities'\n  pod 'Firebase/Messaging'`,
    comment: '#',
    anchor: 'use_native_modules!',
    offset: 0,
  })
  writeFile(`${iosPath}/Podfile`, result.contents);
}

function getEasManagedCredentialsConfigExtra(config: ExpoConfig): { [k: string]: any } {
  return {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      build: {
        ...config.extra?.eas?.build,
        experimental: {
          ...config.extra?.eas?.build?.experimental,
          ios: {
            ...config.extra?.eas?.build?.experimental?.ios,
            appExtensions: [
              ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
              {
                // keep in sync with native changes in NSE
                targetName: NSE_TARGET_NAME,
                bundleIdentifier: `${config?.ios?.bundleIdentifier}.${NSE_TARGET_NAME}`,
                entitlements: {
                  'com.apple.security.application-groups': [
                    `group.${config?.ios?.bundleIdentifier}.rnfirebase`,
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
}

export const withEasManagedCredentials: ConfigPlugin<PluginProps> = config => {
  config.extra = getEasManagedCredentialsConfigExtra(config as ExpoConfig);
  return config;
};

export const withAppEnvironment: ConfigPlugin<PluginProps> = (config, props) => {
  return withEntitlementsPlist(config, newConfig => {
    if (props?.mode == null) {
      throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "@react-native-firebase/messaging".
        "mode" can be either "development" or "production".
        `);
    }
    newConfig.modResults['aps-environment'] = props.mode;
    return newConfig;
  });
};

export const withRNFirebaseXcodeProject: ConfigPlugin<PluginProps> = (config, props) => {
  return withXcodeProject(config, newConfig => {
    const xcodeProject = newConfig.modResults;

    if (!!xcodeProject.pbxTargetByName(NSE_TARGET_NAME)) {
      // eslint-disable-next-line no-console
      console.log(`${NSE_TARGET_NAME} already exists in project. Skipping...`);
      return newConfig;
    }

    // Create new PBXGroup for the extension
    const extGroup = xcodeProject.addPbxGroup(
      [...NSE_EXT_FILES, NSE_SOURCE_FILE],
      NSE_TARGET_NAME,
      NSE_TARGET_NAME,
    );

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
    const groups = xcodeProject.hash.project.objects['PBXGroup'];
    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.keys(groups).forEach(key => {
      if (
        typeof groups[key] === 'object' &&
        groups[key].name === undefined &&
        groups[key].path === undefined
      ) {
        xcodeProject.addToPbxGroup(extGroup.uuid, key);
      }
    });

    // WORK AROUND for codeProject.addTarget BUG
    // Xcode projects don't contain these if there is only one target
    // An upstream fix should be made to the code referenced in this link:
    //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
    const projObjects = xcodeProject.hash.project.objects;
    projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
    projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};

    // Add the NSE target
    // This adds PBXTargetDependency and PBXContainerItemProxy for you
    const nseTarget = xcodeProject.addTarget(
      NSE_TARGET_NAME,
      'app_extension',
      NSE_TARGET_NAME,
      `${config.ios?.bundleIdentifier}.${NSE_TARGET_NAME}`,
    );

    // Add build phases to the new target
    xcodeProject.addBuildPhase(
      ['NotificationService.m'],
      'PBXSourcesBuildPhase',
      'Sources',
      nseTarget.uuid,
    );
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', nseTarget.uuid);

    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', nseTarget.uuid);

    // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
    // However, can be more
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (
        typeof configurations[key].buildSettings !== 'undefined' &&
        configurations[key].buildSettings.PRODUCT_NAME === `"${NSE_TARGET_NAME}"`
      ) {
        const buildSettingsObj = configurations[key].buildSettings;
        buildSettingsObj.DEVELOPMENT_TEAM = props?.devTeam;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET =
          props?.iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
        buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
        buildSettingsObj.CODE_SIGN_STYLE = 'Automatic';
      }
    }

    xcodeProject.addTargetAttribute('DevelopmentTeam', props?.devTeam, nseTarget);
    xcodeProject.addTargetAttribute('DevelopmentTeam', props?.devTeam);

    return newConfig;
  });
};

export const withNotificationServiceExtension: ConfigPlugin<PluginProps> = config => {
  const pluginDir = require.resolve('@react-native-firebase/messaging/package.json');
  const sourceDir = path.join(pluginDir, '../plugin/src/ios/serviceExtensionFiles/');

  return withDangerousMod(config, [
    'ios',
    async config => {
      const iosPath = path.join(config.modRequest.projectRoot, 'ios');
      await updatePodfile(iosPath);
      fs.mkdirSync(`${iosPath}/${NSE_TARGET_NAME}`, { recursive: true });

      for (let i = 0; i < NSE_EXT_FILES.length; i++) {
        const extFile = NSE_EXT_FILES[i];
        const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${extFile}`;
        await copyFile(`${sourceDir}${extFile}`, targetFile);
      }

      const sourcePath = `${sourceDir}${NSE_SOURCE_FILE}`;
      const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${NSE_SOURCE_FILE}`;
      await copyFile(`${sourcePath}`, targetFile);

      const nsePath = `${iosPath}/${NSE_TARGET_NAME}`;
      await updateNSEEntitlements(nsePath, `group.${config.ios?.bundleIdentifier}.rnfirebase`);
      await updateNSEBundleVersion(nsePath, config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
      await updateNSEBundleShortVersion(nsePath, config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);

      return config;
    },
  ]);
};
