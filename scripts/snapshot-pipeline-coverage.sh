#!/usr/bin/env bash
# Snapshot TS (Jet/NYC) and native iOS lcov hit counts for pipeline-related sources.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="${1:-snapshot}"
TS_LCOV="$ROOT/coverage/lcov.info"
IOS_LCOV="$ROOT/coverage/ios-native/lcov.info"
ANDROID_XML="$ROOT/tests/android/app/build/reports/jacoco/jacocoAndroidTestReport/jacocoAndroidTestReport.xml"

patterns=(
  'packages/firestore/lib/pipelines/expressions.ts'
  'packages/firestore/lib/pipelines/pipeline_runtime.ts'
  'packages/firestore/lib/web/pipelines/pipeline_bridge_factory.ts'
  'RNFBFirestorePipelineNodeBuilder.swift'
  'ReactNativeFirebaseFirestorePipelineNodeBuilder.java'
)

echo "=== pipeline coverage $LABEL ==="

if [[ -f "$TS_LCOV" ]]; then
  python3 - "$TS_LCOV" "${patterns[@]}" <<'PY'
import sys
path = sys.argv[1]
patterns = sys.argv[2:]
with open(path) as f:
    lines = f.readlines()
for pattern in patterns:
    if not pattern.endswith('.ts'):
        continue
    counts = {}
    current = False
    for line in lines:
        if line.startswith('SF:') and pattern in line:
            current = True
        elif line.startswith('end_of_record') and current:
            break
        elif current and line.startswith('DA:'):
            ln, c = line[3:].strip().split(',')
            counts[int(ln)] = int(c)
    if not counts:
        print(f"TS  {pattern}: (not in lcov)")
        continue
    hit = sum(1 for c in counts.values() if c > 0)
    total = len(counts)
    print(f"TS  {pattern}: {hit}/{total} ({100*hit/total:.2f}%)")
PY
else
  echo "TS  coverage/lcov.info: missing"
fi

if [[ -f "$IOS_LCOV" ]]; then
  python3 - "$IOS_LCOV" "${patterns[@]}" <<'PY'
import sys
path = sys.argv[1]
patterns = sys.argv[2:]
with open(path) as f:
    lines = f.readlines()
for pattern in patterns:
    if not pattern.endswith('.swift'):
        continue
    counts = {}
    current = False
    for line in lines:
        if line.startswith('SF:') and pattern in line:
            current = True
        elif line.startswith('end_of_record') and current:
            break
        elif current and line.startswith('DA:'):
            ln, c = line[3:].strip().split(',')
            counts[int(ln)] = int(c)
    if not counts:
        print(f"iOS {pattern}: (not in lcov)")
        continue
    hit = sum(1 for c in counts.values() if c > 0)
    total = len(counts)
    print(f"iOS {pattern}: {hit}/{total} ({100*hit/total:.2f}%)")
PY
  if [[ -f "$ROOT/coverage/ios-native/profdata" && -x "$ROOT/scripts/measure-pipeline-builder-coverage.sh" ]]; then
    bash "$ROOT/scripts/measure-pipeline-builder-coverage.sh" 2>/dev/null | sed 's/^/iOS /' || true
  fi
else
  echo "iOS coverage/ios-native/lcov.info: missing"
fi

if [[ -f "$ANDROID_XML" ]]; then
  python3 - "$ANDROID_XML" <<'PY'
import sys
import xml.etree.ElementTree as ET
path = sys.argv[1]
root = ET.parse(path).getroot()
for name in (
    'ReactNativeFirebaseFirestorePipelineNodeBuilder',
    'ReactNativeFirebaseFirestorePipelineBridgeFactory',
    'ReactNativeFirebaseFirestorePipelineExecutor',
):
    for pkg in root.iter('package'):
        for sf in pkg.findall('sourcefile'):
            if sf.attrib.get('name') == f'{name}.java':
                missed = covered = 0
                for line in sf.findall('line'):
                    ci = int(line.attrib.get('ci', 0))
                    if ci > 0:
                        covered += 1
                    else:
                        missed += 1
                total = missed + covered
                pct = 100 * covered / total if total else 0
                print(f"Android {name}: {covered}/{total} ({pct:.2f}%)")
                break
PY
else
  echo "Android jacocoAndroidTestReport.xml: missing"
fi
