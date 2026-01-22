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

/// Swift wrapper for Firebase Functions streaming that's accessible from Objective-C
/// This is necessary because Firebase's streaming API uses Swift's AsyncStream which
/// doesn't have Objective-C bridging
@available(iOS 15.0, macOS 12.0, *)
@objcMembers public class RNFBFunctionsStreamHandler: NSObject {
  private var streamTask: Task<Void, Never>?
  
  /// Start streaming from a Firebase Function
  /// - Parameters:
  ///   - app: Firebase App instance (can be FIRApp or FirebaseApp)
  ///   - regionOrCustomDomain: Region string or custom domain URL
  ///   - emulatorHost: Emulator host (optional)
  ///   - emulatorPort: Emulator port (optional)
  ///   - functionName: Name of the function (mutually exclusive with functionUrl)
  ///   - functionUrl: URL of the function (mutually exclusive with functionName)
  ///   - parameters: Data to pass to the function
  ///   - timeout: Timeout in milliseconds
  ///   - eventCallback: Callback for each stream event
  @objc public func startStream(
    app: FirebaseApp,
    functions: Functions,
    functionName: String,
    parameters: Any?,
    timeout: Double,
    eventCallback: @escaping ([AnyHashable: Any]) -> Void
  ) {
    streamTask = Task {
      let callable: Callable<AnyEncodable, StreamResponse<AnyDecodable, AnyDecodable>> = functions.httpsCallable(functionName)
      await self.performStream(
          functions: functions,
          callable: callable,
          parameters: parameters,
          timeout: timeout,
          eventCallback: eventCallback
        )
    }
  }
  
  @objc public func startStream(
    app: FirebaseApp,
    functions: Functions,
    functionUrl: String,
    parameters: Any?,
    timeout: Double,
    eventCallback: @escaping ([AnyHashable: Any]) -> Void
  ) {
    let url = URL(string: functionUrl)!
    
    streamTask = Task {
      let callable: Callable<AnyEncodable, StreamResponse<AnyDecodable, AnyDecodable>> = functions.httpsCallable(url)
      
      await self.performStream(
          functions: functions,
          callable: callable,
          parameters: parameters,
          timeout: timeout,
          eventCallback: eventCallback
        )
    }
  }
  
  /// Cancel the streaming task
  @objc public func cancel() {
    streamTask?.cancel()
    streamTask = nil
  }
  
  /// Get error code name from NSError
  private func getErrorCodeName(_ error: Error) -> String {
    let nsError = error as NSError
    var code = "UNKNOWN"
    
    if nsError.domain == "com.firebase.functions" {
      switch nsError.code {
        case 0: code = "OK"
        case 1: code = "CANCELLED"
        case 2: code = "UNKNOWN"
        case 3: code = "INVALID_ARGUMENT"
        case 4: code = "DEADLINE_EXCEEDED"
        case 5: code = "NOT_FOUND"
        case 6: code = "ALREADY_EXISTS"
        case 7: code = "PERMISSION_DENIED"
        case 8: code = "RESOURCE_EXHAUSTED"
        case 9: code = "FAILED_PRECONDITION"
        case 10: code = "ABORTED"
        case 11: code = "OUT_OF_RANGE"
        case 12: code = "UNIMPLEMENTED"
        case 13: code = "INTERNAL"
        case 14: code = "UNAVAILABLE"
        case 15: code = "DATA_LOSS"
        case 16: code = "UNAUTHENTICATED"
        default: break
      }
    }
    
    if nsError.domain == "FirebaseFunctions.FunctionsSerializer.Error" {
      let errorDescription = nsError.description
      if errorDescription.contains("unsupportedType") {
        code = "UNSUPPORTED_TYPE"
      }
      if errorDescription.contains("failedToParseWrappedNumber") {
        code = "FAILED_TO_PARSE_WRAPPED_NUMBER"
      }
    }
    
    return code
  }
  
  private func performStream(
    functions: Functions,
    callable: Callable<AnyEncodable, StreamResponse<AnyDecodable, AnyDecodable>>,
    parameters: Any?,
    timeout: Double,
    eventCallback: @escaping ([AnyHashable: Any]) -> Void
  ) async {
    // We need to make var so we can set timeout on the callable
    var callableStream = callable
    if timeout > 0 {
    callableStream.timeoutInterval = timeout
  }
    
    do {
      let encodedParams = AnyEncodable(parameters)

      let stream = try callableStream.stream(encodedParams)

      for try await response in stream {
        switch response {
        case .message(let message):
          eventCallback([
            "data": message.value ?? NSNull(),
            "error": NSNull(),
            "done": false
          ])
        case .result(let result):
          eventCallback([
            "data": result.value ?? NSNull(),
            "error": NSNull(),
            "done": true
          ])
        }
        }
    } catch {
      // Check if the stream was cancelled
      if error is CancellationError {
        let errorDict: [String: Any] = [
          // Same code/message as in firestore
          "code": "cancelled",
          "message": "The operation was cancelled (typically by the caller).",
          "details": NSNull()
        ]
        
        eventCallback([
          "data": NSNull(),
          "error": errorDict,
          "done": true
        ])
        return
      }
      
      let nsError = error as NSError
      
      // Construct error object similar to httpsCallable
      var details: Any = NSNull()
      let message = error.localizedDescription
      
      if nsError.domain == "com.firebase.functions" {
        if let errorDetails = nsError.userInfo["details"] {
          details = errorDetails
        }
      }
      
      let errorDict: [String: Any] = [
        "code": getErrorCodeName(error),
        "message": message,
        "details": details
      ]
      
      eventCallback([
        "data": NSNull(),
        "error": errorDict,
        "done": true
      ])
    }
  }
}

// MARK: - Helper Types for Encoding/Decoding Any Value

public struct AnyEncodable: Encodable {
  private let value: Any?
  
  public init(_ value: Any?) {
    self.value = value
  }
  
  public func encode(to encoder: Encoder) throws {
    var container = encoder.singleValueContainer()
    
    if let value = value {
      switch value {
      case let string as String:
        try container.encode(string)
      case let int as Int:
        try container.encode(int)
      case let double as Double:
        try container.encode(double)
      case let bool as Bool:
        try container.encode(bool)
      case let array as [Any]:
        try container.encode(array.map { AnyEncodable($0) })
      case let dict as [String: Any]:
        try container.encode(dict.mapValues { AnyEncodable($0) })
      case is NSNull:
        try container.encodeNil()
      default:
        try container.encodeNil()
      }
    } else {
      try container.encodeNil()
    }
  }
}

public struct AnyDecodable: Decodable {
  public let value: Any?
  
  public init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()
    
    if container.decodeNil() {
      value = NSNull()
    } else if let bool = try? container.decode(Bool.self) {
      value = bool
    } else if let int = try? container.decode(Int.self) {
      value = int
    } else if let double = try? container.decode(Double.self) {
      value = double
    } else if let string = try? container.decode(String.self) {
      value = string
    } else if let array = try? container.decode([AnyDecodable].self) {
      value = array.map { $0.value }
    } else if let dict = try? container.decode([String: AnyDecodable].self) {
      value = dict.mapValues { $0.value }
    } else {
      value = NSNull()
    }
  }
}

