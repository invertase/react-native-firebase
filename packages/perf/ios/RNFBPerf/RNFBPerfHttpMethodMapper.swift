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
 * HTTP method string → `FIRHTTPMethod` raw-value mapping previously inline in
 * `-[RNFBPerfModule startHttpMetric:url:httpMethod:]`.
 *
 * Mirrors pre-port (case-insensitive `compare:`; successive ifs; default GET).
 * Raw ints from Firebase Performance `FIRHTTPMethod` (`FIRHTTPMetric.h`):
 * - GET = 0, PUT = 1, POST = 2, DELETE = 3, HEAD = 4
 * - PATCH = 5, OPTIONS = 6, TRACE = 7, CONNECT = 8
 *
 * Unknown / empty / nil / `"get"` → GET (no explicit GET branch).
 */
@objc(RNFBPerfHttpMethodMapper)
public final class RNFBPerfHttpMethodMapper: NSObject {
  /// `FIRHTTPMethodGET`
  private static let getMethod = 0
  /// `FIRHTTPMethodPUT`
  private static let putMethod = 1
  /// `FIRHTTPMethodPOST`
  private static let postMethod = 2
  /// `FIRHTTPMethodDELETE`
  private static let deleteMethod = 3
  /// `FIRHTTPMethodHEAD`
  private static let headMethod = 4
  /// `FIRHTTPMethodPATCH`
  private static let patchMethod = 5
  /// `FIRHTTPMethodOPTIONS`
  private static let optionsMethod = 6
  /// `FIRHTTPMethodTRACE`
  private static let traceMethod = 7
  /// `FIRHTTPMethodCONNECT`
  private static let connectMethod = 8

  @objc(httpMethodRawValueForString:)
  public static func httpMethodRawValue(forString httpMethod: String?) -> Int {
    var method = getMethod
    guard let httpMethod else {
      return method
    }

    // Successive case-insensitive compares (not else-if) — same outcome for
    // single method strings; preserves pre-port control flow.
    if httpMethod.caseInsensitiveCompare("put") == .orderedSame {
      method = putMethod
    }
    if httpMethod.caseInsensitiveCompare("post") == .orderedSame {
      method = postMethod
    }
    if httpMethod.caseInsensitiveCompare("head") == .orderedSame {
      method = headMethod
    }
    if httpMethod.caseInsensitiveCompare("trace") == .orderedSame {
      method = traceMethod
    }
    if httpMethod.caseInsensitiveCompare("patch") == .orderedSame {
      method = patchMethod
    }
    if httpMethod.caseInsensitiveCompare("delete") == .orderedSame {
      method = deleteMethod
    }
    if httpMethod.caseInsensitiveCompare("options") == .orderedSame {
      method = optionsMethod
    }
    if httpMethod.caseInsensitiveCompare("connect") == .orderedSame {
      method = connectMethod
    }
    return method
  }
}
