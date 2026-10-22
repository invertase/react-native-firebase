import {
  ConfigPlugin,
  withDangerousMod,
  withXcodeProject,
  XcodeProject,
} from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';
import fs from 'fs';
import path from 'path';
import { PluginConfigType } from '../pluginConfig';

const appPackageJson = require('@react-native-firebase/app/package.json');

export const DEFAULT_TARGET_NAME = 'NotificationServiceExtension';
export const SOURCE_FILE = 'NotificationService.swift';
export const INFO_PLIST_FILE = 'Info.plist';
export const FIREBASE_MESSAGING_PRODUCT = 'FirebaseMessaging';

const firebaseSpmUrl: string = appPackageJson.sdkVersions.ios.firebaseSpmUrl;
const firebaseVersion: string = appPackageJson.sdkVersions.ios.firebase;
const iosTarget: string = appPackageJson.sdkVersions.ios.iosTarget;
const PACKAGE_REFERENCE_COMMENT = 'XCRemoteSwiftPackageReference "firebase-ios-sdk"';

export interface NotificationServiceExtension {
  targetName: string;
  bundleIdentifier: string;
}

/**
 * Resolves the `ios.notificationServiceExtension` prop. Returns `null` when the extension is not requested.
 */
export function resolveNotificationServiceExtension(
  config: Pick<ExpoConfig, 'ios'>,
  props: PluginConfigType | undefined,
): NotificationServiceExtension | null {
  const option = props?.ios?.notificationServiceExtension;
  if (!option) {
    return null;
  }

  const targetName = (option === true ? undefined : option.targetName) ?? DEFAULT_TARGET_NAME;
  // The target name is also a bundle identifier component, which only allows letters, digits and hyphens.
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(targetName)) {
    throw new Error(
      `[@react-native-firebase/messaging] ios.notificationServiceExtension.targetName "${targetName}" must start with a letter and contain only letters, digits and hyphens.`,
    );
  }

  const appBundleIdentifier = config.ios?.bundleIdentifier;
  if (!appBundleIdentifier) {
    throw new Error(
      '[@react-native-firebase/messaging] ios.notificationServiceExtension requires `expo.ios.bundleIdentifier`, the extension bundle identifier is derived from it.',
    );
  }

  return { targetName, bundleIdentifier: `${appBundleIdentifier}.${targetName}` };
}

export const notificationServiceSource = `import FirebaseMessaging
import UserNotifications

class NotificationService: UNNotificationServiceExtension {
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    bestAttemptContent = request.content.mutableCopy() as? UNMutableNotificationContent

    guard let bestAttemptContent else {
      contentHandler(request.content)
      return
    }
    Messaging.serviceExtension().populateNotificationContent(bestAttemptContent, withContentHandler: contentHandler)
  }

  override func serviceExtensionTimeWillExpire() {
    if let contentHandler, let bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
}
`;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The extension's Info.plist. Its versions match the app's, which App Store Connect requires of an embedded extension.
 */
export function notificationServiceInfoPlist(config: Pick<ExpoConfig, 'version' | 'ios'>): string {
  const version = escapeXml(config.version ?? '1.0.0');
  const buildNumber = escapeXml(config.ios?.buildNumber ?? '1');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>${version}</string>
  <key>CFBundleVersion</key>
  <string>${buildNumber}</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.usernotifications.service</string>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).NotificationService</string>
  </dict>
