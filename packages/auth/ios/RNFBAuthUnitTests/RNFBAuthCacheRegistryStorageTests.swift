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

final class RNFBAuthCacheRegistryStorageTests: XCTestCase {
  private var storage: RNFBAuthCacheRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBAuthCacheRegistryStorage()
  }

  func testPutOrDiscard_storesWhenFree() {
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: "payload" as NSString))
    XCTAssertEqual(storage.get("k1" as NSString) as? NSString, "payload")
  }

  func testPutOrDiscard_collision_keepsExisting() {
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: "first" as NSString))
    XCTAssertFalse(storage.putOrDiscard("k1" as NSString, value: "second" as NSString))
    XCTAssertEqual(storage.get("k1" as NSString) as? NSString, "first")
  }

  func testPutReplacing_whenFree_returnsNil() {
    XCTAssertNil(storage.putReplacing("k1" as NSString, value: "payload" as NSString))
    XCTAssertEqual(storage.get("k1" as NSString) as? NSString, "payload")
  }

  func testPutReplacing_whenOccupied_returnsDisplaced() {
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: "first" as NSString))
    let displaced = storage.putReplacing("k1" as NSString, value: "second" as NSString)
    XCTAssertEqual(displaced as? NSString, "first")
    XCTAssertEqual(storage.get("k1" as NSString) as? NSString, "second")
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get("missing" as NSString))
  }

  func testTake_removesAndReturns() {
    XCTAssertTrue(storage.putOrDiscard("k1" as NSString, value: "payload" as NSString))
    XCTAssertEqual(storage.take("k1" as NSString) as? NSString, "payload")
    XCTAssertNil(storage.get("k1" as NSString))
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take("missing" as NSString))
  }

  func testTakeAll_returnsSnapshotAndLeavesEmpty() {
    XCTAssertTrue(storage.putOrDiscard("a" as NSString, value: "1" as NSString))
    XCTAssertTrue(storage.putOrDiscard("b" as NSString, value: "2" as NSString))
    let remaining = storage.takeAll()
    XCTAssertEqual(remaining.count, 2)
    XCTAssertNil(storage.get("a" as NSString))
    XCTAssertNil(storage.get("b" as NSString))
  }
}
