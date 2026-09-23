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
 * Process-wide custom auth-domain store previously owned by `RNFBAppModule.mm`
 * (`static NSMutableDictionary *customAuthDomains`).
 *
 * Mirrors pre-port:
 * - set non-nil → store under `appName` (lazy-init dictionary on first non-nil set)
 * - set nil → `removeObject(forKey:)` (no-op when dictionary is still nil)
 * - get → dictionary lookup (nil if missing / dictionary unset)
 * - synchronized on a dedicated lock (pre-port `@synchronized(self)` on class methods)
 */
@objc(RNFBAppCustomAuthDomains)
public final class RNFBAppCustomAuthDomains: NSObject {
  private static let lock = NSObject()
  private static var customAuthDomains: NSMutableDictionary?

  @objc(getCustomDomain:)
  public static func getCustomDomain(_ appName: String) -> String? {
    objc_sync_enter(lock)
    defer { objc_sync_exit(lock) }
    return customAuthDomains?[appName] as? String
  }

  @objc(setCustomDomain:forAppName:)
  public static func setCustomDomain(_ authDomain: String?, forAppName appName: String) {
    objc_sync_enter(lock)
    defer { objc_sync_exit(lock) }
    if let authDomain {
      if customAuthDomains == nil {
        customAuthDomains = NSMutableDictionary()
      }
      customAuthDomains![appName] = authDomain
    } else {
      // Pre-port: messaging nil dictionary is a no-op.
      customAuthDomains?.removeObject(forKey: appName)
    }
  }

  /// Clears all stored domains. Unit-test / HostStub seam only.
  @objc(resetCustomDomainsForTesting)
  public static func resetCustomDomainsForTesting() {
    objc_sync_enter(lock)
    defer { objc_sync_exit(lock) }
    customAuthDomains?.removeAllObjects()
  }
}
