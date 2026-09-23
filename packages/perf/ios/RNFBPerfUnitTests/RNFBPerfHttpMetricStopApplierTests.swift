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

private enum HttpMetricApplyCall: Equatable {
  case attribute(name: String, value: String)
  case responseCode(Int)
  case requestPayloadSize(Int)
  case responsePayloadSize(Int)
  case responseContentType(String)
}

private final class StubHttpMetric: NSObject, RNFBPerfHttpMetricApplying {
  private(set) var calls: [HttpMetricApplyCall] = []

  func setValue(_ value: String, forAttribute attributeName: String) {
    calls.append(.attribute(name: attributeName, value: value))
  }

  func setResponseCode(_ responseCode: Int) {
    calls.append(.responseCode(responseCode))
  }

  func setRequestPayloadSize(_ bytes: Int) {
    calls.append(.requestPayloadSize(bytes))
  }

  func setResponsePayloadSize(_ bytes: Int) {
    calls.append(.responsePayloadSize(bytes))
  }

  func setResponseContentType(_ contentType: String) {
    calls.append(.responseContentType(contentType))
  }
}

final class RNFBPerfHttpMetricStopApplierTests: XCTestCase {
  func testAppliesAttributesThenOptionalFieldsInOrder() {
    let metric = StubHttpMetric()
    let attributes: NSDictionary = [
      "attr_a": "alpha",
      "attr_b": "beta",
    ]

    RNFBPerfHttpMetricStopApplier.apply(
      attributes: attributes,
      httpResponseCode: NSNumber(value: 200),
      requestPayloadSize: NSNumber(value: 128),
      responsePayloadSize: NSNumber(value: 256),
      responseContentType: "application/json",
      to: metric
    )

    let attributeCalls = metric.calls.compactMap { call -> (String, String)? in
      if case let .attribute(name, value) = call { return (name, value) }
      return nil
    }
    XCTAssertEqual(attributeCalls.count, 2)
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: attributeCalls)["attr_a"], "alpha")
    XCTAssertEqual(Dictionary(uniqueKeysWithValues: attributeCalls)["attr_b"], "beta")

    let nonAttributeCalls = metric.calls.filter {
      if case .attribute = $0 { return false }
      return true
    }
    XCTAssertEqual(
      nonAttributeCalls,
      [
        .responseCode(200),
        .requestPayloadSize(128),
        .responsePayloadSize(256),
        .responseContentType("application/json"),
      ]
    )

    let lastAttributeIndex = metric.calls.lastIndex {
      if case .attribute = $0 { return true }
      return false
    }
    let firstOptionalIndex = metric.calls.firstIndex {
      if case .attribute = $0 { return false }
      return true
    }
    XCTAssertNotNil(lastAttributeIndex)
    XCTAssertNotNil(firstOptionalIndex)
    XCTAssertLessThan(lastAttributeIndex!, firstOptionalIndex!)
  }

  func testNilAttributesAndNilOptionalsAreNoOps() {
    let metric = StubHttpMetric()
    RNFBPerfHttpMetricStopApplier.apply(
      attributes: nil,
      httpResponseCode: nil,
      requestPayloadSize: nil,
      responsePayloadSize: nil,
      responseContentType: nil,
      to: metric
    )
    XCTAssertTrue(metric.calls.isEmpty)
  }

  func testEmptyAttributesDictionaryIsNoOp() {
    let metric = StubHttpMetric()
    RNFBPerfHttpMetricStopApplier.apply(
      attributes: [:],
      httpResponseCode: nil,
      requestPayloadSize: nil,
      responsePayloadSize: nil,
      responseContentType: nil,
      to: metric
    )
    XCTAssertTrue(metric.calls.isEmpty)
  }

  func testAttributesOnly() {
    let metric = StubHttpMetric()
    RNFBPerfHttpMetricStopApplier.apply(
      attributes: ["region": "us"],
      httpResponseCode: nil,
      requestPayloadSize: nil,
      responsePayloadSize: nil,
      responseContentType: nil,
      to: metric
    )
    XCTAssertEqual(metric.calls, [.attribute(name: "region", value: "us")])
  }

  func testOptionalsOnlySkipsMissingFields() {
    let metric = StubHttpMetric()
    RNFBPerfHttpMetricStopApplier.apply(
      attributes: nil,
      httpResponseCode: NSNumber(value: 404),
      requestPayloadSize: nil,
      responsePayloadSize: NSNumber(value: 10),
      responseContentType: nil,
      to: metric
    )
    XCTAssertEqual(
      metric.calls,
      [
        .responseCode(404),
        .responsePayloadSize(10),
      ]
    )
  }

  func testSkipsNonStringAttributeValues() {
    let metric = StubHttpMetric()
    let attributes: NSDictionary = [
      "ok": "yes",
      "bad": NSNumber(value: 9),
    ]

    RNFBPerfHttpMetricStopApplier.apply(
      attributes: attributes,
      httpResponseCode: nil,
      requestPayloadSize: nil,
      responsePayloadSize: nil,
      responseContentType: nil,
      to: metric
    )

    XCTAssertEqual(metric.calls, [.attribute(name: "ok", value: "yes")])
  }

  func testNSNumberIntValuesPassedThrough() {
    let metric = StubHttpMetric()
    RNFBPerfHttpMetricStopApplier.apply(
      attributes: nil,
      httpResponseCode: NSNumber(value: Int32.max),
      requestPayloadSize: NSNumber(value: 0),
      responsePayloadSize: NSNumber(value: -1),
      responseContentType: "text/plain",
      to: metric
    )
    XCTAssertEqual(
      metric.calls,
      [
        .responseCode(Int(Int32.max)),
        .requestPayloadSize(0),
        .responsePayloadSize(-1),
        .responseContentType("text/plain"),
      ]
    )
  }
}
