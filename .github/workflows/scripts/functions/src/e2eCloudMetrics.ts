import { Logging, type Entry } from '@google-cloud/logging';
import { logger } from 'firebase-functions/v2';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';

export type E2eCloudMetricPayload = {
  source?: string;
  category: string;
  event: string;
  platform?: string;
  durationMs?: number;
  attempt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
};

const METRICS_LOG_MESSAGE = '[rnfb-e2e-metrics]';
const SUMMARY_QUERY_EVENT = 'summary-query';

function logE2eCloudMetric(payload: Record<string, unknown>): void {
  logger.write({
    severity: 'INFO',
    message: METRICS_LOG_MESSAGE,
    ...payload,
  });
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function metricPayloadFromLogEntry(entry: Entry): Record<string, unknown> | null {
  const metadata = entry.metadata as Record<string, unknown> | undefined;
  const candidates = [
    metadata?.jsonPayload,
    entry.data,
    metadata?.textPayload,
  ];

  for (const candidate of candidates) {
    const parsed = parseJsonObject(candidate);
    if (!parsed || parsed.message !== METRICS_LOG_MESSAGE) {
      continue;
    }
    if (parsed.event === SUMMARY_QUERY_EVENT) {
      return null;
    }
    return parsed;
  }

  return null;
}

/**
 * Records e2e cloud-pressure events in Cloud Logging (live project only).
 * Grep Cloud Logging for `[rnfb-e2e-metrics]` to aggregate cross-run pressure.
 */
export const e2eCloudMetricsV2 = onCall(
  { timeoutSeconds: 30 },
  async (req: CallableRequest<E2eCloudMetricPayload>) => {
    const payload = {
      ...req.data,
      receivedAt: new Date().toISOString(),
    };
    logE2eCloudMetric(payload);
    return { ok: true };
  },
);

type MetricsSummary = {
  lookbackHours: number;
  since: string;
  total: number;
  byCategory: Record<string, number>;
  byEvent: Record<string, number>;
  byPlatform: Record<string, number>;
};

/**
 * Summarizes recent `[rnfb-e2e-metrics]` entries from Cloud Logging.
 * Callable for retrospective cross-run pressure analysis (not logged per Detox run).
 */
export const e2eCloudMetricsSummaryV2 = onCall(
  { timeoutSeconds: 60 },
  async (req: CallableRequest<{ lookbackHours?: number }>) => {
    const lookbackHours = req.data?.lookbackHours ?? 24;
    const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    const logging = new Logging();
    const filter = [
      'resource.type="cloud_run_revision"',
      `timestamp>="${since.toISOString()}"`,
      `jsonPayload.message="${METRICS_LOG_MESSAGE}"`,
    ].join(' AND ');

    const summary: MetricsSummary = {
      lookbackHours,
      since: since.toISOString(),
      total: 0,
      byCategory: {},
      byEvent: {},
      byPlatform: {},
    };

    let pageToken: string | undefined;
    let scanned = 0;
    const maxEntries = 5000;

    do {
      const [entries, , response] = await logging.getEntries({
        filter,
        pageSize: 500,
        pageToken,
      });

      for (const entry of entries) {
        const payload = metricPayloadFromLogEntry(entry);
        if (!payload) {
          continue;
        }

        summary.total++;
        const category = String(payload.category || 'unknown');
        const event = String(payload.event || 'unknown');
        const platform = String(payload.platform || payload.source || 'unknown');
        summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
        summary.byEvent[event] = (summary.byEvent[event] || 0) + 1;
        summary.byPlatform[platform] = (summary.byPlatform[platform] || 0) + 1;
      }

      scanned += entries.length;
      pageToken = response?.nextPageToken || undefined;
    } while (pageToken && scanned < maxEntries);

    logE2eCloudMetric({ event: SUMMARY_QUERY_EVENT, ...summary });
    return summary;
  },
);
