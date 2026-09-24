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
 * Messaging serializer mapping previously implemented in `RNFBMessagingSerializer.m`.
 *
 * Pre-port contracts:
 * - APNS token string ↔ data hex (lowercase parse, uppercase `%02.2hhX` format)
 * - FCM `userInfo` → JS remote-message dictionary shape
 * - `RCTConvert BOOL:` was `[json boolValue]` — replicated without linking React
 */
@objc(RNFBMessagingSerializerStorage)
public final class RNFBMessagingSerializerStorage: NSObject {
  /// Matches `RCTConvert` `BOOL:` (`[json boolValue]`).
  private static func rnBool(_ json: Any) -> Bool {
    if let number = json as? NSNumber {
      return number.boolValue
    }
    // NSString bridges to String.
    if let string = json as? String {
      return (string as NSString).boolValue
    }
    return false
  }

  /// Matches ObjC `[json intValue]`.
  private static func rnInt(_ json: Any) -> Int32 {
    if let number = json as? NSNumber {
      return number.int32Value
    }
    if let string = json as? String {
      return (string as NSString).intValue
    }
    return 0
  }

  @objc(APNSTokenDataFromNSString:)
  public static func apnsTokenData(from token: String) -> Data? {
    let string = token.lowercased()
    let length = string.count
    if length == 0 || length % 2 != 0 {
      return nil
    }

    var data = Data(count: length / 2)
    let chars = Array(string.utf16)
    for i in stride(from: 0, to: length, by: 2) {
      let highCharacter = chars[i]
      let lowCharacter = chars[i + 1]
      if (highCharacter < 0x30 || (highCharacter > 0x39 && highCharacter < 0x61) ||
        highCharacter > 0x66) ||
        (lowCharacter < 0x30 || (lowCharacter > 0x39 && lowCharacter < 0x61) ||
          lowCharacter > 0x66)
      {
        return nil
      }

      let high: UInt8 =
        highCharacter <= 0x39
        ? UInt8(highCharacter - 0x30)
        : UInt8(highCharacter - 0x61 + 10)
      let low: UInt8 =
        lowCharacter <= 0x39
        ? UInt8(lowCharacter - 0x30)
        : UInt8(lowCharacter - 0x61 + 10)
      data[i / 2] = (high << 4) | low
    }
    return data
  }

  @objc(APNSTokenFromNSData:)
  public static func apnsToken(from tokenData: Data) -> String {
    var token = String()
    tokenData.withUnsafeBytes { rawBuffer in
      let bytes = rawBuffer.bindMemory(to: UInt8.self)
      for i in 0..<tokenData.count {
        token.append(String(format: "%02.2hhX", bytes[i]))
      }
    }
    return token
  }

