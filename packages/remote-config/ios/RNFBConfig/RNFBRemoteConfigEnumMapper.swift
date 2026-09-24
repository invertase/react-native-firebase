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
 * FIRRemoteConfig enum raw value → JS string mapping previously held as
 * static C converters in `RNFBConfigHelper.m`.
 *
 * Called from `RNFBConfigHelper` fetch / constants / config-update paths.
 *
 * Raw ints from Firebase Remote Config `FIRRemoteConfig.h`
 * (`FIRRemoteConfigFetchStatus`, `FIRRemoteConfigSource`,
 * `FIRRemoteConfigUpdateError`). Hardcoded so the Remote Config unit target
 * does not need FirebaseRemoteConfig.
 */
@objc(RNFBRemoteConfigEnumMapper)
public final class RNFBRemoteConfigEnumMapper: NSObject {
  // MARK: - FIRRemoteConfigFetchStatus (`NS_ENUM` from 0)

  /// `FIRRemoteConfigFetchStatusNoFetchYet`
  private static let fetchStatusNoFetchYet = 0
  /// `FIRRemoteConfigFetchStatusSuccess`
  private static let fetchStatusSuccess = 1
  /// `FIRRemoteConfigFetchStatusFailure`
  private static let fetchStatusFailure = 2
  /// `FIRRemoteConfigFetchStatusThrottled`
  private static let fetchStatusThrottled = 3

  // MARK: - FIRRemoteConfigSource (`NS_ENUM` from 0)

  /// `FIRRemoteConfigSourceRemote`
  private static let sourceRemote = 0
  /// `FIRRemoteConfigSourceDefault`
  private static let sourceDefault = 1
  /// `FIRRemoteConfigSourceStatic`
  private static let sourceStatic = 2

  // MARK: - FIRRemoteConfigUpdateError (`NS_ERROR_ENUM`)

  /// `FIRRemoteConfigUpdateErrorStreamError`
  private static let updateErrorStreamError = 8001
  /// `FIRRemoteConfigUpdateErrorNotFetched`
  private static let updateErrorNotFetched = 8002
  /// `FIRRemoteConfigUpdateErrorMessageInvalid`
  private static let updateErrorMessageInvalid = 8003
  /// `FIRRemoteConfigUpdateErrorUnavailable`
  private static let updateErrorUnavailable = 8004

  private static let throttledDescription =
    "fetch() operation cannot be completed successfully, due to throttling."
  private static let defaultFetchFailureDescription =
    "fetch() operation cannot be completed successfully."

  @objc(stringForFetchStatus:)
  public static func string(forFetchStatus status: Int) -> String {
    switch status {
    case fetchStatusNoFetchYet:
      return "no_fetch_yet"
    case fetchStatusSuccess:
      return "success"
    case fetchStatusThrottled:
      return "throttled"
    case fetchStatusFailure:
      return "failure"
    default:
      return "unknown"
    }
  }

  /// Pre-port: throttled has a dedicated message; `NoFetchYet` and all other
  /// statuses share the default failure description.
  @objc(descriptionForFetchStatus:)
  public static func description(forFetchStatus status: Int) -> String {
    switch status {
    case fetchStatusThrottled:
      return throttledDescription
    default:
      return defaultFetchFailureDescription
    }
  }

  @objc(stringForSource:)
  public static func string(forSource source: Int) -> String {
    switch source {
    case sourceDefault:
      return "default"
    case sourceRemote:
      return "remote"
    case sourceStatic:
      return "static"
    default:
      return "unknown"
    }
  }

  @objc(stringForUpdateError:)
  public static func string(forUpdateError code: Int) -> String {
    switch code {
    case updateErrorStreamError:
      return "config_update_stream_error"
    case updateErrorMessageInvalid:
      return "config_update_message_invalid"
    case updateErrorNotFetched:
      return "config_update_not_fetched"
    case updateErrorUnavailable:
      return "config_update_unavailable"
    default:
      return "internal"
    }
  }
}
