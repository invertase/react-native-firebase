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
 *
 */

import Foundation
import FirebaseFunctions
import FirebaseCore

/// Swift wrapper for Firebase Functions callable methods that's accessible from Objective-C
/// This encapsulates the logic for calling Firebase Functions (both by name and URL)
@objcMembers public class RNFBFunctionsCallHandler: NSObject {
  
  /// Call a Firebase Function by name
  /// - Parameters:
  ///   - app: Firebase App instance
  ///   - functions: FIRFunctions instance
  ///   - name: Name of the function
  ///   - data: Data to pass to the function
  ///   - timeout: Timeout in milliseconds
  ///   - limitedUseAppCheckToken: Optional boolean for limited use App Check tokens
  ///   - completion: Completion handler with result or error
  @objc public func callFunction(
    app: FirebaseApp,
    functions: Functions,
    name: String,
    data: Any?,
    timeout: Double,
    limitedUseAppCheckToken: NSNumber?,
    completion: @escaping ([AnyHashable: Any]?, [AnyHashable: Any]?) -> Void
  ) {
    let options = HTTPSCallableOptions(requireLimitedUseAppCheckTokens: limitedUseAppCheckToken?.boolValue ?? false)
    
    let callable = functions.httpsCallable(name, options: options)
    performCall(callable: callable, data: data, timeout: timeout, completion: completion)
  }
  
  /// Call a Firebase Function by URL
  /// - Parameters:
  ///   - app: Firebase App instance
  ///   - functions: FIRFunctions instance
  ///   - url: URL of the function
  ///   - data: Data to pass to the function
  ///   - timeout: Timeout in milliseconds
  ///   - limitedUseAppCheckToken: Optional boolean for limited use App Check tokens
  ///   - completion: Completion handler with result or error
  @objc public func callFunctionWithURL(
    app: FirebaseApp,
    functions: Functions,
    url: String,
    data: Any?,
    timeout: Double,
    limitedUseAppCheckToken: NSNumber?,
    completion: @escaping ([AnyHashable: Any]?, [AnyHashable: Any]?) -> Void
  ) {
    guard let functionURL = URL(string: url) else {
      let errorDict: [AnyHashable: Any] = [
        "code": "INVALID_ARGUMENT",
        "message": "Invalid URL provided",
        "details": NSNull()
      ]
      completion(nil, errorDict)
      return
    }
    
    let options = HTTPSCallableOptions(requireLimitedUseAppCheckTokens: limitedUseAppCheckToken?.boolValue ?? false)
    
    let callable = functions.httpsCallable(functionURL, options: options)
    performCall(callable: callable, data: data, timeout: timeout, completion: completion)
  }
  
  /// Perform the actual function call
  /// - Parameters:
  ///   - callable: The callable instance
  ///   - data: Data to pass to the function
  ///   - timeout: Timeout in milliseconds
  ///   - completion: Completion handler with result or error
  private func performCall(
    callable: HTTPSCallable,
    data: Any?,
    timeout: Double,
    completion: @escaping ([AnyHashable: Any]?, [AnyHashable: Any]?) -> Void
  ) {
    // Set timeout if provided
    if timeout > 0 {
      callable.timeoutInterval = timeout
    }
    
    // Ensure data is not nil - use NSNull if needed
    let callableData = data ?? NSNull()
    
    callable.call(callableData) { result, error in
      if let error = error as NSError? {
        let errorDict = self.formatError(error)
        completion(nil, errorDict)
      } else if let result = result {
        let resultDict: [AnyHashable: Any] = ["data": result.data]
        completion(resultDict, nil)
      } else {
        // Shouldn't happen, but handle gracefully
        let errorDict: [AnyHashable: Any] = [
          "code": "UNKNOWN",
          "message": "Unknown error occurred",
          "details": NSNull()
        ]
        completion(nil, errorDict)
      }
    }
  }
  
  /// Format error for JavaScript
  /// - Parameter error: The error to format
  /// - Returns: Dictionary containing error code, message, and details
  private func formatError(_ error: NSError) -> [AnyHashable: Any] {
    return RNFBFunctionsCallHandler.formatError(error)
  }
  
  /// Static method to format error for JavaScript (shared utility)
  /// - Parameter error: The error to format
  /// - Returns: Dictionary containing error code, message, and details
  @objc public static func formatError(_ error: NSError) -> [AnyHashable: Any] {
    var details: Any = NSNull()
    let message = error.localizedDescription
    
    if error.domain == "com.firebase.functions" {
      if let errorDetails = error.userInfo["details"] {
        details = errorDetails
      }
    }
    
    return [
      "code": getErrorCodeName(error),
      "message": message,
      "details": details
    ]
  }
  
  /// Static method to get error code name from NSError (shared utility)
  /// - Parameter error: The error
  /// - Returns: String representation of the error code
  @objc public static func getErrorCodeName(_ error: NSError) -> String {
    var code = "UNKNOWN"
    
    if error.domain == "com.firebase.functions" {
      code = mapFunctionsErrorCode(error.code)
    }
    
    if error.domain == "FirebaseFunctions.FunctionsSerializer.Error" {
      NSLog("RNFBFUNCTIONS error description: %@", error.description)
      let errorDescription = error.description
      if errorDescription.contains("unsupportedType") {
        code = "UNSUPPORTED_TYPE"
      }
      if errorDescription.contains("failedToParseWrappedNumber") {
        code = "FAILED_TO_PARSE_WRAPPED_NUMBER"
      }
    }
    
    return code
  }
  
  private static func mapFunctionsErrorCode(_ code: Int) -> String {
    switch code {
    case FunctionsErrorCode.aborted.rawValue: return "ABORTED"
    case FunctionsErrorCode.alreadyExists.rawValue: return "ALREADY_EXISTS"
    case FunctionsErrorCode.cancelled.rawValue: return "CANCELLED"
    case FunctionsErrorCode.dataLoss.rawValue: return "DATA_LOSS"
    case FunctionsErrorCode.deadlineExceeded.rawValue: return "DEADLINE_EXCEEDED"
    case FunctionsErrorCode.failedPrecondition.rawValue: return "FAILED_PRECONDITION"
    case FunctionsErrorCode.internal.rawValue: return "INTERNAL"
    case FunctionsErrorCode.invalidArgument.rawValue: return "INVALID_ARGUMENT"
    case FunctionsErrorCode.notFound.rawValue: return "NOT_FOUND"
    case FunctionsErrorCode.OK.rawValue: return "OK"
    case FunctionsErrorCode.outOfRange.rawValue: return "OUT_OF_RANGE"
    case FunctionsErrorCode.permissionDenied.rawValue: return "PERMISSION_DENIED"
    case FunctionsErrorCode.resourceExhausted.rawValue: return "RESOURCE_EXHAUSTED"
    case FunctionsErrorCode.unauthenticated.rawValue: return "UNAUTHENTICATED"
    case FunctionsErrorCode.unavailable.rawValue: return "UNAVAILABLE"
    case FunctionsErrorCode.unimplemented.rawValue: return "UNIMPLEMENTED"
    default: return "UNKNOWN"
    }
  }
}
