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
 * Log-level string → `FIRLoggerLevel` raw-value mapping previously inline in
 * `-[RNFBAppModule setLogLevel:]`.
 *
 * Mirrors pre-port (`FIRLoggerLevel` raw values from FirebaseCore):
 * - `"verbose"` / `"debug"` → `FIRLoggerLevelDebug` (7)
 * - `"info"` → `FIRLoggerLevelInfo` (6)
 * - `"warn"` → `FIRLoggerLevelWarning` (4)
 * - else (including nil / unknown) → `FIRLoggerLevelError` (3)
 */
@objc(RNFBAppLogLevelMapper)
public final class RNFBAppLogLevelMapper: NSObject {
  /// `FIRLoggerLevelError`
  private static let errorLevel = 3
  /// `FIRLoggerLevelWarning`
  private static let warningLevel = 4
  /// `FIRLoggerLevelInfo`
  private static let infoLevel = 6
  /// `FIRLoggerLevelDebug`
  private static let debugLevel = 7

  @objc(loggerLevelForString:)
  public static func loggerLevel(forString logLevel: String?) -> Int {
    switch logLevel {
    case "verbose", "debug":
      return debugLevel
    case "info":
      return infoLevel
    case "warn":
      return warningLevel
    default:
      return errorLevel
    }
  }
}
