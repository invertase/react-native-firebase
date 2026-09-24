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
 * Maps token-fetch `NSError` chains to JS reject codes previously assembled
 * inline in `RNFBAppCheckModule.mm` (`RNFBAppCheckRejectCodeForError`).
 *
 * AppCheck-AD-8 contracts:
 * - Walk `userInfo[@"code"]` and `NSUnderlyingErrorKey` (FIRAppCheck wraps
 *   non-SDK errors and may drop the top-level code)
 * - Return `provider-not-ready` if any level has that string code
 * - Else return `token-error`
 *
 * Foundation-only so unit tests do not link Firebase App Check.
 */
@objc(RNFBAppCheckRejectCodeMapper)
public final class RNFBAppCheckRejectCodeMapper: NSObject {
  /// Pre-port `RNFBAppCheckRejectCodeForError`.
  @objc(rejectCodeForError:)
  public static func rejectCode(for error: NSError?) -> NSString {
    var current: NSError? = error
    while let err = current {
      if let code = err.userInfo["code"] as? String, code == "provider-not-ready" {
        return "provider-not-ready" as NSString
      }
      let underlying = err.userInfo[NSUnderlyingErrorKey]
      if let next = underlying as? NSError {
        current = next
      } else {
        break
      }
    }
    return "token-error" as NSString
  }
}
