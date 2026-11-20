import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { IOSConfig, XcodeProject } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';
import fs from 'fs';
import os from 'os';
import path from 'path';
import withRnFirebaseMessaging from '../src';
import {
  addNotificationServiceExtension,
  DEFAULT_TARGET_NAME,
  FIREBASE_MESSAGING_PRODUCT,
  notificationServiceInfoPlist,
  resolveNotificationServiceExtension,
  SOURCE_FILE,
  withEasAppExtension,
  writeNotificationServiceExtensionFiles,
} from '../src/ios/notificationServiceExtension';

const appPackageJson = require('@react-native-firebase/app/package.json');

const FIXTURE_ROOT = path.join(__dirname, 'fixtures', 'notification-service-extension');
const BUNDLE_IDENTIFIER = 'com.example.helloworld';
const EXTENSION = {
  targetName: DEFAULT_TARGET_NAME,
  bundleIdentifier: `${BUNDLE_IDENTIFIER}.${DEFAULT_TARGET_NAME}`,
};

const unquote = (value: unknown) =>
  typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : value;

const readProject = (): XcodeProject => IOSConfig.XcodeUtils.getPbxproj(FIXTURE_ROOT);

/** Entries of a pbxproj object section, without the comment keys. */
const entries = (project: XcodeProject, section: string): [string, any][] =>
  Object.entries(project.hash.project.objects[section] ?? {}).filter(
    ([key]) => !key.endsWith('_comment'),
  );

const findTarget = (project: XcodeProject, name: string) =>
  entries(project, 'PBXNativeTarget').find(([, target]) => unquote(target.name) === name);

const buildSettings = (project: XcodeProject, target: any) => {
  const objects = project.hash.project.objects;
  return objects.XCConfigurationList[target.buildConfigurationList].buildConfigurations.map(
    ({ value }: { value: string }) => objects.XCBuildConfiguration[value].buildSettings,
  );
};

const phaseOf = (project: XcodeProject, target: any, section: string) => {
  const phases = project.hash.project.objects[section] ?? {};
  const uuid = target.buildPhases
    .map(({ value }: { value: string }) => value)
    .find((value: string) => phases[value]);
  return uuid ? phases[uuid] : undefined;
};