</dict>
</plist>
`;
}

const unquote = (value: unknown) =>
  typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : value;

const isUuid = (key: string) => !key.endsWith('_comment');

function findNativeTarget(project: XcodeProject, predicate: (target: any) => boolean) {
  const section = project.pbxNativeTargetSection();
  const uuid = Object.keys(section).find(key => isUuid(key) && predicate(section[key]));
  return uuid ? { uuid, target: section[uuid] } : null;
}

function buildConfigurations(project: XcodeProject, target: any): any[] {
  const objects = project.hash.project.objects;
  const list = objects.XCConfigurationList[target.buildConfigurationList];
  return list.buildConfigurations.map(
    ({ value }: { value: string }) => objects.XCBuildConfiguration[value],
  );
}

/**
 * The `firebase-ios-sdk` package reference of the project, created at the Firebase Apple SDK version of
 * `@react-native-firebase/app` when missing. An existing reference is reused: `pod install` links
 * `FirebaseCore` into the app target through the same reference and pins its version.
 */
function ensureFirebasePackageReference(project: XcodeProject): string {
  const objects = project.hash.project.objects;
  objects.XCRemoteSwiftPackageReference ??= {};
  const references = objects.XCRemoteSwiftPackageReference;

  const existing = Object.keys(references).find(
    key => isUuid(key) && unquote(references[key].repositoryURL) === firebaseSpmUrl,
  );
  if (existing) {
    return existing;
  }

  const uuid = project.generateUuid();
  references[uuid] = {
    isa: 'XCRemoteSwiftPackageReference',
    repositoryURL: `"${firebaseSpmUrl}"`,
    requirement: { kind: 'exactVersion', version: firebaseVersion },
  };
  references[`${uuid}_comment`] = PACKAGE_REFERENCE_COMMENT;

  const rootProject = project.getFirstProject().firstProject;
  rootProject.packageReferences ??= [];
  rootProject.packageReferences.push({ value: uuid, comment: PACKAGE_REFERENCE_COMMENT });

  return uuid;
}

/** Links the `FirebaseMessaging` package product into the extension target, unless it already is. */
function linkFirebaseMessaging(project: XcodeProject, targetUuid: string, target: any) {
  const objects = project.hash.project.objects;
  objects.XCSwiftPackageProductDependency ??= {};
  const dependencies = objects.XCSwiftPackageProductDependency;

  target.packageProductDependencies ??= [];
  let dependencyUuid: string | undefined = target.packageProductDependencies
    .map(({ value }: { value: string }) => value)
    .find(
      (uuid: string) => unquote(dependencies[uuid]?.productName) === FIREBASE_MESSAGING_PRODUCT,
    );

  if (!dependencyUuid) {
    const packageUuid = ensureFirebasePackageReference(project);
    dependencyUuid = project.generateUuid();
    dependencies[dependencyUuid] = {
      isa: 'XCSwiftPackageProductDependency',
      package: packageUuid,
      package_comment: PACKAGE_REFERENCE_COMMENT,
      productName: FIREBASE_MESSAGING_PRODUCT,
    };
    dependencies[`${dependencyUuid}_comment`] = FIREBASE_MESSAGING_PRODUCT;
    target.packageProductDependencies.push({
      value: dependencyUuid,
      comment: FIREBASE_MESSAGING_PRODUCT,
    });
  }

  const frameworksPhases = objects.PBXFrameworksBuildPhase ?? {};
  const frameworksPhaseUuid = target.buildPhases
    .map(({ value }: { value: string }) => value)
    .find((uuid: string) => frameworksPhases[uuid]);
  const frameworksPhase = frameworksPhaseUuid
    ? frameworksPhases[frameworksPhaseUuid]
    : project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', targetUuid).buildPhase;

  const buildFiles = project.pbxBuildFileSection();
  if (
    frameworksPhase.files.some(
      ({ value }: { value: string }) => buildFiles[value]?.productRef === dependencyUuid,
    )
  ) {
    return;
  }

  const buildFileUuid = project.generateUuid();
  buildFiles[buildFileUuid] = {
    isa: 'PBXBuildFile',
    productRef: dependencyUuid,
    productRef_comment: FIREBASE_MESSAGING_PRODUCT,
  };
  buildFiles[`${buildFileUuid}_comment`] = `${FIREBASE_MESSAGING_PRODUCT} in Frameworks`;
  frameworksPhase.files.push({
    value: buildFileUuid,
    comment: `${FIREBASE_MESSAGING_PRODUCT} in Frameworks`,
  });
}

/**
 * Adds the Notification Service Extension target to the Xcode project, embedded in the app target, or updates
 * the one a previous prebuild added. Expects the files written by {@link writeNotificationServiceExtensionFiles}.
 */
export function addNotificationServiceExtension(
  project: XcodeProject,
  {
    targetName,
    bundleIdentifier,
    developmentTeam,
  }: NotificationServiceExtension & { developmentTeam?: string },
): XcodeProject {
  const objects = project.hash.project.objects;
  let extension = findNativeTarget(project, target => unquote(target.name) === targetName);

  if (!extension) {
    // `addTarget` adds the target dependency of the app target, in sections a fresh project may not have yet.
    objects.PBXTargetDependency ??= {};
    objects.PBXContainerItemProxy ??= {};

    const group = project.addPbxGroup([SOURCE_FILE, INFO_PLIST_FILE], targetName, targetName);
    project.addToPbxGroup(group.uuid, project.getFirstProject().firstProject.mainGroup);
    // `addPbxGroup` also adds a build file for each file, which the Info.plist must not have.
    const infoPlistReference = group.pbxGroup.children.find(
      ({ comment }: { comment: string }) => comment === INFO_PLIST_FILE,
    )?.value;
    const buildFiles = project.pbxBuildFileSection();
    for (const key of Object.keys(buildFiles)) {
      if (isUuid(key) && buildFiles[key].fileRef === infoPlistReference) {
        delete buildFiles[key];
        delete buildFiles[`${key}_comment`];
      }
    }

    // An `app_extension` target is embedded in the first target, the app target of an Expo project.
    const target = project.addTarget(targetName, 'app_extension', targetName, bundleIdentifier);
    project.addBuildPhase([SOURCE_FILE], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    project.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    extension = { uuid: target.uuid, target: target.pbxNativeTarget };
  }

  const app = findNativeTarget(
    project,
    target => unquote(target.productType) === 'com.apple.product-type.application',
  );
  const appBuildSettings = (name: string) =>
    app
      ? buildConfigurations(project, app.target).find(config => config.name === name)?.buildSettings
      : undefined;

  for (const config of buildConfigurations(project, extension.target)) {
    const settings = config.buildSettings;
    const appSettings = appBuildSettings(config.name) ?? {};

    settings.INFOPLIST_FILE = `"${targetName}/${INFO_PLIST_FILE}"`;
    settings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleIdentifier}"`;
    settings.PRODUCT_NAME = '"$(TARGET_NAME)"';
    settings.SWIFT_VERSION = '5.0';
    settings.CLANG_ENABLE_MODULES = 'YES';
    settings.CODE_SIGN_STYLE = 'Automatic';
    settings.IPHONEOS_DEPLOYMENT_TARGET = appSettings.IPHONEOS_DEPLOYMENT_TARGET ?? iosTarget;
    settings.TARGETED_DEVICE_FAMILY = appSettings.TARGETED_DEVICE_FAMILY ?? '"1,2"';
    if (developmentTeam) {
      settings.DEVELOPMENT_TEAM = developmentTeam;
    }
  }

  linkFirebaseMessaging(project, extension.uuid, extension.target);

  return project;
}

