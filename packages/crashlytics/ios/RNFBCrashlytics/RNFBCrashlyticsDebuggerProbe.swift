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

import Darwin
import Foundation

/**
 * Debugger-attach detection previously inline in `RNFBCrashlyticsModule.mm`
 * (`-isDebuggerAttached`).
 *
 * Pre-port contracts:
 * - Once-token / dispatch_once-style caching of the result
 * - `sysctl` `CTL_KERN` / `KERN_PROC` / `KERN_PROC_PID` / `getpid()` → `kinfo_proc`
 * - `sysctl` failure → ELog-equivalent + treat as not attached (then still evaluate
 *   `P_TRACED` on the returned buffer, matching the pre-port control flow)
 * - `P_TRACED` bit set → true
 *
 * Foundation + Darwin only so unit tests do not link Firebase / React.
 */
@objc(RNFBCrashlyticsDebuggerProbe)
public final class RNFBCrashlyticsDebuggerProbe: NSObject {

  /// Injectable `sysctl` seam for unit tests. Production uses `makeDefaultSysctl()`.
  typealias SysctlProbe = (
    _ name: UnsafeMutablePointer<Int32>,
    _ namelen: u_int,
    _ oldp: UnsafeMutableRawPointer?,
    _ oldlenp: UnsafeMutablePointer<Int>,
    _ newp: UnsafeMutableRawPointer?,
    _ newlen: Int
  ) -> Int32

  private static let lock = NSLock()
  private static var cachedResult: Bool?
  /// Mirrors `static dispatch_once_t` — evaluate at most once in production path.
  private static var onceTokenConsumed = false

  /// Test hook: replace `sysctl`. Restored by `resetForTesting()`.
  static var sysctlImpl: SysctlProbe = makeDefaultSysctl()

  private static func makeDefaultSysctl() -> SysctlProbe {
    { name, namelen, oldp, oldlenp, newp, newlen in
      Darwin.sysctl(name, namelen, oldp, oldlenp, newp, newlen)
    }
  }

  /// Pre-port `-isDebuggerAttached` (once-cached).
  @objc
  public static func isDebuggerAttached() -> Bool {
    lock.lock()
    defer { lock.unlock() }
    if onceTokenConsumed, let cached = cachedResult {
      return cached
    }
    let value = evaluateIsDebuggerAttached(using: sysctlImpl)
    cachedResult = value
    onceTokenConsumed = true
    return value
  }

  /// Clears once-cache and restores the default `sysctl` implementation (tests only).
  static func resetForTesting() {
    lock.lock()
    defer { lock.unlock() }
    cachedResult = nil
    onceTokenConsumed = false
    sysctlImpl = makeDefaultSysctl()
  }

  /// Evaluates without consuming the production once-cache (tests only).
  static func evaluateUncachedForTesting(using probe: SysctlProbe) -> Bool {
    evaluateIsDebuggerAttached(using: probe)
  }

  /// Core logic matching the pre-port `dispatch_once` body.
  private static func evaluateIsDebuggerAttached(using probe: SysctlProbe) -> Bool {
    var debuggerIsAttached = false

    var info = kinfo_proc()
    var infoSize = MemoryLayout<kinfo_proc>.size
    var name: [Int32] = [
      CTL_KERN,
      KERN_PROC,
      KERN_PROC_PID,
      getpid(),
    ]

    // `name` is always 4 elements — `baseAddress` is non-nil.
    let sysctlResult = name.withUnsafeMutableBufferPointer { nameBuf -> Int32 in
      probe(nameBuf.baseAddress!, 4, &info, &infoSize, nil, 0)
    }

    if sysctlResult == -1 {
      // ELog is NSLog with function/line prefix (RNFBSharedUtils.h).
      let err = String(cString: strerror(errno))
      NSLog(
        "%@ [Line %d] Crashlytics ERROR: Checking for a running debugger via sysctl() failed: %@",
        #function, #line, err)
      debuggerIsAttached = false
    }

    if !debuggerIsAttached && (info.kp_proc.p_flag & P_TRACED) != 0 {
      debuggerIsAttached = true
    }

    return debuggerIsAttached
  }
}
