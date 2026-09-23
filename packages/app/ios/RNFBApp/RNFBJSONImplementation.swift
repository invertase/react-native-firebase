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

@objc(RNFBJSONImplementation)
public final class RNFBJSONImplementation: NSObject {
  private let firebaseJSON: NSObject

  @objc(initWithRawValue:)
  public init(rawValue: String?) {
    guard
      let rawValue,
      let data = Data(base64Encoded: rawValue),
      let object = try? JSONSerialization.jsonObject(with: data),
      let firebaseJSON = object as? NSObject
    else {
      self.firebaseJSON = NSDictionary()
      super.init()
      return
    }

    self.firebaseJSON = firebaseJSON
    super.init()
  }

  @objc(initWithJSONObject:)
  public init(jsonObject: NSObject) {
    firebaseJSON = jsonObject
    super.init()
  }

  @objc(contains:)
  public func contains(_ key: String) -> Bool {
    firebaseJSON.value(forKey: key) != nil
  }

  @objc(valueForKey:defaultValue:)
  public func value(forKey key: String, defaultValue: AnyObject?) -> AnyObject? {
    firebaseJSON.value(forKey: key) as AnyObject? ?? defaultValue
  }

  @objc
  public func jsonObject() -> NSObject {
    firebaseJSON
  }

  @objc(rawJSONFromRawValue:)
  public static func rawJSON(from rawValue: String?) -> String? {
    guard let rawValue else {
      return "{}"
    }
    guard let data = Data(base64Encoded: rawValue) else {
      return nil
    }
    return String(data: data, encoding: .utf8)
  }
}