/** Writes the extension's source and Info.plist to `ios/<targetName>/`, replacing those of a previous prebuild. */
export function writeNotificationServiceExtensionFiles(
  platformProjectRoot: string,
  { targetName }: NotificationServiceExtension,
  config: Pick<ExpoConfig, 'version' | 'ios'>,
) {
  const directory = path.join(platformProjectRoot, targetName);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, SOURCE_FILE), notificationServiceSource);
  fs.writeFileSync(path.join(directory, INFO_PLIST_FILE), notificationServiceInfoPlist(config));
}

/**
 * Declares the extension to EAS Build, which provisions and signs the targets it is told about before prebuild.
 * See https://docs.expo.dev/build-reference/app-extensions/
 */
export function withEasAppExtension(
  config: ExpoConfig,
  extension: NotificationServiceExtension,
): ExpoConfig {
  const eas = config.extra?.eas ?? {};
  const appExtensions: { targetName: string }[] = eas.build?.experimental?.ios?.appExtensions ?? [];
  if (appExtensions.some(({ targetName }) => targetName === extension.targetName)) {
    return config;
  }

  config.extra = {
    ...config.extra,
    eas: {
      ...eas,
      build: {
        ...eas.build,
        experimental: {
          ...eas.build?.experimental,
          ios: {
            ...eas.build?.experimental?.ios,
            appExtensions: [...appExtensions, extension],
          },
        },
      },
    },
  };
  return config;
}

/**
 * Adds a Notification Service Extension target when `ios.notificationServiceExtension` is set, so FCM
 * notifications display their image. `FirebaseMessaging` is linked through Swift Package Manager, the only
 * distribution of the Firebase Apple SDK since 13.0.0, at the version `@react-native-firebase/app` pins.
 */
export const withNotificationServiceExtensionIos: ConfigPlugin<PluginConfigType | undefined> = (
  config,
  props,
) => {
  const extension = resolveNotificationServiceExtension(config, props);
  if (!extension) {
    return config;
  }

  config = withEasAppExtension(config, extension);

  config = withDangerousMod(config, [
    'ios',
    async config => {
      writeNotificationServiceExtensionFiles(
        config.modRequest.platformProjectRoot,
        extension,
        config,
      );
      return config;
    },
  ]);

  return withXcodeProject(config, config => {
    config.modResults = addNotificationServiceExtension(config.modResults, {
      ...extension,
      developmentTeam: (config.ios as { appleTeamId?: string } | undefined)?.appleTeamId,
    });
    return config;
  });
};
