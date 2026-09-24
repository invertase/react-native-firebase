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

private final class FakeRemovableHandle: NSObject {
  private(set) var removeCount = 0

  @objc func remove() {
    removeCount += 1
  }
}

final class RNFBRemoteConfigListenerRegistryStorageTests: XCTestCase {
  private var storage: RNFBRemoteConfigListenerRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBRemoteConfigListenerRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree() {
    let handle = FakeRemovableHandle()
    XCTAssertTrue(storage.putIfAbsent("k1" as NSString, value: handle))
    XCTAssertTrue(storage.get("k1" as NSString) === handle)
    XCTAssertEqual(handle.removeCount, 0)
  }

  func testPutIfAbsent_collision_keepsExistingWithoutRemove() {
    let first = FakeRemovableHandle()
    let second = FakeRemovableHandle()
    XCTAssertTrue(storage.putIfAbsent("k1" as NSString, value: first))
    XCTAssertFalse(storage.putIfAbsent("k1" as NSString, value: second))
    XCTAssertTrue(storage.get("k1" as NSString) === first)
    XCTAssertEqual(first.removeCount, 0)
    XCTAssertEqual(second.removeCount, 0)
  }

  func testPutOrDiscard_storesWhenFree() {
    let handle = FakeRemovableHandle()
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: handle))
    XCTAssertTrue(storage.get("k1" as NSString) === handle)
    XCTAssertEqual(handle.removeCount, 0)
  }

  func testPutOrDiscard_collision_removesIncoming() {
    let first = FakeRemovableHandle()
    let duplicate = FakeRemovableHandle()
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: first))
    XCTAssertFalse(storage.putOrDiscard("k1" as NSString, value: duplicate))
    XCTAssertEqual(duplicate.removeCount, 1)
    XCTAssertEqual(first.removeCount, 0)
    XCTAssertTrue(storage.get("k1" as NSString) === first)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get("missing" as NSString))
  }

  func testTake_removesAndReturnsWithoutCallingRemove() {
    let handle = FakeRemovableHandle()
    XCTAssertTrue(storage.putIfAbsent("k1" as NSString, value: handle))
    XCTAssertTrue(storage.take("k1" as NSString) === handle)
    XCTAssertNil(storage.get("k1" as NSString))
    XCTAssertEqual(handle.removeCount, 0)
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take("missing" as NSString))
  }

  func testTakeAndRemove_removesAfterTake() {
    let handle = FakeRemovableHandle()
    XCTAssertTrue(storage.putIfAbsent("k1" as NSString, value: handle))
    storage.takeAndRemove("k1" as NSString)
    XCTAssertEqual(handle.removeCount, 1)
    XCTAssertNil(storage.get("k1" as NSString))
  }

  func testTakeAndRemove_missingKey_isNoOp() {
    storage.takeAndRemove("missing" as NSString)
  }

  func testTakeAndRemove_objectWithoutRemove_doesNotCrash() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent("plain" as NSString, value: plain))
    storage.takeAndRemove("plain" as NSString)
    XCTAssertNil(storage.get("plain" as NSString))
  }

  func testRemoveAll_removesSnapshotAndLeavesEmpty() {
    let a = FakeRemovableHandle()
    let b = FakeRemovableHandle()
    XCTAssertTrue(storage.putIfAbsent("a" as NSString, value: a))
    XCTAssertTrue(storage.putIfAbsent("b" as NSString, value: b))
    storage.removeAll()
    XCTAssertEqual(a.removeCount, 1)
    XCTAssertEqual(b.removeCount, 1)
    XCTAssertNil(storage.get("a" as NSString))
    XCTAssertNil(storage.get("b" as NSString))
  }

  func testRemoveAll_objectWithoutRemove_doesNotCrash() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent("plain" as NSString, value: plain))
    storage.removeAll()
    XCTAssertNil(storage.get("plain" as NSString))
  }
}
