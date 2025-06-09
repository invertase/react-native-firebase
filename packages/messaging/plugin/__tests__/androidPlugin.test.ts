import { describe, expect, it } from '@jest/globals';
import { setFireBaseMessagingAndroidManifest } from '../src/android/setupFirebaseNotifationIcon';
import { ExpoConfig } from '@expo/config-types';
import {
  expoConfigExample,
  expoConfigExampleWithExpoNotificationsPlugin,
} from './fixtures/expo-config-example';
import manifestApplicationExample from './fixtures/application-example';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';

describe('Config Plugin Android Tests', function () {
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
    const config = JSON.parse(JSON.stringify(expoConfigExample));
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
    // eslint-disable-next-line no-console
    const warnOrig = console.warn;
    let called = false;
    // eslint-disable-next-line no-console
    console.warn = (_: string) => {
      called = true;
    };
    const config: ExpoConfig = JSON.parse(JSON.stringify(expoConfigExample));
    const manifestApplication: ManifestApplication = JSON.parse(
      JSON.stringify(manifestApplicationExample),
    );
    config.notification = undefined;
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    expect(called).toBeTruthy();
    // eslint-disable-next-line no-console
    console.warn = warnOrig;
  });

  it('applies changes to app/src/main/AndroidManifest.xml with expo-notifications plugin config when app.json notification is undefined', async function () {
    const config: ExpoConfig = JSON.parse(
      JSON.stringify(expoConfigExampleWithExpoNotificationsPlugin),
    );
    const manifestApplication: ManifestApplication = JSON.parse(
      JSON.stringify(manifestApplicationExample),
    );
    config.notification = undefined;
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

  it('applies changes to app/src/main/AndroidManifest.xml with app.json notification config when both configs are defined', async function () {
    const config: ExpoConfig = JSON.parse(
      JSON.stringify(expoConfigExampleWithExpoNotificationsPlugin),
    );
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
});
