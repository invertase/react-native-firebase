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

/**
 * Foundation-friendly Analytics JS param helpers previously inlined in
 * `RNFBAnalyticsModule.mm`.
 *
 * Pre-port contracts:
 * - NSNull over the bridge → nil (`convertNSNullToNil`)
 * - 64 hex chars → 32-byte `Data` or nil (`dataFromSHA256HexString`)
 * - Long-numeric GA4 keys coerced via `integerValue`
 * - `success` string/bool coercion to 0/1 `NSNumber`
 * - `extend_session` `@1` → `@YES`
 *
 * Parameter key strings match Firebase Analytics `kFIRParameter*` values
 * (Foundation-only so unit tests do not link the Analytics SDK).
 */
@objc(RNFBAnalyticsJavascriptParamsCleaner)
public final class RNFBAnalyticsJavascriptParamsCleaner: NSObject {
  // MARK: - Firebase Analytics parameter key strings (kFIRParameter*)

  private static let parameterQuantity = "quantity"
  private static let parameterIndex = "index"
  private static let parameterLevel = "level"
  private static let parameterNumberOfNights = "number_of_nights"
  private static let parameterNumberOfPassengers = "number_of_passengers"
  private static let parameterNumberOfRooms = "number_of_rooms"
  private static let parameterScore = "score"
  private static let parameterItems = "items"
  private static let parameterSuccess = "success"
  private static let parameterExtendSession = "extend_session"

  /// Same keys as pre-port `RNFBAnalyticsLongNumericParameterKeys`.
  @objc public static var longNumericParameterKeys: [String] {
    [
      parameterQuantity,
      parameterIndex,
      parameterLevel,
      parameterNumberOfNights,
      parameterNumberOfPassengers,
      parameterNumberOfRooms,
      parameterScore,
    ]
  }

  // MARK: - NSNull bridge

  /// Converts null values received over the bridge from NSNull to nil.
  @objc(convertNSNullToNil:)
  public static func convertNSNullToNil(_ value: Any?) -> String? {
    // Pre-port: `[value isEqual:[NSNull null]] ? nil : value`
    if let value, (value as AnyObject).isEqual(NSNull()) {
      return nil
    }
    return value as? String
  }

  // MARK: - SHA-256 hex

  private static func hexDigit(_ character: unichar) -> Int {
    if character >= 0x30 && character <= 0x39 {
      return Int(character) - 0x30
    }
    if character >= 0x61 && character <= 0x66 {
      return Int(character) - 0x61 + 10
    }
    if character >= 0x41 && character <= 0x46 {
      return Int(character) - 0x41 + 10
    }
    return -1
  }

  /// 64 hex characters → 32-byte `Data`, or nil when length/hex is invalid.
  @objc(dataFromSHA256HexString:)
  public static func dataFromSHA256HexString(_ hexString: String?) -> Data? {
    guard let hexString, (hexString as NSString).length == 64 else {
      return nil
    }

    var bytes = [UInt8](repeating: 0, count: 32)
    let nsString = hexString as NSString
    for i in 0..<32 {
      let high = hexDigit(nsString.character(at: i * 2))
      let low = hexDigit(nsString.character(at: i * 2 + 1))
      if high < 0 || low < 0 {
        return nil
      }
      bytes[i] = UInt8((high << 4) | low)
    }
    return Data(bytes)
  }

  // MARK: - JS params cleaning

  @objc(cleanJavascriptParams:)
  public static func cleanJavascriptParams(_ params: NSDictionary?) -> NSDictionary? {
    guard let params else {
      return nil
    }
    let newParams = NSMutableDictionary(dictionary: params)

    if newParams[parameterItems] != nil {
      let newItems = NSMutableArray()
      let items = newParams[parameterItems] as! NSArray
      items.enumerateObjects { obj, _, _ in
        let item = (obj as AnyObject).mutableCopy() as! NSMutableDictionary
        coerceLongNumericParameters(in: item)
        newItems.add(item.copy())
      }
      newParams[parameterItems] = newItems.copy()
    }

    coerceLongNumericParameters(in: newParams)
    coerceSuccessParameter(in: newParams)

    if let extendSession = newParams.value(forKey: parameterExtendSession) as? NSNumber,
      extendSession.isEqual(to: NSNumber(value: 1))
    {
      newParams[parameterExtendSession] = NSNumber(value: true)
    }

    return newParams.copy() as? NSDictionary
  }

  private static func coerceLongNumericParameters(in dict: NSMutableDictionary) {
    for key in longNumericParameterKeys {
      guard let value = dict[key], !(value is NSNull) else {
        continue
      }
      // Pre-port: `dict[key] = @([value integerValue]);`
      dict[key] = NSNumber(value: (value as AnyObject).integerValue)
    }
  }

  private static func coerceSuccessParameter(in dict: NSMutableDictionary) {
    guard let value = dict[parameterSuccess], !(value is NSNull) else {
      return
    }

    var success = 0
    if let string = value as? String {
      let lower = string.lowercased()
      if lower == "true" || lower == "yes" || lower == "1" {
        success = 1
      }
    } else {
      // Pre-port: `success = [value boolValue] ? 1 : 0;`
      success = (value as AnyObject).boolValue ? 1 : 0
    }
    dict[parameterSuccess] = NSNumber(value: success)
  }
}
