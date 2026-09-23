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
 * Subset of `FIRTrace` metric/attribute setters used by
 * `-[RNFBPerfModule stopTrace:traceData:]`. Protocol-shaped so unit tests can
 * stub without linking FirebasePerformance.
 */
@objc public protocol RNFBPerfTraceApplying: AnyObject {
  @objc(setIntValue:forMetric:)
  func setIntValue(_ value: Int64, forMetric metricName: String)

  @objc(setValue:forAttribute:)
  func setValue(_ value: String, forAttribute attributeName: String)
}

/**
 * Applies `metrics` then `attributes` dictionaries previously enumerated inline
 * in `-[RNFBPerfModule stopTrace:traceData:]`.
 *
 * Pre-port contracts:
 * - metrics: `[trace setIntValue:[value longLongValue] forMetric:metricName]`
 * - attributes: `[trace setValue:value forAttribute:attributeName]`
 * - nil / missing dictionaries → empty (no crash)
 * - order: metrics first, then attributes
 */
@objc(RNFBPerfTraceStopApplier)
public final class RNFBPerfTraceStopApplier: NSObject {
  @objc(applyMetrics:attributes:to:)
  public static func apply(
    metrics: NSDictionary?,
    attributes: NSDictionary?,
    to trace: RNFBPerfTraceApplying
  ) {
    if let metrics {
      metrics.enumerateKeysAndObjects { key, value, _ in
        guard let metricName = key as? String, let number = value as? NSNumber else {
          return
        }
        trace.setIntValue(number.int64Value, forMetric: metricName)
      }
    }

    if let attributes {
      attributes.enumerateKeysAndObjects { key, value, _ in
        guard let attributeName = key as? String, let stringValue = value as? String else {
          return
        }
        trace.setValue(stringValue, forAttribute: attributeName)
      }
    }
  }
}
