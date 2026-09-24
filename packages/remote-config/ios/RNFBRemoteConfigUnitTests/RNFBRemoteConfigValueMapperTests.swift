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

private final class StubRemoteConfigValue: NSObject, RNFBRemoteConfigValueReading {
  var stringValue: String?
  var source: Int

  init(stringValue: String?, source: Int) {
    self.stringValue = stringValue
    self.source = source
  }
}

final class RNFBRemoteConfigValueMapperTests: XCTestCase {
  /// `FIRRemoteConfigSourceRemote`
  private let sourceRemote = 0
  /// `FIRRemoteConfigSourceDefault`
  private let sourceDefault = 1
  /// `FIRRemoteConfigSourceStatic`
  private let sourceStatic = 2

  func testNonNilStringValueAndRemoteSource() {
    let stub = StubRemoteConfigValue(stringValue: "hello", source: sourceRemote)
    let result = RNFBRemoteConfigValueMapper.dictionary(for: stub)

    XCTAssertEqual(result["value"] as? String, "hello")
    XCTAssertEqual(result["source"] as? String, "remote")
  }

  func testNilStringValueBecomesNSNull() {
    let stub = StubRemoteConfigValue(stringValue: nil, source: sourceDefault)
    let result = RNFBRemoteConfigValueMapper.dictionary(for: stub)

    XCTAssertTrue(result["value"] is NSNull)
    XCTAssertEqual(result["source"] as? String, "default")
  }

  func testEmptyStringValuePreserved() {
    let stub = StubRemoteConfigValue(stringValue: "", source: sourceStatic)
    let result = RNFBRemoteConfigValueMapper.dictionary(for: stub)

    XCTAssertEqual(result["value"] as? String, "")
    XCTAssertEqual(result["source"] as? String, "static")
  }

  func testSourceMappingDelegatesToEnumMapper() {
    let remote = RNFBRemoteConfigValueMapper.dictionary(
      for: StubRemoteConfigValue(stringValue: "a", source: sourceRemote)
    )
    let defaultSource = RNFBRemoteConfigValueMapper.dictionary(
      for: StubRemoteConfigValue(stringValue: "b", source: sourceDefault)
    )
    let staticSource = RNFBRemoteConfigValueMapper.dictionary(
      for: StubRemoteConfigValue(stringValue: "c", source: sourceStatic)
    )
    let unknown = RNFBRemoteConfigValueMapper.dictionary(
      for: StubRemoteConfigValue(stringValue: "d", source: 99)
    )

    XCTAssertEqual(remote["source"] as? String, RNFBRemoteConfigEnumMapper.string(forSource: sourceRemote))
    XCTAssertEqual(
      defaultSource["source"] as? String,
      RNFBRemoteConfigEnumMapper.string(forSource: sourceDefault)
    )
    XCTAssertEqual(
      staticSource["source"] as? String,
      RNFBRemoteConfigEnumMapper.string(forSource: sourceStatic)
    )
    XCTAssertEqual(unknown["source"] as? String, RNFBRemoteConfigEnumMapper.string(forSource: 99))
  }
}
