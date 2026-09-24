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
import XCTest

final class RNFBCrashlyticsDebuggerProbeTests: XCTestCase {

  override func setUp() {
    super.setUp()
    RNFBCrashlyticsDebuggerProbe.resetForTesting()
  }

  override func tearDown() {
    RNFBCrashlyticsDebuggerProbe.resetForTesting()
    super.tearDown()
  }

  /// Writes a `kinfo_proc` with the given `p_flag` and returns 0 (success).
  private func successProbe(pFlag: Int32) -> RNFBCrashlyticsDebuggerProbe.SysctlProbe {
    { name, namelen, oldp, oldlenp, _, _ in
      XCTAssertEqual(namelen, 4)
      XCTAssertEqual(name[0], CTL_KERN)
      XCTAssertEqual(name[1], KERN_PROC)
      XCTAssertEqual(name[2], KERN_PROC_PID)
      XCTAssertEqual(name[3], getpid())
      guard let oldp else {
        return -1
      }
      var info = kinfo_proc()
      info.kp_proc.p_flag = pFlag
      oldp.assumingMemoryBound(to: kinfo_proc.self).pointee = info
      oldlenp.pointee = MemoryLayout<kinfo_proc>.size
      return 0
    }
  }

  /// Returns -1 after setting `errno` (sysctl failure path).
  private func failureProbe(errnoValue: Int32, pFlag: Int32 = 0) -> RNFBCrashlyticsDebuggerProbe
    .SysctlProbe
  {
    { _, _, oldp, oldlenp, _, _ in
      if let oldp {
        var info = kinfo_proc()
        info.kp_proc.p_flag = pFlag
        oldp.assumingMemoryBound(to: kinfo_proc.self).pointee = info
        oldlenp.pointee = MemoryLayout<kinfo_proc>.size
      }
      errno = errnoValue
      return -1
    }
  }

  func testPublicPath_liveSysctl_returnsBoolWithoutCrash() {
    // Exercises default Darwin.sysctl + once-cache. Under LLDB this may be true;
    // on a non-debugged CI host it is typically false — do not assert the value.
    _ = RNFBCrashlyticsDebuggerProbe.isDebuggerAttached()
    // Second call must hit the once-cache return path.
    _ = RNFBCrashlyticsDebuggerProbe.isDebuggerAttached()
  }

  func testEvaluate_notTraced_returnsFalse() {
    let result = RNFBCrashlyticsDebuggerProbe.evaluateUncachedForTesting(
      using: successProbe(pFlag: 0))
    XCTAssertFalse(result)
  }

  func testEvaluate_pTraced_returnsTrue() {
    let result = RNFBCrashlyticsDebuggerProbe.evaluateUncachedForTesting(
      using: successProbe(pFlag: P_TRACED))
    XCTAssertTrue(result)
  }

  func testEvaluate_sysctlFailure_logsAndReturnsFalse() {
    let result = RNFBCrashlyticsDebuggerProbe.evaluateUncachedForTesting(
      using: failureProbe(errnoValue: EINVAL, pFlag: 0))
    XCTAssertFalse(result)
  }

  func testEvaluate_sysctlFailureWithTracedBit_stillTrueMatchingPrePortFallthrough() {
    // Pre-port control flow still inspects P_TRACED after a failed sysctl.
    let result = RNFBCrashlyticsDebuggerProbe.evaluateUncachedForTesting(
      using: failureProbe(errnoValue: EFAULT, pFlag: P_TRACED))
    XCTAssertTrue(result)
  }

  func testOnceCache_secondCallSkipsProbe() {
    var probeCount = 0
    let counting: RNFBCrashlyticsDebuggerProbe.SysctlProbe = { name, namelen, oldp, oldlenp, newp,
      newlen in
      probeCount += 1
      return self.successProbe(pFlag: 0)(name, namelen, oldp, oldlenp, newp, newlen)
    }
    RNFBCrashlyticsDebuggerProbe.sysctlImpl = counting
    XCTAssertFalse(RNFBCrashlyticsDebuggerProbe.isDebuggerAttached())
    XCTAssertFalse(RNFBCrashlyticsDebuggerProbe.isDebuggerAttached())
    XCTAssertEqual(probeCount, 1)
  }
}
