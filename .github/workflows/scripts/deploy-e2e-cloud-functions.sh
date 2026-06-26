#!/bin/bash
# Deploy live-project e2e helper callables (Cloud Logging metrics, App Check, RC admin).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

yarn firebase -c "$(pwd)/firebase.json" --project react-native-firebase-testing deploy --only \
  functions:e2eCloudMetricsV2,functions:e2eCloudMetricsSummaryV2,functions:fetchAppCheckTokenV2,functions:testFunctionRemoteConfigUpdateV2
