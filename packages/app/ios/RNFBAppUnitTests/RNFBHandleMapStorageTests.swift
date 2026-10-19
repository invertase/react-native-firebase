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

final class RNFBHandleMapStorageTests: XCTestCase {
  private var storage: RNFBHandleMapStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBHandleMapStorage()
  }

  func testStorageOperationsPreserveExactPointers() {
    let first = NSMutableString(string: "equal")
    let equalButDistinct = NSMutableString(string: "equal")
    let replacement = NSObject()

    XCTAssertEqual(first, equalButDistinct)
    XCTAssertFalse(first === equalButDistinct)

    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsent(1 as NSNumber, value: replacement))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)

    XCTAssertTrue(storage.putIfAbsentOrSame(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsentOrSame(1 as NSNumber, value: equalButDistinct))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)

    XCTAssertTrue(storage.putIfAbsentOrSame(2 as NSNumber, value: equalButDistinct))
    XCTAssertTrue(storage.get(2 as NSNumber) === equalButDistinct)

    XCTAssertNil(storage.putReplacing(3 as NSNumber, value: first))
    XCTAssertTrue(storage.putReplacing(3 as NSNumber, value: replacement) === first)
    XCTAssertTrue(storage.take(3 as NSNumber) === replacement)
    XCTAssertNil(storage.take(3 as NSNumber))
  }

  func testTakeIfMissingDoesNotCallConditionAndFalseLeavesValue() {
    var conditionCalled = false
    XCTAssertNil(storage.takeIf(1 as NSNumber) { _ in
      conditionCalled = true
      return true
    })
    XCTAssertFalse(conditionCalled)

    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: value))
    XCTAssertNil(storage.takeIf(1 as NSNumber) { candidate in
      conditionCalled = true
      XCTAssertTrue(candidate === value)
      return false
    })
    XCTAssertTrue(conditionCalled)
    XCTAssertTrue(storage.get(1 as NSNumber) === value)
  }

  func testTakeIfConditionRunsUnderRecursiveLock() {
    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: value))

    let conditionEntered = DispatchSemaphore(value: 0)
    let releaseCondition = DispatchSemaphore(value: 0)
    let takeIfDone = DispatchSemaphore(value: 0)
    let competingTakeDone = DispatchSemaphore(value: 0)
    var taken: AnyObject?
    var competingTake: AnyObject?

    DispatchQueue.global().async {
      taken = self.storage.takeIf(1 as NSNumber) { candidate in
        XCTAssertTrue(candidate === value)
        XCTAssertTrue(self.storage.get(1 as NSNumber) === value)
        conditionEntered.signal()
        XCTAssertEqual(releaseCondition.wait(timeout: .now() + 5), .success)
        return true
      }
      takeIfDone.signal()
    }

    XCTAssertEqual(conditionEntered.wait(timeout: .now() + 5), .success)
    DispatchQueue.global().async {
      competingTake = self.storage.take(1 as NSNumber)
      competingTakeDone.signal()
    }

    XCTAssertEqual(competingTakeDone.wait(timeout: .now() + 0.1), .timedOut)
    releaseCondition.signal()
    XCTAssertEqual(takeIfDone.wait(timeout: .now() + 5), .success)
    XCTAssertEqual(competingTakeDone.wait(timeout: .now() + 5), .success)
    XCTAssertTrue(taken === value)
    XCTAssertNil(competingTake)
  }

  func testTakeAllReturnsSnapshotThenClears() {
    let first = NSObject()
    let second = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertTrue(storage.putIfAbsent(2 as NSNumber, value: second))

    let values = storage.takeAll()

    XCTAssertEqual(values.count, 2)
    XCTAssertTrue(values.contains { $0 === first })
    XCTAssertTrue(values.contains { $0 === second })
    XCTAssertTrue(storage.takeAll().isEmpty)
  }
}
