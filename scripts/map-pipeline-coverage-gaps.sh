#!/usr/bin/env bash
# Summarize live-path pipeline coverage gaps from TS lcov + native iOS lcov + Android Jacoco.
# Numbers reconcile with scripts/snapshot-pipeline-coverage.sh (same artifact paths).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="${1:-gaps}"
TS_LCOV="$ROOT/coverage/lcov.info"
IOS_LCOV="$ROOT/coverage/ios-native/lcov.info"
ANDROID_XML="$ROOT/tests/android/app/build/reports/jacoco/jacocoAndroidTestReport/jacocoAndroidTestReport.xml"

echo "=== pipeline coverage gap map ($LABEL) ==="

python3 - "$TS_LCOV" "$IOS_LCOV" "$ANDROID_XML" <<'PY'
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ts_path, ios_path, android_path = map(Path, sys.argv[1:4])


def parse_lcov(path: Path, pattern: str) -> dict[int, int]:
    counts: dict[int, int] = {}
    if not path.is_file():
        return counts
    current = False
    with path.open() as handle:
        for line in handle:
            if line.startswith("SF:") and pattern in line:
                current = True
            elif line.startswith("end_of_record") and current:
                break
            elif current and line.startswith("DA:"):
                ln, hit = line[3:].strip().split(",")
                counts[int(ln)] = int(hit)
    return counts


def pct(hit: int, total: int) -> str:
    return f"{hit}/{total} ({100 * hit / total:.2f}%)" if total else "n/a"


def missed_ranges(missed: list[int], limit: int = 12) -> str:
    if not missed:
        return "(none)"
    groups: list[tuple[int, int]] = []
    start = prev = missed[0]
    for ln in missed[1:]:
        if ln == prev + 1:
            prev = ln
        else:
            groups.append((start, prev))
            start = prev = ln
    groups.append((start, prev))
    rendered = []
    for a, b in groups[:limit]:
        rendered.append(f"L{a}" if a == b else f"L{a}-L{b}")
    if len(groups) > limit:
        rendered.append(f"... +{len(groups) - limit} ranges")
    return ", ".join(rendered)


def region_stats(counts: dict[int, int], lo: int, hi: int) -> tuple[int, int, list[int]]:
    exec_lines = [ln for ln in range(lo, hi + 1) if ln in counts]
    missed = [ln for ln in exec_lines if counts[ln] == 0]
    hit = len(exec_lines) - len(missed)
    return hit, len(exec_lines), missed


def print_ts_file(label: str, pattern: str) -> None:
    counts = parse_lcov(ts_path, pattern)
    if not counts:
        print(f"TS  {label}: (not in lcov)")
        return
    hit = sum(1 for c in counts.values() if c > 0)
    missed = sorted(ln for ln, c in counts.items() if c == 0)
    print(f"TS  {label}: {pct(hit, len(counts))} — {len(missed)} missed: {missed_ranges(missed)}")


def print_ios_region(label: str, lo: int, hi: int) -> None:
    counts = parse_lcov(ios_path, "RNFBFirestorePipelineNodeBuilder.swift")
    hit, total, missed = region_stats(counts, lo, hi)
    print(
        f"iOS NodeBuilder {label}: {pct(hit, total)} — "
        f"{len(missed)} missed: {missed_ranges(missed, 8)}"
    )


def print_android_region(label: str, lo: int, hi: int) -> None:
    counts = parse_android("ReactNativeFirebaseFirestorePipelineNodeBuilder.java")
    hit, total, missed = region_stats(counts, lo, hi)
    print(
        f"Android NodeBuilder {label}: {pct(hit, total)} — "
        f"{len(missed)} missed: {missed_ranges(missed, 8)}"
    )


def parse_android(sourcefile: str) -> dict[int, int]:
    counts: dict[int, int] = {}
    if not Path(android_path).is_file():
        return counts
    root = ET.parse(android_path).getroot()
    for sf in root.iter("sourcefile"):
        if sf.attrib.get("name") == sourcefile:
            for line in sf.findall("line"):
                counts[int(line.attrib["nr"])] = int(line.attrib.get("ci", 0))
            break
    return counts


print("-- snapshot-compatible baselines --")
for pattern, label in [
    ("pipelines/expressions.ts", "expressions.ts"),
    ("pipelines/pipeline_runtime.ts", "pipeline_runtime.ts"),
    ("pipelines/pipeline_validate.ts", "pipeline_validate.ts"),
    ("pipelines/subcollection.ts", "subcollection.ts"),
]:
    counts = parse_lcov(ts_path, pattern)
    if counts:
        hit = sum(1 for c in counts.values() if c > 0)
        print(f"TS  {label}: {pct(hit, len(counts))}")

ios_nb = parse_lcov(ios_path, "RNFBFirestorePipelineNodeBuilder.swift")
if ios_nb:
    hit = sum(1 for c in ios_nb.values() if c > 0)
    print(f"iOS RNFBFirestorePipelineNodeBuilder.swift: {pct(hit, len(ios_nb))}")

for name in (
    "ReactNativeFirebaseFirestorePipelineNodeBuilder",
    "ReactNativeFirebaseFirestorePipelineExecutor",
):
    counts = parse_android(f"{name}.java")
    if counts:
        hit = sum(1 for c in counts.values() if c > 0)
        print(f"Android {name}: {pct(hit, len(counts))}")

print("\n-- TS live-path gaps (e2e lcov) --")
print_ts_file("subcollection.ts", "pipelines/subcollection.ts")
print_ts_file("pipeline_validate.ts", "pipelines/pipeline_validate.ts")
print_ts_file("pipeline_runtime.ts", "pipelines/pipeline_runtime.ts")
print_ts_file("expressions.ts", "pipelines/expressions.ts")

print("\n-- Android NodeBuilder live lowering regions --")
print_android_region("EnterObjectExpressionFrame loop", 900, 1299)
print_android_region("exit frames + boolean schedule", 1300, 1964)
print_android_region("scheduleExpressionFunctionLowering", 1965, 2129)
print_android_region("receiver/boolean chains", 2208, 2500)
print_android_region("nested pipeline helpers", 2500, 2832)
print_android_region("parsed aggregate tail (mixed live)", 2833, 3560)

print("\n-- iOS NodeBuilder live lowering regions --")
print_ios_region("stage coercion (pre-tree)", 1, 893)
print_ios_region("coerceExpressionTree operand modes", 919, 1006)
print_ios_region("coerceExpressionTree function dispatch", 1113, 1407)
print_ios_region("coerceExpressionTree exit frames", 1408, 1669)

print("\n-- E2e expansion priority hints (uncovered × reachable × e2e-feasible) --")
priorities = [
    "1. Android EnterObjectExpressionFrame loop — non-constant array/map literal lowering",
    "2. iOS comparisonOperand/numericOperand modes — bool/string/array rhs in comparisons & arithmetic",
    "3. Android scheduleExpressionFunctionLowering edges — array unwrap, map non-literal, timestampTruncate arity",
    "4. TS subcollection options overload + pipeline_validate execute guard branches",
    "5. Android parsed aggregate default branch (arrayAgg/first/last expression args) + iOS map passthrough",
]
for item in priorities:
    print(item)
PY
