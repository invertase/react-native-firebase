import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { shouldApplyIosOpenUrlFix } from '../src/ios/openUrlFix';
import type { ExpoConfigPluginEntry } from '../src/ios/openUrlFix';

describe('Config Plugin iOS Tests - openUrlFix', () => {
  beforeEach(function () {
    jest.resetAllMocks();
  });

  it('is disabled by default', async () => {
    const config = {
      name: 'TestName',
      slug: 'TestSlug',
    };

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {},
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {},
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: undefined,
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: 'default',
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: false,
          },
        },
      }),
    ).toBe(false);

    expect(
      shouldApplyIosOpenUrlFix({
        config,
        props: {
          ios: {
            captchaOpenUrlFix: true,
          },
        },
      }),
    ).toBe(true);
  });

  it('is enabled by default when expo-router is found', async () => {
    const cases: ExpoConfigPluginEntry[] = ['expo-router', ['expo-router'], ['expo-router', {}]];

    for (const routerPluginEntry of cases) {
      const plugins: ExpoConfigPluginEntry[] = [
        'something',
        [],
        ['something-else', { foo: 'bar' }],
        routerPluginEntry,
      ];

      const config = {
        name: 'TestName',
        slug: 'TestSlug',
        plugins,
      };

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {},
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {},
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: undefined,
            },
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: 'default',
            },
          },
        }),
      ).toBe(true);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: false,
            },
          },
        }),
      ).toBe(false);

      expect(
        shouldApplyIosOpenUrlFix({
          config,
          props: {
            ios: {
              captchaOpenUrlFix: true,
            },
          },
        }),
      ).toBe(true);
    }
  });
});
