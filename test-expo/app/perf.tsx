import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  getPerformance,
  httpMetric,
  initializePerformance,
  newScreenTrace,
  startScreenTrace,
  trace,
} from '@react-native-firebase/perf';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function PerfScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const perf = useMemo(() => getPerformance(), []);

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  return (
    <ScreenChrome title="perf" result={result} error={error}>
      <Text style={styles.hint}>
        Controls mirror runtime APIs taught on the Performance Monitoring usage pages. Performance
        is not in yarn tests:emulator:start-ci, and there is no connect*Emulator helper.
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getPerformance"
        onPress={() =>
          run('getPerformance', () => {
            const instance = getPerformance();
            return {
              appName: instance.app.name,
              collectionEnabled: instance.isPerformanceCollectionEnabled,
              dataCollectionEnabled: instance.dataCollectionEnabled,
              instrumentationEnabled: instance.instrumentationEnabled,
            };
          })
        }
      />
      <AppButton
        title="initializePerformance"
        onPress={() =>
          run('initializePerformance', () => {
            const instance = initializePerformance(getApp(), {
              dataCollectionEnabled: true,
              instrumentationEnabled: true,
            });
            return {
              appName: instance.app.name,
              sameAsGetPerformance: instance === perf,
              collectionEnabled: instance.isPerformanceCollectionEnabled,
            };
          })
        }
      />

      <Text style={styles.section}>Traces</Text>
      <AppButton
        title="trace"
        onPress={() =>
          run('trace', () => {
            const t = trace(perf, 'test-expo-example');
            t.start();
            t.putAttribute('source', 'test-expo');
            t.putMetric('steps', 1);
            t.incrementMetric('steps', 1);
            const metrics = t.getMetrics();
            t.stop();
            return { name: 'test-expo-example', metrics };
          })
        }
      />
      <Text style={styles.warning}>
        WARNING: ScreenTrace.start / startScreenTrace throw on iOS. On Android, unsupported devices
        (API 26/27 or hardware acceleration off) throw during native start; a null current Activity
        is a silent no-op. newScreenTrace construction does not throw for platform support.
      </Text>
      <AppButton
        title="newScreenTrace (can throw)"
        onPress={() =>
          run('newScreenTrace', () => {
            const screenTrace = newScreenTrace(perf, 'test-expo-screen');
            screenTrace.start();
            screenTrace.stop();
            return 'newScreenTrace start/stop completed';
          })
        }
      />
      <AppButton
        title="startScreenTrace (can throw)"
        onPress={() =>
          run('startScreenTrace', () => {
            const screenTrace = startScreenTrace(perf, 'test-expo-screen');
            screenTrace.stop();
            return 'startScreenTrace start/stop completed';
          })
        }
      />

      <Text style={styles.section}>HTTP metrics</Text>
      <AppButton
        title="httpMetric"
        onPress={() =>
          run('httpMetric', async () => {
            const metric = httpMetric(perf, 'https://example.com/', 'GET');
            metric.putAttribute('source', 'test-expo');
            metric.setRequestPayloadSize(0);
            metric.start();
            const response = await fetch('https://example.com/');
            const contentLengthHeader = response.headers.get('Content-Length');
            metric.setHttpResponseCode(response.status);
            metric.setResponseContentType(response.headers.get('Content-Type'));
            metric.setResponsePayloadSize(contentLengthHeader ? Number(contentLengthHeader) : null);
            metric.stop();
            return { status: response.status };
          })
        }
      />

      <Text style={styles.section}>Collection</Text>
      <AppButton
        title="dataCollectionEnabled(true)"
        onPress={() =>
          run('dataCollectionEnabled', () => {
            perf.dataCollectionEnabled = true;
            return { collectionEnabled: perf.isPerformanceCollectionEnabled };
          })
        }
      />
      <AppButton
        title="dataCollectionEnabled(false)"
        onPress={() =>
          run('dataCollectionEnabled', () => {
            perf.dataCollectionEnabled = false;
            return { collectionEnabled: perf.isPerformanceCollectionEnabled };
          })
        }
      />
      <Text style={styles.hint}>
        instrumentationEnabled assignment applies on iOS only. On Android automatic instrumentation
        is controlled by the Gradle Performance Monitoring plugin.
      </Text>
      <AppButton
        title="instrumentationEnabled(true)"
        onPress={() =>
          run('instrumentationEnabled', () => {
            perf.instrumentationEnabled = true;
            return { instrumentationEnabled: perf.instrumentationEnabled };
          })
        }
      />
      <AppButton
        title="instrumentationEnabled(false)"
        onPress={() =>
          run('instrumentationEnabled', () => {
            perf.instrumentationEnabled = false;
            return { instrumentationEnabled: perf.instrumentationEnabled };
          })
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