  @objc(remoteMessageUserInfoToDict:)
  public static func remoteMessageUserInfoToDict(_ userInfo: NSDictionary) -> NSDictionary {
    let message = NSMutableDictionary()
    let data = NSMutableDictionary()
    let notification = NSMutableDictionary()
    let notificationIOS = NSMutableDictionary()

    for key in userInfo.allKeys {
      // FCM userInfo keys are strings (pre-port used isEqualToString:).
      let keyString = key as! String
      let value = userInfo[key]

      // message.messageId
      if keyString == "gcm.message_id" || keyString == "google.message_id"
        || keyString == "message_id"
      {
        message["messageId"] = value
        continue
      }

      // message.messageType
      if keyString == "message_type" {
        message["messageType"] = value
        continue
      }

      // message.collapseKey
      if keyString == "collapse_key" {
        message["collapseKey"] = value
        continue
      }

      // message.from
      if keyString == "from" || keyString == "google.c.sender.id" {
        message["from"] = value
        continue
      }

      // message.sentTime
      if keyString == "google.c.a.ts" {
        let timestamp = value as Any
        let timestampString: String?
        if let asString = timestamp as? String {
          timestampString = asString
        } else if let asNumber = timestamp as? NSNumber {
          timestampString = asNumber.stringValue
        } else {
          timestampString = nil
        }

        var isDecimalInteger = (timestampString?.count ?? 0) > 0
        if let timestampString {
          for scalar in timestampString.unicodeScalars {
            if !isDecimalInteger {
              break
            }
            isDecimalInteger = scalar.value >= 0x30 && scalar.value <= 0x39
          }
        }

        if isDecimalInteger, let timestampString {
          let sentTimeSeconds = (timestampString as NSString).longLongValue
          if sentTimeSeconds > 0 && sentTimeSeconds <= Int64.max / 1000 {
            message["sentTime"] = NSNumber(value: sentTimeSeconds * 1000)
          }
        }
        continue
      }

      // message.to
      if keyString == "to" || keyString == "google.to" {
        message["to"] = value
        continue
      }

      // build data dict from remaining keys but skip keys that shouldn't be included in data
      if keyString == "aps" || keyString.hasPrefix("gcm.") || keyString.hasPrefix("google.") {
        continue
      }
      data[keyString] = value
    }
    message["data"] = data

    if let apsDict = userInfo["aps"] as? NSDictionary {
      // message.category
      if let category = apsDict["category"] {
        message["category"] = category
      }

      // message.threadId
      if let threadId = apsDict["thread-id"] {
        message["threadId"] = threadId
      }

      // message.contentAvailable
      if let contentAvailable = apsDict["content-available"] {
        message["contentAvailable"] = NSNumber(value: rnBool(contentAvailable))
      }

      // message.mutableContent
      if let mutableContent = apsDict["mutable-content"], rnInt(mutableContent) == 1 {
        message["mutableContent"] = NSNumber(value: rnBool(mutableContent))
      }

      // iOS only — message.notification.ios.badge
      if let badge = apsDict["badge"] {
        notificationIOS["badge"] = (badge as AnyObject).description
      }

      // message.notification.*
      if let alert = apsDict["alert"] {
        if let alertString = alert as? String {
          notification["title"] = alertString
        } else if let apsAlertDict = alert as? NSDictionary {
          if let title = apsAlertDict["title"] {
            notification["title"] = title
          }
          if let titleLocKey = apsAlertDict["title-loc-key"] {
            notification["titleLocKey"] = titleLocKey
          }
          if let titleLocArgs = apsAlertDict["title-loc-args"] {
            notification["titleLocArgs"] = titleLocArgs
          }
          if let body = apsAlertDict["body"] {
            notification["body"] = body
          }
          if let bodyLocKey = apsAlertDict["loc-key"] {
            notification["bodyLocKey"] = bodyLocKey
          }
          if let bodyLocArgs = apsAlertDict["loc-args"] {
            notification["bodyLocArgs"] = bodyLocArgs
          }
          if let subtitle = apsAlertDict["subtitle"] {
            notificationIOS["subtitle"] = subtitle
          }
          if let subtitleLocKey = apsAlertDict["subtitle-loc-key"] {
            notificationIOS["subtitleLocKey"] = subtitleLocKey
          }
          if let subtitleLocArgs = apsAlertDict["subtitle-loc-args"] {
            notificationIOS["subtitleLocArgs"] = subtitleLocArgs
          }
        }
      }

      // message.notification.ios.sound
      if let sound = apsDict["sound"] {
        if let soundString = sound as? String {
          notificationIOS["sound"] = soundString
        } else if let apsSoundDict = sound as? NSDictionary {
          let notificationIOSSound = NSMutableDictionary()
          if let name = apsSoundDict["name"] {
            notificationIOSSound["name"] = name
          }
          if let critical = apsSoundDict["critical"] {
            notificationIOSSound["critical"] = NSNumber(value: rnBool(critical))
          }
          if let volume = apsSoundDict["volume"] {
            notificationIOSSound["volume"] = volume
          }
          notificationIOS["sound"] = notificationIOSSound
        }
      }
    }

    if notificationIOS.count > 0 {
      notification["ios"] = notificationIOS
    }
    if notification.count > 0 {
      message["notification"] = notification
    }

    return message
  }
}
