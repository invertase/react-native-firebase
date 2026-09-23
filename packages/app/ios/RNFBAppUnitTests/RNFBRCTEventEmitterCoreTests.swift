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

final class RNFBRCTEventEmitterCoreTests: XCTestCase {
  private var bridgePresent = false
  private var emitted: [(String, Any?)] = []
  private var core: RNFBRCTEventEmitterCore!

  override func setUp() {
    super.setUp()
    bridgePresent = false
    emitted = []
    core = RNFBRCTEventEmitterCore(
      isBridgePresent: { [unowned self] in self.bridgePresent },
      emitHandler: { [unowned self] name, body in
        self.emitted.append((name, body))
      }
    )
  }

  override func tearDown() {
    core = nil
    super.tearDown()
  }

  func testInvalidateResetsState() {
    core.sendEvent(name: "a", body: ["x": 1])
    core.addListener("a")
    core.notifyJsReady(true)

    core.invalidate()

    let dict = core.getListenersDictionary()
    XCTAssertEqual(dict["listeners"] as? Int, 0)
    XCTAssertEqual(dict["queued"] as? Int, 0)
    XCTAssertEqual((dict["events"] as? NSDictionary)?.count, 0)
  }

  func testSendEventQueuesWhenNotReadyToEmit() {
    core.sendEvent(name: "evt", body: ["k": "v"])

    let dict = core.getListenersDictionary()
    XCTAssertEqual(dict["queued"] as? Int, 1)
    XCTAssertTrue(emitted.isEmpty)
  }

  func testSendEventEmitsWhenBridgeObservingAndRegistered() {
    bridgePresent = true
    core.notifyJsReady(true)
    core.addListener("evt")
    emitted = []

    core.sendEvent(name: "evt", body: ["k": "v"])

    XCTAssertEqual(emitted.count, 1)
    XCTAssertEqual(emitted[0].0, "evt")
    XCTAssertEqual((emitted[0].1 as? NSDictionary)?["k"] as? String, "v")
    XCTAssertEqual(core.getListenersDictionary()["queued"] as? Int, 0)
  }

  func testNotifyJsReadyFlushesQueue() {
    bridgePresent = true
    core.addListener("evt")
    core.sendEvent(name: "evt", body: ["k": 1])
    emitted = []

    core.notifyJsReady(true)

    XCTAssertEqual(emitted.count, 1)
    XCTAssertEqual(emitted[0].0, "evt")
    XCTAssertEqual(core.getListenersDictionary()["queued"] as? Int, 0)
  }

  func testAddListenerFlushesMatchingQueuedEvents() {
    bridgePresent = true
    core.notifyJsReady(true)
    core.sendEvent(name: "evt", body: ["k": 1])
    core.sendEvent(name: "other", body: ["k": 2])
    emitted = []

    core.addListener("evt")

    XCTAssertEqual(emitted.count, 1)
    XCTAssertEqual(emitted[0].0, "evt")
    XCTAssertEqual(core.getListenersDictionary()["queued"] as? Int, 1)
  }

  func testAddListenerIncrementsCounts() {
    core.addListener("evt")
    core.addListener("evt")

    let dict = core.getListenersDictionary()
    XCTAssertEqual(dict["listeners"] as? Int, 2)
    XCTAssertEqual((dict["events"] as? NSDictionary)?["evt"] as? Int, 2)
  }

  func testRemoveListenersDecrementsAndRemoves() {
    core.addListener("evt")
    core.addListener("evt")

    core.removeListeners("evt", all: false)
    XCTAssertEqual((core.getListenersDictionary()["events"] as? NSDictionary)?["evt"] as? Int, 1)
    XCTAssertEqual(core.getListenersDictionary()["listeners"] as? Int, 1)

    core.removeListeners("evt", all: false)
    XCTAssertNil((core.getListenersDictionary()["events"] as? NSDictionary)?["evt"])
    XCTAssertEqual(core.getListenersDictionary()["listeners"] as? Int, 0)
  }

  func testRemoveListenersAllRemovesEntireCount() {
    core.addListener("evt")
    core.addListener("evt")
    core.addListener("evt")

    core.removeListeners("evt", all: true)

    XCTAssertNil((core.getListenersDictionary()["events"] as? NSDictionary)?["evt"])
    XCTAssertEqual(core.getListenersDictionary()["listeners"] as? Int, 0)
  }

  func testRemoveListenersNoOpWhenMissing() {
    core.removeListeners("missing", all: true)
    XCTAssertEqual(core.getListenersDictionary()["listeners"] as? Int, 0)
  }

  func testSendEventWithNilBodyWhenEmitting() {
    bridgePresent = true
    core.notifyJsReady(true)
    core.addListener("evt")
    emitted = []

    core.sendEvent(name: "evt", body: nil)

    XCTAssertEqual(emitted.count, 1)
    XCTAssertEqual(emitted[0].0, "evt")
    XCTAssertNil(emitted[0].1)
  }

  func testIsObservingRequiresJsReady() {
    bridgePresent = true
    core.addListener("evt")
    core.sendEvent(name: "evt", body: ["k": 1])

    XCTAssertTrue(emitted.isEmpty)
    XCTAssertEqual(core.getListenersDictionary()["queued"] as? Int, 1)
  }
}
