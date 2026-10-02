import { describe, expect, it } from '@jest/globals';
import { setFireBaseMessagingAndroidManifest } from '../src/android/setupFirebaseNotifationIcon';
import { ExpoConfig } from '@expo/config-types';
import {
  expoConfigExample,
  expoNotificationsConfigExample,
  expoNotificationsConfigWithoutColorExample,
  expoNotificationsConfigWithoutPluginExample,
  pluginPropsConfigExample,
  pluginPropsConfigWithoutColorExample,
  pluginPropsColorOnlyExample,
} from './fixtures/expo-config-example';
import manifestApplicationExample from './fixtures/application-example';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';

describe('Config Plugin Android Tests', function () {
  describe('notification config', () => {
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
      // @ts-ignore - removed in Expo 55 but still useful for Expo 54 and lower folks
      config.notification = undefined;
      setFireBaseMessagingAndroidManifest(config, manifestApplication);
      expect(called).toBeTruthy();
      // eslint-disable-next-line no-console
      console.warn = warnOrig;
    });
  });

  describe('expo-notifications config', () => {
    it('applies changes to app/src/main/AndroidManifest.xml with color', async function () {
      const config: ExpoConfig = JSON.parse(JSON.stringify(expoNotificationsConfigExample));
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
      const config = JSON.parse(JSON.stringify(expoNotificationsConfigWithoutColorExample));
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
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication);
      expect(called).toBeTruthy();
      // eslint-disable-next-line no-console
      console.warn = warnOrig;
    });
  });

  describe('plugin props config', () => {
    it('applies changes to app/src/main/AndroidManifest.xml with icon and color from plugin props', async function () {
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication, pluginPropsConfigExample);
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

    it('applies changes to app/src/main/AndroidManifest.xml with icon only from plugin props', async function () {
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(
        config,
        manifestApplication,
        pluginPropsConfigWithoutColorExample,
      );
      expect(manifestApplication['meta-data']).toContainEqual({
        $: {
          'android:name': 'com.google.firebase.messaging.default_notification_icon',
          'android:resource': '@drawable/notification_icon',
        },
      });
      expect(manifestApplication['meta-data']).not.toContainEqual(
        expect.objectContaining({
          $: expect.objectContaining({
            'android:name': 'com.google.firebase.messaging.default_notification_color',
          }),
        }),
      );
    });

    it('plugin props take priority over expo-notifications config', async function () {
      const config: ExpoConfig = JSON.parse(JSON.stringify(expoNotificationsConfigExample));
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication, pluginPropsConfigExample);
      expect(manifestApplication['meta-data']).toContainEqual({
        $: {
          'android:name': 'com.google.firebase.messaging.default_notification_icon',
          'android:resource': '@drawable/notification_icon',
        },
      });
    });

    it('color-only props fall through to expo-notifications for icon', async function () {
      const config: ExpoConfig = JSON.parse(JSON.stringify(expoNotificationsConfigExample));
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication, pluginPropsColorOnlyExample);
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

  describe('installationIdEnabled', function () {
    it('writes firebase_messaging_installation_id_enabled when true', function () {
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication, {
        installationIdEnabled: true,
      });
      expect(manifestApplication['meta-data']).toContainEqual({
        $: {
          'android:name': 'firebase_messaging_installation_id_enabled',
          'android:value': 'true',
        },
      });
    });

    it('does not duplicate firebase_messaging_installation_id_enabled when already present', function () {
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const manifestApplication: ManifestApplication = JSON.parse(
        JSON.stringify(manifestApplicationExample),
      );
      setFireBaseMessagingAndroidManifest(config, manifestApplication, {
        installationIdEnabled: true,
      });
      setFireBaseMessagingAndroidManifest(config, manifestApplication, {
        installationIdEnabled: true,
      });
      const entries = (manifestApplication['meta-data'] ?? []).filter(
        item => item.$['android:name'] === 'firebase_messaging_installation_id_enabled',
      );
      expect(entries).toHaveLength(1);
    });

    it('writes nothing when omitted or false', function () {
      const config: ExpoConfig = JSON.parse(
        JSON.stringify(expoNotificationsConfigWithoutPluginExample),
      );
      const omitted: ManifestApplication = JSON.parse(JSON.stringify(manifestApplicationExample));
      setFireBaseMessagingAndroidManifest(config, omitted);
      expect(omitted['meta-data'] ?? []).not.toContainEqual(
        expect.objectContaining({
          $: expect.objectContaining({
            'android:name': 'firebase_messaging_installation_id_enabled',
          }),
        }),
      );

      const disabled: ManifestApplication = JSON.parse(JSON.stringify(manifestApplicationExample));
      setFireBaseMessagingAndroidManifest(config, disabled, { installationIdEnabled: false });
      expect(disabled['meta-data'] ?? []).not.toContainEqual(
        expect.objectContaining({
          $: expect.objectContaining({
            'android:name': 'firebase_messaging_installation_id_enabled',
          }),
        }),
      );
    });
  });
});
