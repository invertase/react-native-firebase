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
 * Subset of `FIRHTTPMetric` setters used by
 * `-[RNFBPerfModule stopHttpMetric:metricData:]`. Protocol-shaped so unit tests
 * can stub without linking FirebasePerformance.
 */
@objc public protocol RNFBPerfHttpMetricApplying: AnyObject {
  @objc(setValue:forAttribute:)
  func setValue(_ value: String, forAttribute attributeName: String)

  @objc(setResponseCode:)
  func setResponseCode(_ responseCode: Int)

  @objc(setRequestPayloadSize:)
  func setRequestPayloadSize(_ bytes: Int)

  @objc(setResponsePayloadSize:)
  func setResponsePayloadSize(_ bytes: Int)

  @objc(setResponseContentType:)
  func setResponseContentType(_ contentType: String)
}

/**
 * Applies HTTP metric stop fields previously set inline in
 * `-[RNFBPerfModule stopHttpMetric:metricData:]`.
 *
 * Pre-port contracts:
 * - attributes first (`setValue:forAttribute:`), then optional responseCode,
 *   requestPayloadSize, responsePayloadSize, responseContentType
 * - missing optionals (nil NSNumber / nil content type) skipped
 * - nil attributes dict → no crash
 */
@objc(RNFBPerfHttpMetricStopApplier)
public final class RNFBPerfHttpMetricStopApplier: NSObject {
  @objc(applyAttributes:httpResponseCode:requestPayloadSize:responsePayloadSize:responseContentType:to:)
  public static func apply(
    attributes: NSDictionary?,
    httpResponseCode: NSNumber?,
    requestPayloadSize: NSNumber?,
    responsePayloadSize: NSNumber?,
    responseContentType: String?,
    to metric: RNFBPerfHttpMetricApplying
  ) {
    if let attributes {
      attributes.enumerateKeysAndObjects { key, value, _ in
        guard let attributeName = key as? String, let stringValue = value as? String else {
          return
        }
        metric.setValue(stringValue, forAttribute: attributeName)
      }
    }

    if let httpResponseCode {
      metric.setResponseCode(httpResponseCode.intValue)
    }

    if let requestPayloadSize {
      metric.setRequestPayloadSize(requestPayloadSize.intValue)
    }

    if let responsePayloadSize {
      metric.setResponsePayloadSize(responsePayloadSize.intValue)
    }

    if let responseContentType {
      metric.setResponseContentType(responseContentType)
    }
  }
}
