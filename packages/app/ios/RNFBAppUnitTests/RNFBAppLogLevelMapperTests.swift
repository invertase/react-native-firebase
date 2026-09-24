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

final class RNFBAppLogLevelMapperTests: XCTestCase {
  /// `FIRLoggerLevelError`
  private let errorLevel = 3
  /// `FIRLoggerLevelWarning`
  private let warningLevel = 4
  /// `FIRLoggerLevelInfo`
  private let infoLevel = 6
  /// `FIRLoggerLevelDebug`
  private let debugLevel = 7

  func testVerboseMapsToDebug() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "verbose"), debugLevel)
  }

  func testDebugMapsToDebug() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "debug"), debugLevel)
  }

  func testInfoMapsToInfo() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "info"), infoLevel)
  }

  func testWarnMapsToWarning() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "warn"), warningLevel)
  }

  func testUnknownMapsToError() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "silent"), errorLevel)
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "error"), errorLevel)
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: "bogus"), errorLevel)
  }

  func testNilMapsToError() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: nil), errorLevel)
  }

  func testEmptyStringMapsToError() {
    XCTAssertEqual(RNFBAppLogLevelMapper.loggerLevel(forString: ""), errorLevel)
  }
}
