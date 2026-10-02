import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { ExpoConfig } from '@expo/config-types';
import type { InfoPlist } from '@expo/config-plugins';
import { withExpoPluginInstallationIdIos } from '../src/ios/setupInstallationId';
import withRnFirebaseMessaging from '../src';
import type { PluginConfigType } from '../src/pluginConfig';
import { expoConfigExample } from './fixtures/expo-config-example';
import { infoPlistExample } from './fixtures/info-plist-example';

const INSTALLATION_ID_PLIST_KEY = 'FirebaseMessagingInstallationIdEnabled';
const INSTALLATION_ID_ANDROID_META = 'firebase_messaging_installation_id_enabled';

type ModFn = (config: any) => Promise<any>;

// `withPlugins` (used by the plugin index) asserts `_internal.projectRoot`, which expo-cli sets at runtime.
const cloneConfig = (): ExpoConfig =>
  ({
    ...JSON.parse(JSON.stringify(expoConfigExample)),
    _internal: { projectRoot: '/tmp/project' },
  }) as ExpoConfig;
const cloneInfoPlist = (): InfoPlist => JSON.parse(JSON.stringify(infoPlistExample));

/**
 * Runs the Info.plist mod registered on a config by `withInfoPlist` against `modResults`.
 * Returns `undefined` when no iOS Info.plist mod was registered.
 */
async function runInfoPlistMod(config: ExpoConfig, modResults: InfoPlist) {
  const mod = (config as any).mods?.ios?.infoPlist as ModFn | undefined;
  if (!mod) {
    return undefined;
  }
  const result = await mod({
    ...config,
    modResults,
    modRequest: { projectRoot: '/tmp/project', platformProjectRoot: '/tmp/project/ios' },
    modRawConfig: config,
  });
  return result.modResults as InfoPlist;
}

/** Runs the AndroidManifest mod registered by `withAndroidManifest`. */
async function runAndroidManifestMod(config: ExpoConfig) {
  const mod = (config as any).mods?.android?.manifest as ModFn;
  const modResults = { manifest: { $: {}, application: [{ $: {}, 'meta-data': [] }] } };
  const result = await mod({
    ...config,
    modResults,
    modRequest: { projectRoot: '/tmp/project', platformProjectRoot: '/tmp/project/android' },
    modRawConfig: config,
  });
  return result.modResults.manifest.application[0] as {
    'meta-data': { $: Record<string, string> }[];
  };
}

describe('Config Plugin iOS Tests - installationIdEnabled', () => {
  let warnSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // The Android step warns when no notification icon is configured; keep test output quiet.
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('withExpoPluginInstallationIdIos', () => {
    it('writes FirebaseMessagingInstallationIdEnabled as boolean true when true', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: true,
      });

      const infoPlist = await runInfoPlistMod(config, {});

      expect(infoPlist).toBeDefined();
      expect(infoPlist![INSTALLATION_ID_PLIST_KEY]).toBe(true);
    });

    it('writes nothing when props are undefined', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), undefined);

      expect((config as any).mods?.ios?.infoPlist).toBeUndefined();
      expect(await runInfoPlistMod(config, cloneInfoPlist())).toBeUndefined();
    });

    it('writes nothing when installationIdEnabled is omitted', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {});

      expect((config as any).mods?.ios?.infoPlist).toBeUndefined();
    });

    it('writes nothing when installationIdEnabled is false', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: false,
      });

      expect((config as any).mods?.ios?.infoPlist).toBeUndefined();
    });

    it('preserves existing Info.plist keys', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: true,
      });

      const infoPlist = await runInfoPlistMod(config, cloneInfoPlist());

      expect(infoPlist).toEqual({
        ...infoPlistExample,
        [INSTALLATION_ID_PLIST_KEY]: true,
      });
    });

    it('overwrites a pre-existing false value with true', async () => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: true,
      });

      const infoPlist = await runInfoPlistMod(config, {
        ...cloneInfoPlist(),
        [INSTALLATION_ID_PLIST_KEY]: false,
      });

      expect(infoPlist![INSTALLATION_ID_PLIST_KEY]).toBe(true);
    });

    it.each([
      ['string "true"', 'true'],
      ['number 1', 1],
    ])('treats truthy non-boolean %s as enabled (JS truthiness)', async (_label, value) => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: value as unknown as boolean,
      });

      const infoPlist = await runInfoPlistMod(config, {});

      expect(infoPlist![INSTALLATION_ID_PLIST_KEY]).toBe(true);
    });

    it.each([
      ['empty string', ''],
      ['number 0', 0],
      ['null', null],
    ])('treats falsy non-boolean %s as disabled', async (_label, value) => {
      const config = withExpoPluginInstallationIdIos(cloneConfig(), {
        installationIdEnabled: value as unknown as boolean,
      });

      expect((config as any).mods?.ios?.infoPlist).toBeUndefined();
    });
  });

  describe('plugin index composition', () => {
    it('applies both iOS and Android opt-in from one config when true', async () => {
      const props: PluginConfigType = { installationIdEnabled: true };
      const config = withRnFirebaseMessaging(cloneConfig(), props);

      const infoPlist = await runInfoPlistMod(config, cloneInfoPlist());
      expect(infoPlist![INSTALLATION_ID_PLIST_KEY]).toBe(true);
      expect(infoPlist).toEqual({ ...infoPlistExample, [INSTALLATION_ID_PLIST_KEY]: true });

      const application = await runAndroidManifestMod(config);
      expect(application['meta-data']).toContainEqual({
        $: { 'android:name': INSTALLATION_ID_ANDROID_META, 'android:value': 'true' },
      });
    });

    it('writes neither platform key when installationIdEnabled is omitted', async () => {
      const config = withRnFirebaseMessaging(cloneConfig(), undefined);

      expect((config as any).mods.ios?.infoPlist).toBeUndefined();

      const application = await runAndroidManifestMod(config);
      expect(application['meta-data']).not.toContainEqual(
        expect.objectContaining({
          $: expect.objectContaining({ 'android:name': INSTALLATION_ID_ANDROID_META }),
        }),
      );
    });

    it('writes neither platform key when installationIdEnabled is false', async () => {
      const config = withRnFirebaseMessaging(cloneConfig(), { installationIdEnabled: false });

      expect((config as any).mods.ios?.infoPlist).toBeUndefined();

      const application = await runAndroidManifestMod(config);
      expect(application['meta-data']).not.toContainEqual(
        expect.objectContaining({
          $: expect.objectContaining({ 'android:name': INSTALLATION_ID_ANDROID_META }),
        }),
      );
    });

    it('keeps notification icon config working alongside installationIdEnabled', async () => {
      const config = withRnFirebaseMessaging(cloneConfig(), {
        installationIdEnabled: true,
        android: { notificationIcon: 'IconAsset' },
      });

      const application = await runAndroidManifestMod(config);
      expect(application['meta-data']).toContainEqual({
        $: {
          'android:name': 'com.google.firebase.messaging.default_notification_icon',
          'android:resource': '@drawable/notification_icon',
        },
      });
      expect(application['meta-data']).toContainEqual({
        $: { 'android:name': INSTALLATION_ID_ANDROID_META, 'android:value': 'true' },
      });
    });
  });
});
