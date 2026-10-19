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

private final class FakeQueryHandle: NSObject {
  private(set) var removeCount = 0
  var listeners = false

  @objc func removeAllEventListeners() {
    removeCount += 1
    listeners = false
  }

  @objc func hasListeners() -> Bool {
    listeners
  }
}

final class RNFBDatabaseQueryRegistryStorageTests: XCTestCase {
  private var storage: RNFBDatabaseQueryRegistryStorage!

  override func setUp() {
    super.setUp()
    storage = RNFBDatabaseQueryRegistryStorage()
  }

  func testPutIfAbsent_storesWhenFree() {
    let handle = FakeQueryHandle()
    XCTAssertTrue(storage.putIfAbsent("q1" as NSString, value: handle))
    XCTAssertTrue(storage.get("q1" as NSString) === handle)
  }

  func testPutIfAbsent_collision_keepsExisting() {
    let first = FakeQueryHandle()
    let second = FakeQueryHandle()
    XCTAssertTrue(storage.putIfAbsent("q1" as NSString, value: first))
    XCTAssertFalse(storage.putIfAbsent("q1" as NSString, value: second))
    XCTAssertTrue(storage.get("q1" as NSString) === first)
  }

  func testGet_whenFree_isNil() {
    XCTAssertNil(storage.get("missing" as NSString))
  }

  func testTake_removesWithoutCallingRemove() {
    let handle = FakeQueryHandle()
    XCTAssertTrue(storage.putIfAbsent("q1" as NSString, value: handle))
    XCTAssertTrue(storage.take("q1" as NSString) === handle)
    XCTAssertNil(storage.get("q1" as NSString))
    XCTAssertEqual(handle.removeCount, 0)
  }

  func testTake_whenFree_isNil() {
    XCTAssertNil(storage.take("missing" as NSString))
  }

  func testTakeIfIdle_whenNoListeners_takes() {
    let handle = FakeQueryHandle()
    handle.listeners = false
    XCTAssertTrue(storage.putIfAbsent("q" as NSString, value: handle))
    XCTAssertTrue(storage.takeIfIdle("q" as NSString) === handle)
    XCTAssertNil(storage.get("q" as NSString))
    XCTAssertEqual(handle.removeCount, 0)
  }

  func testTakeIfIdle_whenHasListeners_leavesMapping() {
    let handle = FakeQueryHandle()
    handle.listeners = true
    XCTAssertTrue(storage.putIfAbsent("q" as NSString, value: handle))
    XCTAssertNil(storage.takeIfIdle("q" as NSString))
    XCTAssertTrue(storage.get("q" as NSString) === handle)
  }

  func testTakeIfIdle_whenMissing_isNil() {
    XCTAssertNil(storage.takeIfIdle("missing" as NSString))
  }

  func testTakeIfIdle_objectWithoutHasListeners_leavesMapping() {
    let plain = NSObject()
    XCTAssertTrue(storage.putIfAbsent("p" as NSString, value: plain))
    XCTAssertNil(storage.takeIfIdle("p" as NSString))
    XCTAssertTrue(storage.get("p" as NSString) === plain)
  }

  func testTakeIfIdle_putBackWhenListenersAppearAfterTake() {
    let gated = PutBackGatedQueryHandle()
    gated.listeners = false
    gated.onSecondHasListenersEnter = {
      gated.listeners = true
    }
    XCTAssertTrue(storage.putIfAbsent("g" as NSString, value: gated))
    XCTAssertNil(storage.takeIfIdle("g" as NSString))
    XCTAssertTrue(storage.get("g" as NSString) === gated)
    XCTAssertEqual(gated.callCount, 2)
    XCTAssertEqual(gated.removeCount, 0)
  }

  func testTakeIfIdle_putBackFails_clearsOrphanListeners() {
    let orphan = PutBackGatedQueryHandle()
    orphan.listeners = false
    XCTAssertTrue(storage.putIfAbsent("q" as NSString, value: orphan))

    let replacement = FakeQueryHandle()
    replacement.listeners = true
    orphan.onSecondHasListenersEnter = { [weak self] in
      guard let self = self else { return }
      XCTAssertTrue(self.storage.putIfAbsent("q" as NSString, value: replacement))
      orphan.listeners = true
    }

    XCTAssertNil(storage.takeIfIdle("q" as NSString))
    XCTAssertTrue(storage.get("q" as NSString) === replacement)
    XCTAssertEqual(orphan.removeCount, 1)
    XCTAssertFalse(orphan.listeners)
    XCTAssertEqual(replacement.removeCount, 0)
  }

  func testRemoveAll_removesSnapshotAndLeavesEmpty() {
    let a = FakeQueryHandle()
    let b = FakeQueryHandle()
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
    XCTAssertTrue(storage.putIfAbsent("p" as NSString, value: plain))
    storage.removeAll()
    XCTAssertNil(storage.get("p" as NSString))
  }

  func testPut_afterTake_allowsReuse() {
    let first = FakeQueryHandle()
    let second = FakeQueryHandle()
    XCTAssertTrue(storage.putIfAbsent("q1" as NSString, value: first))
    XCTAssertTrue(storage.take("q1" as NSString) === first)
    XCTAssertTrue(storage.putIfAbsent("q1" as NSString, value: second))
    XCTAssertTrue(storage.get("q1" as NSString) === second)
  }
}

/// First `hasListeners` returns idle; second returns `listeners` (settable between calls).
private final class PutBackGatedQueryHandle: NSObject {
  private(set) var removeCount = 0
  private(set) var callCount = 0
  var listeners = false
  var onSecondHasListenersEnter: (() -> Void)?

  @objc func removeAllEventListeners() {
    removeCount += 1
    listeners = false
  }

  @objc func hasListeners() -> Bool {
    callCount += 1
    if callCount == 1 {
      return false
    }
    onSecondHasListenersEnter?()
    return listeners
  }
}
