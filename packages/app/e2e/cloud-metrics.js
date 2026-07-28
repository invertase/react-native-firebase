const { getE2eTestProject } = require('./helpers');

const DEFAULT_LOOKBACK_HOURS = 24;

function getCloudHelperUrl(functionName) {
  return `https://us-central1-${getE2eTestProject()}.cloudfunctions.net/${functionName}`;
}

async function postCloudHelperFunction(functionName, data) {
  const response = await fetch(getCloudHelperUrl(functionName), {
    method: 'POST',
    body: JSON.stringify({ data }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`cloud helper ${functionName} status=${response.status}`);
  }

  const body = await response.json();
  return body?.result ?? body;
}

/**
 * Live-project metric sink (not the Functions emulator).
 * Fire-and-forget; non-fatal when the helper is unavailable.
 */
exports.recordE2eCloudMetricFromHost = async function recordE2eCloudMetricFromHost(payload) {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  const metric = {
    source: 'detox-host',
    ...payload,
  };

  try {
    await postCloudHelperFunction('e2eCloudMetricsV2', metric);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '[rnfb-e2e-metrics] record-host-fallback',
      JSON.stringify({ ...metric, error: String(error) }),
    );
  }
};

/**
 * Pull recent cross-run pressure summary from Cloud Logging via deployed helper.
 * For retrospective analysis only — not emitted inline during Detox runs.
 */
exports.fetchE2eCloudMetricsSummaryFromHost = async function fetchE2eCloudMetricsSummaryFromHost({
  lookbackHours = DEFAULT_LOOKBACK_HOURS,
} = {}) {
  return postCloudHelperFunction('e2eCloudMetricsSummaryV2', { lookbackHours });
};
