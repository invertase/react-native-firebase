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

final class RNFBFirestoreTransactionRegistryStorageTests: XCTestCase {
  private var storage: RNFBFirestoreTransactionRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBFirestoreTransactionRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree() {
    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: value))
    XCTAssertTrue(storage.get(1 as NSNumber) === value)
  }

  func testPutIfAbsent_collision_keepsExisting() {
    let first = NSObject()
    let second = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsent(1 as NSNumber, value: second))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)
  }

  func testPutIfAbsentOrSame_storesWhenFree() {
    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsentOrSame(1 as NSNumber, value: value))
    XCTAssertTrue(storage.get(1 as NSNumber) === value)
  }

  func testPutIfAbsentOrSame_sameInstance_returnsYes() {
    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: value))
    XCTAssertTrue(storage.putIfAbsentOrSame(1 as NSNumber, value: value))
    XCTAssertTrue(storage.get(1 as NSNumber) === value)
  }

  func testPutIfAbsentOrSame_differentInstance_returnsNo() {
    let first = NSObject()
    let other = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: first))
    XCTAssertFalse(storage.putIfAbsentOrSame(1 as NSNumber, value: other))
    XCTAssertTrue(storage.get(1 as NSNumber) === first)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get(99 as NSNumber))
  }

  func testTake_removesAndReturns() {
    let value = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: value))
    XCTAssertTrue(storage.take(1 as NSNumber) === value)
    XCTAssertNil(storage.get(1 as NSNumber))
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take(99 as NSNumber))
  }

  func testTakeAll_returnsRemainingAndClears() {
    let a = NSObject()
    let b = NSObject()
    XCTAssertTrue(storage.putIfAbsent(1 as NSNumber, value: a))
    XCTAssertTrue(storage.putIfAbsent(2 as NSNumber, value: b))
    let remaining = storage.takeAll()
    XCTAssertEqual(remaining.count, 2)
    XCTAssertTrue(remaining.contains { $0 === a })
    XCTAssertTrue(remaining.contains { $0 === b })
    XCTAssertNil(storage.get(1 as NSNumber))
    XCTAssertNil(storage.get(2 as NSNumber))
  }

  func testTakeAll_empty_returnsEmpty() {
    XCTAssertEqual(storage.takeAll().count, 0)
  }
}
