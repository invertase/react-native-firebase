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

final class RNFBDatabaseListenerRegistryStorageTests: XCTestCase {
  private var storage: RNFBDatabaseListenerRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBDatabaseListenerRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree_andIncrementsOccupancy() {
    let handle = 7 as NSNumber
    XCTAssertTrue(storage.putIfAbsent("k" as NSString, value: handle))
    XCTAssertTrue(storage.get("k" as NSString) === handle)
    XCTAssertTrue(storage.hasListeners)
    XCTAssertTrue(storage.hasEventListener("k" as NSString))
  }

  func testPutIfAbsent_collision_keepsExistingWithoutOccupancyBump() {
    let first = 1 as NSNumber
    let second = 2 as NSNumber
    XCTAssertTrue(storage.putIfAbsent("k" as NSString, value: first))
    XCTAssertFalse(storage.putIfAbsent("k" as NSString, value: second))
    XCTAssertTrue(storage.get("k" as NSString) === first)
    XCTAssertTrue(storage.hasListeners)
    XCTAssertEqual(storage.takeAll().count, 1)
    XCTAssertFalse(storage.hasListeners)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get("missing" as NSString))
    XCTAssertFalse(storage.hasEventListener("missing" as NSString))
    XCTAssertFalse(storage.hasListeners)
  }

  func testTake_removesAndDecrementsOccupancy() {
    let handle = 7 as NSNumber
    XCTAssertTrue(storage.putIfAbsent("k" as NSString, value: handle))
    XCTAssertTrue(storage.take("k" as NSString) === handle)
    XCTAssertNil(storage.get("k" as NSString))
    XCTAssertFalse(storage.hasListeners)
  }

  func testTake_whenFree_isNoOp() {
    XCTAssertNil(storage.take("missing" as NSString))
    XCTAssertFalse(storage.hasListeners)
  }

  func testTakeAll_snapshotAndLeavesEmpty() {
    XCTAssertTrue(storage.putIfAbsent("a" as NSString, value: 1 as NSNumber))
    XCTAssertTrue(storage.putIfAbsent("b" as NSString, value: 2 as NSNumber))
    let remaining = storage.takeAll()
    XCTAssertEqual(remaining.count, 2)
    XCTAssertFalse(storage.hasListeners)
    XCTAssertNil(storage.get("a" as NSString))
  }

  func testTakeAll_empty_isNoOp() {
    XCTAssertEqual(storage.takeAll().count, 0)
    XCTAssertFalse(storage.hasListeners)
  }

  func testPut_afterTake_allowsReuse() {
    XCTAssertTrue(storage.putIfAbsent("k" as NSString, value: 1 as NSNumber))
    XCTAssertEqual(storage.take("k" as NSString) as? NSNumber, 1)
    XCTAssertTrue(storage.putIfAbsent("k" as NSString, value: 2 as NSNumber))
    XCTAssertEqual(storage.get("k" as NSString) as? NSNumber, 2)
    XCTAssertTrue(storage.hasListeners)
  }
}
