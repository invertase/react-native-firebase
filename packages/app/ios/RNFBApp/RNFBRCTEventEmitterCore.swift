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

/// Bridge-present check previously hard-wired to `self.bridge != nil`.
public typealias RNFBRCTEventEmitterBridgePresent = () -> Bool

/// Bridge emit previously hard-wired to `enqueueJSCall` (unprefixed event name + body).
public typealias RNFBRCTEventEmitterEmitHandler = (String, Any?) -> Void

/**
 * Queue / listener state previously inline in `RNFBRCTEventEmitter.m`.
 *
 * Mirrors pre-port:
 * - `isObserving` = `jsReady && jsListenerCount > 0`
 * - emit when bridge present && observing && listener registered; else queue `{name,body}`
 * - `notifyJsReady(true)` / `addListener` flush matching queued events via `sendEvent`
 * - `@synchronized(jsListeners)` / `@synchronized(queuedEvents)` via `objc_sync_*`
 */
@objc(RNFBRCTEventEmitterCore)
public final class RNFBRCTEventEmitterCore: NSObject {
  @objc public static let eventNameKey = "name"
  @objc public static let eventBodyKey = "body"

  private var jsReady = false
  private var jsListenerCount = 0
  private var jsListeners = NSMutableDictionary()
  private var queuedEvents = NSMutableArray()

  private let isBridgePresent: RNFBRCTEventEmitterBridgePresent
  private let emitHandler: RNFBRCTEventEmitterEmitHandler

  @objc(initWithIsBridgePresent:emitHandler:)
  public init(
    isBridgePresent: @escaping RNFBRCTEventEmitterBridgePresent,
    emitHandler: @escaping RNFBRCTEventEmitterEmitHandler
  ) {
    self.isBridgePresent = isBridgePresent
    self.emitHandler = emitHandler
    super.init()
  }

  @objc public func invalidate() {
    jsReady = false
    queuedEvents = NSMutableArray()
    jsListeners = NSMutableDictionary()
    jsListenerCount = 0
  }

  @objc(notifyJsReady:)
  public func notifyJsReady(_ ready: Bool) {
    objc_sync_enter(jsListeners)
    defer { objc_sync_exit(jsListeners) }

    jsReady = ready
    if ready {
      for case let event as NSDictionary in queuedEvents.copy() as! NSArray {
        let name = event[Self.eventNameKey] as! String
        let body = event[Self.eventBodyKey]
        sendEvent(name: name, body: body)
        objc_sync_enter(queuedEvents)
        queuedEvents.remove(event)
        objc_sync_exit(queuedEvents)
      }
    }
  }

  @objc(sendEventWithName:body:)
  public func sendEvent(name eventName: String, body: Any?) {
    objc_sync_enter(jsListeners)
    defer { objc_sync_exit(jsListeners) }

    if isBridgePresent(), isObserving, jsListeners[eventName] != nil {
      emitHandler(eventName, body)
    } else {
      objc_sync_enter(queuedEvents)
      let entry = NSMutableDictionary()
      entry[Self.eventNameKey] = eventName
      entry[Self.eventBodyKey] = body
      queuedEvents.add(entry)
      objc_sync_exit(queuedEvents)
    }
  }

  @objc(addListener:)
  public func addListener(_ eventName: String) {
    objc_sync_enter(jsListeners)
    defer { objc_sync_exit(jsListeners) }

    jsListenerCount += 1

    if jsListeners[eventName] == nil {
      jsListeners[eventName] = NSNumber(value: 1)
    } else {
      let current = (jsListeners[eventName] as! NSNumber).intValue
      jsListeners[eventName] = NSNumber(value: current + 1)
    }

    for case let event as NSDictionary in queuedEvents.copy() as! NSArray {
      if (event[Self.eventNameKey] as? String) == eventName {
        let body = event[Self.eventBodyKey]
        sendEvent(name: eventName, body: body)
        objc_sync_enter(queuedEvents)
        queuedEvents.remove(event)
        objc_sync_exit(queuedEvents)
      }
    }
  }

  @objc(removeListeners:all:)
  public func removeListeners(_ eventName: String, all: Bool) {
    objc_sync_enter(jsListeners)
    defer { objc_sync_exit(jsListeners) }

    if jsListeners[eventName] != nil {
      let listenersForEvent = (jsListeners[eventName] as! NSNumber).intValue

      if listenersForEvent <= 1 || all {
        objc_sync_enter(jsListeners)
        jsListeners.removeObject(forKey: eventName)
        objc_sync_exit(jsListeners)
      } else {
        objc_sync_enter(jsListeners)
        jsListeners[eventName] = NSNumber(value: listenersForEvent - 1)
        objc_sync_exit(jsListeners)
      }

      if all {
        jsListenerCount -= listenersForEvent
      } else {
        jsListenerCount -= 1
      }
    }
  }

  @objc public func getListenersDictionary() -> NSDictionary {
    let listenersDictionary = NSMutableDictionary()
    listenersDictionary["listeners"] = NSNumber(value: jsListenerCount)
    listenersDictionary["queued"] = NSNumber(value: queuedEvents.count)
    listenersDictionary["events"] = jsListeners.copy()
    return listenersDictionary
  }

  private var isObserving: Bool {
    jsReady && jsListenerCount > 0
  }
}
