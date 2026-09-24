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

private final class FakeStreamHandle: NSObject {
  private(set) var cancelCount = 0

  @objc func cancel() {
    cancelCount += 1
  }
}

final class RNFBFunctionsStreamingRegistryStorageTests: XCTestCase {
  private var storage: RNFBFunctionsStreamingRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBFunctionsStreamingRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree() {
    let handle = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.get(1 as NSNumber) === handle)
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testPutIfAbsent_collision_keepsExistingWithoutCancel() {
    let first = FakeStreamHandle()
    let second = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsent(1 as NSNumber, value: second))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)
    XCTAssertEqual(first.cancelCount, 0)
    XCTAssertEqual(second.cancelCount, 0)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get(99 as NSNumber))
  }

  func testTake_removesAndReturnsWithoutCallingCancel() {
    let handle = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.take(1 as NSNumber) === handle)
    XCTAssertNil(storage.get(1 as NSNumber))
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take(99 as NSNumber))
  }

  func testTakeIf_whenConditionMatches_takes() {
    let handle = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(2 as NSNumber, value: handle))
    XCTAssertTrue(storage.takeIf(2 as NSNumber, when: { $0 === handle }) === handle)
    XCTAssertNil(storage.get(2 as NSNumber))
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testTakeIf_whenConditionFails_leavesMapping() {
    let handle = FakeStreamHandle()
    let other = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(2 as NSNumber, value: handle))
    XCTAssertNil(storage.takeIf(2 as NSNumber, when: { $0 === other }))
    XCTAssertTrue(storage.get(2 as NSNumber) === handle)
  }

  func testTakeAndCancel_cancelsAfterTake() {
    let handle = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(3 as NSNumber, value: handle))
    storage.takeAndCancel(3 as NSNumber)
    XCTAssertEqual(handle.cancelCount, 1)
    XCTAssertNil(storage.get(3 as NSNumber))
  }

  func testTakeAndCancel_missingKey_isNoOp() {
    storage.takeAndCancel(99 as NSNumber)
  }

  func testTakeAndCancel_objectWithoutCancel_doesNotCrash() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent(4 as NSNumber, value: plain))
    storage.takeAndCancel(4 as NSNumber)
    XCTAssertNil(storage.get(4 as NSNumber))
  }

  func testCancelAll_cancelsSnapshotAndLeavesEmpty() {
    let a = FakeStreamHandle()
    let b = FakeStreamHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: a))
    XCTAssertTrue(storage.putIfAbsent(2 as NSNumber, value: b))
    storage.cancelAll()
    XCTAssertEqual(a.cancelCount, 1)
    XCTAssertEqual(b.cancelCount, 1)
    XCTAssertNil(storage.get(1 as NSNumber))
    XCTAssertNil(storage.get(2 as NSNumber))
  }

  func testCancelAll_objectWithoutCancel_doesNotCrash() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent(4 as NSNumber, value: plain))
    storage.cancelAll()
    XCTAssertNil(storage.get(4 as NSNumber))
  }

  func testCancelAll_empty_isNoOp() {
    storage.cancelAll()
  }
}
