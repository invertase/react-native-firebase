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

private final class FakeCancellableHandle: NSObject {
  private(set) var cancelCount = 0
  var onCancel: (() -> Void)?

  @objc func cancel() {
    cancelCount += 1
    onCancel?()
  }
}

final class RNFBStorageTaskRegistryStorageTests: XCTestCase {
  private var storage: RNFBStorageTaskRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBStorageTaskRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree() {
    let handle = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.get(1 as NSNumber) === handle)
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testPutIfAbsent_collision_keepsExistingWithoutCancel() {
    let first = FakeCancellableHandle()
    let second = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsent(1 as NSNumber, value: second))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)
    XCTAssertEqual(first.cancelCount, 0)
    XCTAssertEqual(second.cancelCount, 0)
  }

  func testPutOrDiscard_storesWhenFree() {
    let handle = FakeCancellableHandle()
    XCTAssertTrue(storage.putOrDiscard(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.get(1 as NSNumber) === handle)
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testPutOrDiscard_collision_cancelsIncoming() {
    let first = FakeCancellableHandle()
    let duplicate = FakeCancellableHandle()
    XCTAssertTrue(storage.putOrDiscard(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putOrDiscard(1 as NSNumber, value: duplicate))
    XCTAssertEqual(duplicate.cancelCount, 1)
    XCTAssertEqual(first.cancelCount, 0)
    XCTAssertTrue(storage.get(1 as NSNumber) === first)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get(99 as NSNumber))
  }

  func testTake_removesAndReturnsWithoutCallingCancel() {
    let handle = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.take(1 as NSNumber) === handle)
    XCTAssertNil(storage.get(1 as NSNumber))
    XCTAssertEqual(handle.cancelCount, 0)
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take(99 as NSNumber))
  }

  func testTakeIf_whenIdentityMatches_takes() {
    let handle = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.takeIf(1 as NSNumber, when: { $0 === handle }) === handle)
    XCTAssertNil(storage.get(1 as NSNumber))
  }

  func testTakeIf_whenIdentityMismatch_leavesMapping() {
    let mapped = FakeCancellableHandle()
    let other = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: mapped))
    XCTAssertNil(storage.takeIf(1 as NSNumber, when: { $0 === other }))
    XCTAssertTrue(storage.get(1 as NSNumber) === mapped)
  }

  func testTakeAndCancel_cancelsAndRemoves() {
    let handle = FakeCancellableHandle()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: handle))
    XCTAssertTrue(storage.takeAndCancel(1 as NSNumber))
    XCTAssertEqual(handle.cancelCount, 1)
    XCTAssertNil(storage.get(1 as NSNumber))
  }

  func testTakeAndCancel_missingKey_returnsFalse() {
    XCTAssertFalse(storage.takeAndCancel(99 as NSNumber))
  }

  func testTakeAndCancel_replacementDuringCancel_leavesReplacement() {
    let original = FakeCancellableHandle()
    let replacement = FakeCancellableHandle()
    original.onCancel = { [weak self] in
      guard let self = self else { return }
      _ = self.storage.take(11 as NSNumber)
      _ = self.storage.putIfAbsent(11 as NSNumber, value: replacement)
    }
    XCTAssertTrue(storage.putIfAbsent(11 as NSNumber, value: original))
    XCTAssertTrue(storage.takeAndCancel(11 as NSNumber))
    XCTAssertEqual(original.cancelCount, 1)
    XCTAssertTrue(storage.get(11 as NSNumber) === replacement)
    XCTAssertEqual(replacement.cancelCount, 0)
  }

  func testTakeAndCancel_objectWithoutCancel_doesNotCrash() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: plain))
    XCTAssertTrue(storage.takeAndCancel(1 as NSNumber))
    XCTAssertNil(storage.get(1 as NSNumber))
  }

  func testCancelAll_cancelsSnapshotAndLeavesEmpty() {
    let a = FakeCancellableHandle()
    let b = FakeCancellableHandle()
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
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: plain))
    storage.cancelAll()
    XCTAssertNil(storage.get(1 as NSNumber))
  }
}
