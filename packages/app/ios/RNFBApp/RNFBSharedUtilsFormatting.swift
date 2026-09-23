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
 * Name/date formatting helpers previously inline in `RNFBSharedUtils.m`.
 *
 * Mirrors pre-port:
 * - `__FIRAPP_DEFAULT` → `[DEFAULT]` for JS app names
 * - ISO-8601 via POSIX/`UTC` formatter + trailing `Z` (no fractional seconds)
 */
@objc(RNFBSharedUtilsFormatting)
public final class RNFBSharedUtilsFormatting: NSObject {
  /// Matches `DEFAULT_APP_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppName = "__FIRAPP_DEFAULT"
  /// Matches `DEFAULT_APP_DISPLAY_NAME` in `RNFBSharedUtils.m`.
  private static let defaultAppDisplayName = "[DEFAULT]"

  private static let iso8601Formatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone(abbreviation: "UTC")
    formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
    return formatter
  }()

  @objc(getAppJavaScriptName:)
  public static func getAppJavaScriptName(_ appDisplayName: String?) -> String? {
    guard let appDisplayName else {
      return nil
    }
    if appDisplayName == defaultAppName {
      return defaultAppDisplayName
    }
    return appDisplayName
  }

  @objc(getISO8601String:)
  public static func getISO8601String(_ date: Date?) -> String? {
    guard let date else {
      return nil
    }
    return iso8601Formatter.string(from: date) + "Z"
  }
}
