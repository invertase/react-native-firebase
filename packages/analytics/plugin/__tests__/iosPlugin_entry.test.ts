import { describe, expect, it } from '@jest/globals';
import type { ExpoConfig } from '@expo/config-types';

import withRnFirebaseAnalytics from '../src';
import type { PluginConfigType } from '../src/pluginConfig';

type IosMods = { podfile?: unknown; dangerous?: unknown };

// `withPlugins` asserts `_internal.projectRoot`, which expo-cli sets at runtime.
const minimalConfig = (): ExpoConfig =>
  ({
    name: 'HelloWorld',
    slug: 'hello-world',
    _internal: { projectRoot: '/tmp/project' },
  }) as ExpoConfig;

function iosMods(config: ExpoConfig): IosMods | undefined {
  return (config as { mods?: { ios?: IosMods } }).mods?.ios;
}

describe('Analytics Config Plugin entry', function () {
  it.each([
    ['no props', {}],
    [
      'iOS props',
      { ios: { withoutAdIdSupport: true, googleAppMeasurementOnDeviceConversion: true } },
    ],
  ] as [string, PluginConfigType][])(
    'registers the Podfile mod and the AppDelegate dangerous mod with %s',
    function (_label, props) {
      const mods = iosMods(withRnFirebaseAnalytics(minimalConfig(), props));

      expect(typeof mods?.podfile).toBe('function');
      // Only the scene link attribution step uses a dangerous mod.
      expect(typeof mods?.dangerous).toBe('function');
    },
  );
});
