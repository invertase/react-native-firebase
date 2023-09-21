import fs from 'fs/promises';
import path from 'path';
import { beforeAll, describe, expect, it, jest } from '@jest/globals';

import { applyPlugin } from '../src/android/applyPlugin';
import { setBuildscriptDependency } from '../src/android/buildscriptDependency';
import { setFireBaseMessagingAndroidManifest } from '../src/android/setupFirebaseNotifationIcon';
import { ExpoConfig } from '@expo/config-types';
import expoConfigExample from './fixtures/expo-config-example';
import manifestApplicationExample from './fixtures/application-example';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';

describe('Config Plugin Android Tests', function () {
  let appBuildGradle: string;
  let projectBuildGradle: string;

  beforeAll(async function () {
    projectBuildGradle = await fs.readFile(
      path.resolve(__dirname, './fixtures/project_build.gradle'),
      { encoding: 'utf-8' },
    );

    appBuildGradle = await fs.readFile(path.resolve(__dirname, './fixtures/app_build.gradle'), {
      encoding: 'utf-8',
    });
  });

  it('applies changes to project build.gradle', async function () {
    const result = setBuildscriptDependency(projectBuildGradle);
    expect(result).toMatchSnapshot();
  });

  it('applies changes to app/build.gradle', async function () {
    const result = applyPlugin(appBuildGradle);
    expect(result).toMatchSnapshot();
  });

  it('applies changes to app/src/main/AndroidManifest.xml with color', async function () {
    const config: ExpoConfig = JSON.parse(JSON.stringify(expoConfigExample));
    const manifestApplication: ManifestApplication = JSON.parse(
      JSON.stringify(manifestApplicationExample),
    );
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource',
      },
    });
  });

  it('applies changes to app/src/main/AndroidManifest.xml without color', async function () {
    const config: ExpoConfig = JSON.parse(JSON.stringify(expoConfigExample));
    const manifestApplication: ManifestApplication = JSON.parse(
      JSON.stringify(manifestApplicationExample),
    );
    config.notification!.color = undefined;
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });
    expect(manifestApplication['meta-data']).not.toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon_color',
        'tools:replace': 'android:resource',
      },
    });
  });

  it('applies changes to app/src/main/AndroidManifest.xml without notification', async function () {
    const warnSpy = jest.spyOn(console, 'warn');
    const config: ExpoConfig = JSON.parse(JSON.stringify(expoConfigExample));
    const manifestApplication: ManifestApplication = JSON.parse(
      JSON.stringify(manifestApplicationExample),
    );
    config.notification = undefined;
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