describe('Config Plugin iOS Tests - notificationServiceExtension', () => {
  describe('resolveNotificationServiceExtension', () => {
    const config = { ios: { bundleIdentifier: BUNDLE_IDENTIFIER } };

    it('returns null when the option is omitted or false', () => {
      expect(resolveNotificationServiceExtension(config, undefined)).toBeNull();
      expect(resolveNotificationServiceExtension(config, {})).toBeNull();
      expect(
        resolveNotificationServiceExtension(config, {
          ios: { notificationServiceExtension: false },
        }),
      ).toBeNull();
    });

    it('uses the default target name when true', () => {
      expect(
        resolveNotificationServiceExtension(config, {
          ios: { notificationServiceExtension: true },
        }),
      ).toEqual(EXTENSION);
    });

    it('derives the bundle identifier from a custom target name', () => {
      expect(
        resolveNotificationServiceExtension(config, {
          ios: { notificationServiceExtension: { targetName: 'ImageNotification' } },
        }),
      ).toEqual({
        targetName: 'ImageNotification',
        bundleIdentifier: `${BUNDLE_IDENTIFIER}.ImageNotification`,
      });
    });

    it('rejects a target name that is not a valid bundle identifier component', () => {
      expect(() =>
        resolveNotificationServiceExtension(config, {
          ios: { notificationServiceExtension: { targetName: 'Image_Notification' } },
        }),
      ).toThrow(/targetName "Image_Notification"/);
    });

    it('requires the app bundle identifier', () => {
      expect(() =>
        resolveNotificationServiceExtension({}, { ios: { notificationServiceExtension: true } }),
      ).toThrow(/expo\.ios\.bundleIdentifier/);
    });
  });

  describe('addNotificationServiceExtension', () => {
    it('adds an app extension target embedded in the app target', () => {
      const project = addNotificationServiceExtension(readProject(), EXTENSION);

      const [extensionUuid, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      expect(unquote(extension.productType)).toBe('com.apple.product-type.app-extension');

      const [, app] = findTarget(project, 'HelloWorld')!;
      const embed = phaseOf(project, app, 'PBXCopyFilesBuildPhase');
      expect(embed.dstSubfolderSpec).toBe(13);
      const buildFiles = project.pbxBuildFileSection();
      expect(
        embed.files.some(
          ({ value }: { value: string }) =>
            buildFiles[value].fileRef === extension.productReference,
        ),
      ).toBe(true);

      const dependencies = project.hash.project.objects.PBXTargetDependency;
      expect(
        app.dependencies.some(
          ({ value }: { value: string }) => dependencies[value].target === extensionUuid,
        ),
      ).toBe(true);
    });

    it('embeds the extension in PlugIns when the app target already copies other files', () => {
      // `addTarget` puts the product in the project's first "Copy Files" phase, whatever its destination.
      const project = readProject();
      const [appUuid] = findTarget(project, 'HelloWorld')!;
      project.addBuildPhase([], 'PBXCopyFilesBuildPhase', 'Copy Files', appUuid, 'frameworks');
      addNotificationServiceExtension(project, EXTENSION);

      const [, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      const [, app] = findTarget(project, 'HelloWorld')!;
      const buildFiles = project.pbxBuildFileSection();
      const copyPhases = project.hash.project.objects.PBXCopyFilesBuildPhase;
      const embeddingPhases = entries(project, 'PBXCopyFilesBuildPhase').filter(([, phase]) =>
        phase.files.some(
          ({ value }: { value: string }) =>
            buildFiles[value].fileRef === extension.productReference,
        ),
      );
      expect(embeddingPhases).toHaveLength(1);
      const [[embedUuid, embed]] = embeddingPhases;
      expect(embed.dstSubfolderSpec).toBe(13);
      expect(embed.files).toHaveLength(1);
      expect(app.buildPhases.some(({ value }: { value: string }) => value === embedUuid)).toBe(
        true,
      );
      expect(
        app.buildPhases.filter(
          ({ value }: { value: string }) => copyPhases[value]?.dstSubfolderSpec === 13,
        ),
      ).toHaveLength(1);
    });

    it('compiles NotificationService.swift in the extension', () => {
      const project = addNotificationServiceExtension(readProject(), EXTENSION);

      const [, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      const sources = phaseOf(project, extension, 'PBXSourcesBuildPhase');
      const buildFiles = project.pbxBuildFileSection();
      const fileReferences = project.pbxFileReferenceSection();
      expect(
        sources.files.map(({ value }: { value: string }) =>
          unquote(fileReferences[buildFiles[value].fileRef].path),
        ),
      ).toEqual([SOURCE_FILE]);
    });

    it('adds no build file for the extension Info.plist', () => {
      const project = addNotificationServiceExtension(readProject(), EXTENSION);

      const fileReferences = project.pbxFileReferenceSection();
      const infoPlists = Object.keys(fileReferences).filter(
        key => !key.endsWith('_comment') && unquote(fileReferences[key].path) === 'Info.plist',
      );
      expect(infoPlists).toHaveLength(1);
      expect(
        entries(project, 'PBXBuildFile').some(
          ([, buildFile]) => buildFile.fileRef === infoPlists[0],
        ),
      ).toBe(false);
    });

    it('sets the build settings, following the app target', () => {
      const project = addNotificationServiceExtension(readProject(), {
        ...EXTENSION,
        developmentTeam: 'ABCDE12345',
      });

      const [, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      for (const settings of buildSettings(project, extension)) {
        expect(unquote(settings.PRODUCT_BUNDLE_IDENTIFIER)).toBe(EXTENSION.bundleIdentifier);
        expect(unquote(settings.INFOPLIST_FILE)).toBe(`${DEFAULT_TARGET_NAME}/Info.plist`);
        expect(`${settings.IPHONEOS_DEPLOYMENT_TARGET}`).toBe('16.4');
        expect(`${settings.TARGETED_DEVICE_FAMILY}`).toBe('1');
        expect(settings.DEVELOPMENT_TEAM).toBe('ABCDE12345');
      }
    });

    it('links FirebaseMessaging through SPM at the Firebase Apple SDK version of the app package', () => {
      const project = addNotificationServiceExtension(readProject(), EXTENSION);

      const references = entries(project, 'XCRemoteSwiftPackageReference');
      expect(references).toHaveLength(1);
      const [packageUuid, reference] = references[0]!;
      expect(unquote(reference.repositoryURL)).toBe(appPackageJson.sdkVersions.ios.firebaseSpmUrl);
      expect(reference.requirement).toEqual({
        kind: 'exactVersion',
        version: appPackageJson.sdkVersions.ios.firebase,
      });
      expect(
        project
          .getFirstProject()
          .firstProject.packageReferences.map(({ value }: { value: string }) => value),
      ).toEqual([packageUuid]);

      const [, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      const dependencies = project.hash.project.objects.XCSwiftPackageProductDependency;
      const [dependencyUuid] = extension.packageProductDependencies.map(
        ({ value }: { value: string }) => value,
      );
      expect(dependencies[dependencyUuid]).toMatchObject({
        package: packageUuid,
        productName: FIREBASE_MESSAGING_PRODUCT,
      });

      const frameworks = phaseOf(project, extension, 'PBXFrameworksBuildPhase');
      const buildFiles = project.pbxBuildFileSection();
      expect(
        frameworks.files.map(({ value }: { value: string }) => buildFiles[value].productRef),
      ).toEqual([dependencyUuid]);
    });

    it('reuses the firebase-ios-sdk package reference the project already has', () => {
      const project = readProject();
      const objects = project.hash.project.objects;
      objects.XCRemoteSwiftPackageReference = {
        EXISTINGPACKAGEREFERENCE0: {
          isa: 'XCRemoteSwiftPackageReference',
          repositoryURL: `"${appPackageJson.sdkVersions.ios.firebaseSpmUrl}"`,
          requirement: { kind: 'exactVersion', version: appPackageJson.sdkVersions.ios.firebase },
        },
      };
      project.getFirstProject().firstProject.packageReferences = [
        { value: 'EXISTINGPACKAGEREFERENCE0' },
      ];

      addNotificationServiceExtension(project, EXTENSION);

      expect(entries(project, 'XCRemoteSwiftPackageReference').map(([uuid]) => uuid)).toEqual([
        'EXISTINGPACKAGEREFERENCE0',
      ]);
      expect(project.getFirstProject().firstProject.packageReferences).toHaveLength(1);
      expect(entries(project, 'XCSwiftPackageProductDependency')[0]![1].package).toBe(
        'EXISTINGPACKAGEREFERENCE0',
      );
    });

    it('updates the target of a previous prebuild rather than adding another', () => {
      const project = addNotificationServiceExtension(
        addNotificationServiceExtension(readProject(), EXTENSION),
        EXTENSION,
      );

      expect(
        entries(project, 'PBXNativeTarget').filter(
          ([, target]) => unquote(target.name) === DEFAULT_TARGET_NAME,
        ),
      ).toHaveLength(1);
      expect(entries(project, 'XCRemoteSwiftPackageReference')).toHaveLength(1);
      expect(entries(project, 'XCSwiftPackageProductDependency')).toHaveLength(1);
      const [, extension] = findTarget(project, DEFAULT_TARGET_NAME)!;
      expect(phaseOf(project, extension, 'PBXFrameworksBuildPhase').files).toHaveLength(1);
      const [, app] = findTarget(project, 'HelloWorld')!;
      expect(app.dependencies).toHaveLength(1);
      expect(phaseOf(project, app, 'PBXCopyFilesBuildPhase').files).toHaveLength(1);
    });

    it('writes a project that parses back with the extension', () => {
      const project = addNotificationServiceExtension(readProject(), EXTENSION);
      const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-messaging-nse-'));
      const projectDirectory = path.join(directory, 'ios', 'HelloWorld.xcodeproj');
      fs.mkdirSync(projectDirectory, { recursive: true });
      fs.writeFileSync(path.join(projectDirectory, 'project.pbxproj'), project.writeSync());

      const written = IOSConfig.XcodeUtils.getPbxproj(directory);

      expect(findTarget(written, DEFAULT_TARGET_NAME)).toBeDefined();
      expect(entries(written, 'XCRemoteSwiftPackageReference')[0]![1].requirement).toEqual({
        kind: 'exactVersion',
        version: appPackageJson.sdkVersions.ios.firebase,
      });
      fs.rmSync(directory, { recursive: true, force: true });
    });
  });

  describe('writeNotificationServiceExtensionFiles', () => {
    let directory: string;

    beforeEach(() => {
      directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-messaging-nse-'));
    });

    afterEach(() => {
      fs.rmSync(directory, { recursive: true, force: true });
    });

    it('writes the extension source and Info.plist in ios/<targetName>/', () => {
      writeNotificationServiceExtensionFiles(directory, EXTENSION, {
        version: '2.3.0',
        ios: { buildNumber: '42' },
      });

      const source = fs.readFileSync(
        path.join(directory, DEFAULT_TARGET_NAME, SOURCE_FILE),
        'utf8',
      );
      expect(source).toContain('import FirebaseMessaging');
      expect(source).toContain('Messaging.serviceExtension().populateNotificationContent');

      const infoPlist = fs.readFileSync(
        path.join(directory, DEFAULT_TARGET_NAME, 'Info.plist'),
        'utf8',
      );
      expect(infoPlist).toContain('<string>com.apple.usernotifications.service</string>');
      expect(infoPlist).toContain('<string>$(PRODUCT_MODULE_NAME).NotificationService</string>');
      expect(infoPlist).toContain(
        '<key>CFBundleShortVersionString</key>\n  <string>2.3.0</string>',
      );
      expect(infoPlist).toContain('<key>CFBundleVersion</key>\n  <string>42</string>');
    });

    it('defaults the versions like Expo does for the app', () => {
      const infoPlist = notificationServiceInfoPlist({});

      expect(infoPlist).toContain(
        '<key>CFBundleShortVersionString</key>\n  <string>1.0.0</string>',
      );
      expect(infoPlist).toContain('<key>CFBundleVersion</key>\n  <string>1</string>');
    });
  });

  describe('withEasAppExtension', () => {
    it('declares the extension to EAS Build once, keeping the other extras', () => {
      const config = {
        name: 'HelloWorld',
        slug: 'hello-world',
        extra: { eas: { projectId: 'project-id' }, other: true },
      } as ExpoConfig;

      const result = withEasAppExtension(withEasAppExtension(config, EXTENSION), EXTENSION);

      expect(result.extra).toEqual({
        eas: {
          projectId: 'project-id',
          build: { experimental: { ios: { appExtensions: [EXTENSION] } } },
        },
        other: true,
      });
    });
  });

  describe('withRnFirebaseMessaging', () => {
    let warnSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      // The Android step warns when no notification icon is configured; keep test output quiet.
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    const baseConfig = (): ExpoConfig =>
      ({
        name: 'HelloWorld',
        slug: 'hello-world',
        ios: { bundleIdentifier: BUNDLE_IDENTIFIER },
        _internal: { projectRoot: '/tmp/project' },
      }) as ExpoConfig;

    it('adds the extension when ios.notificationServiceExtension is set', () => {
      const config = withRnFirebaseMessaging(baseConfig(), {
        ios: { notificationServiceExtension: true },
      });

      expect((config as any).mods?.ios?.xcodeproj).toBeDefined();
      expect((config as any).mods?.ios?.dangerous).toBeDefined();
      expect(config.extra?.eas?.build?.experimental?.ios?.appExtensions).toEqual([EXTENSION]);
    });

    it('adds nothing on iOS when ios.notificationServiceExtension is omitted', () => {
      const config = withRnFirebaseMessaging(baseConfig(), {});

      expect((config as any).mods?.ios?.xcodeproj).toBeUndefined();
      expect((config as any).mods?.ios?.dangerous).toBeUndefined();
      expect(config.extra).toBeUndefined();
    });
  });
});
