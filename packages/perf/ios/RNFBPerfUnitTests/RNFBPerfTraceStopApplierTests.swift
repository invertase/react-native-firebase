/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Foundation
import XCTest

private enum TraceApplyCall: Equatable {
  case metric(name: String, value: Int64)
  case attribute(name: String, value: String)
}

private final class StubTrace: NSObject, RNFBPerfTraceApplying {
  private(set) var calls: [TraceApplyCall] = []

  func setIntValue(_ value: Int64, forMetric metricName: String) {
    calls.append(.metric(name: metricName, value: value))
  }

  func setValue(_ value: String, forAttribute attributeName: String) {
    calls.append(.attribute(name: attributeName, value: value))
  }
}

final class RNFBPerfTraceStopApplierTests: XCTestCase {
  func testAppliesMetricsThenAttributes() {
    let trace = StubTrace()
    let metrics: NSDictionary = [
      "metric_a": NSNumber(value: 42),
      "metric_b": NSNumber(value: Int64(-7)),
    ]
    let attributes: NSDictionary = [
      "attr_a": "alpha",
      "attr_b": "beta",
    ]

    RNFBPerfTraceStopApplier.apply(metrics: metrics, attributes: attributes, to: trace)

    let metricCalls = trace.calls.compactMap { call -> (String, Int64)? in
      if case let .metric(name, value) = call { return (name, value) }
      return nil
    }
    let attributeCalls = trace.calls.compactMap { call -> (String, String)? in
      if case let .attribute(name, value) = call { return (name, value) }
      return nil
    }

    XCTAssertEqual(metricCalls.count, 2)
    XCTAssertEqual(attributeCalls.count, 2)
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: metricCalls)["metric_a"], 42)
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: metricCalls)["metric_b"], -7)
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: attributeCalls)["attr_a"], "alpha")
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: attributeCalls)["attr_b"], "beta")

    // Metrics finish before any attribute (pre-port order).
    let firstAttributeIndex = trace.calls.firstIndex { call in
      if case .attribute = call { return true }
      return false
    }
    let lastMetricIndex = trace.calls.lastIndex { call in
      if case .metric = call { return true }
      return false
    }
    XCTAssertNotNil(firstAttributeIndex)
    XCTAssertNotNil(lastMetricIndex)
    XCTAssertLessThan(lastMetricIndex!, firstAttributeIndex!)
  }

  func testNilDictionariesAreNoOps() {
    let trace = StubTrace()
    RNFBPerfTraceStopApplier.apply(metrics: nil, attributes: nil, to: trace)
    XCTAssertTrue(trace.calls.isEmpty)
  }

  func testEmptyDictionariesAreNoOps() {
    let trace = StubTrace()
    RNFBPerfTraceStopApplier.apply(metrics: [:], attributes: [:], to: trace)
    XCTAssertTrue(trace.calls.isEmpty)
  }

  func testMetricsOnly() {
    let trace = StubTrace()
    RNFBPerfTraceStopApplier.apply(
      metrics: ["bytes": NSNumber(value: Int64(1_024))],
      attributes: nil,
      to: trace
    )
    XCTAssertEqual(trace.calls, [.metric(name: "bytes", value: 1024)])
  }

  func testAttributesOnly() {
    let trace = StubTrace()
    RNFBPerfTraceStopApplier.apply(
      metrics: nil,
      attributes: ["region": "us"],
      to: trace
    )
    XCTAssertEqual(trace.calls, [.attribute(name: "region", value: "us")])
  }

  func testSkipsNonNumberMetricValuesAndNonStringAttributeValues() {
    let trace = StubTrace()
    let metrics: NSDictionary = [
      "ok": NSNumber(value: 1),
      "bad": "not-a-number",
    ]
    let attributes: NSDictionary = [
      "ok": "yes",
      "bad": NSNumber(value: 9),
    ]

    RNFBPerfTraceStopApplier.apply(metrics: metrics, attributes: attributes, to: trace)

    XCTAssertEqual(trace.calls, [
      .metric(name: "ok", value: 1),
      .attribute(name: "ok", value: "yes"),
    ])
  }

  func testLongLongMetricValues() {
    let trace = StubTrace()
    let big = Int64.max
    RNFBPerfTraceStopApplier.apply(
      metrics: ["max": NSNumber(value: big)],
      attributes: nil,
      to: trace
    )
    XCTAssertEqual(trace.calls, [.metric(name: "max", value: big)])
  }
}
