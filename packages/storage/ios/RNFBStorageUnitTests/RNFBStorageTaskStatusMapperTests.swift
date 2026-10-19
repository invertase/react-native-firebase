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

import XCTest

final class RNFBStorageTaskStatusMapperTests: XCTestCase {
  /// `FIRStorageTaskStatusUnknown`
  private let statusUnknown = 0
  /// `FIRStorageTaskStatusResume`
  private let statusResume = 1
  /// `FIRStorageTaskStatusProgress`
  private let statusProgress = 2
  /// `FIRStorageTaskStatusPause`
  private let statusPause = 3
  /// `FIRStorageTaskStatusSuccess`
  private let statusSuccess = 4
  /// `FIRStorageTaskStatusFailure`
  private let statusFailure = 5

  func testResumeMapsToRunning() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusResume), "running")
  }

  func testProgressMapsToRunning() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusProgress), "running")
  }

  func testPauseMapsToPaused() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusPause), "paused")
  }

  func testSuccessMapsToSuccess() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusSuccess), "success")
  }

  func testFailureMapsToError() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusFailure), "error")
  }

  func testUnknownAndOutOfRangeMapToUnknown() {
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: statusUnknown), "unknown")
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: -1), "unknown")
    XCTAssertEqual(RNFBStorageTaskStatusMapper.string(forTaskStatus: 99), "unknown")
  }
}
