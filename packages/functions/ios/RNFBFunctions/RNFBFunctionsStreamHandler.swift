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
  
  /// Get error code name from NSError (delegates to shared utility)
  private func getErrorCodeName(_ error: Error) -> String {
    let nsError = error as NSError
    return RNFBFunctionsCallHandler.getErrorCodeName(nsError)
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
    self.value = value ?? NSNull()
  }

  public func encode(to encoder: Encoder) throws {
    var container = encoder.singleValueContainer()

    switch value {
    case is NSNull:
      try container.encodeNil()
    case let stringValue as String:
      try container.encode(stringValue)
    case let boolValue as Bool:
      try container.encode(boolValue)
    case let intValue as Int:
      try container.encode(intValue)
    case let int8Value as Int8:
      try container.encode(int8Value)
    case let int16Value as Int16:
      try container.encode(int16Value)
    case let int32Value as Int32:
      try container.encode(int32Value)
    case let int64Value as Int64:
      try container.encode(int64Value)
    case let uintValue as UInt:
      try container.encode(uintValue)
    case let uint8Value as UInt8:
      try container.encode(uint8Value)
    case let uint16Value as UInt16:
      try container.encode(uint16Value)
    case let uint32Value as UInt32:
      try container.encode(uint32Value)
    case let uint64Value as UInt64:
      try container.encode(uint64Value)
    case let doubleValue as Double:
      try container.encode(doubleValue)
    case let floatValue as Float:
      try container.encode(floatValue)
    case let arrayValue as [Any]:
      try container.encode(arrayValue.map { AnyEncodable($0) })
    case let dictionaryValue as [String: Any]:
      try container.encode(dictionaryValue.mapValues { AnyEncodable($0) })
    default:
      throw EncodingError.invalidValue(
        value as Any,
        EncodingError.Context(
          codingPath: encoder.codingPath,
          debugDescription: "Unsupported type: \(type(of: value))"
        )
      )
    }
  }
}

public struct AnyDecodable: Decodable {
  public let value: Any?

  public init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()

    if container.decodeNil() {
      value = NSNull()
      return
    }

    if let stringValue = try? container.decode(String.self) {
      value = stringValue
    } else if let intValue = try? container.decode(Int.self) {
      value = intValue
    } else if let int8Value = try? container.decode(Int8.self) {
      value = int8Value
    } else if let int16Value = try? container.decode(Int16.self) {
      value = int16Value
    } else if let int32Value = try? container.decode(Int32.self) {
      value = int32Value
    } else if let int64Value = try? container.decode(Int64.self) {
      value = int64Value
    } else if let uintValue = try? container.decode(UInt.self) {
      value = uintValue
    } else if let uint8Value = try? container.decode(UInt8.self) {
      value = uint8Value
    } else if let uint16Value = try? container.decode(UInt16.self) {
      value = uint16Value
    } else if let uint32Value = try? container.decode(UInt32.self) {
      value = uint32Value
    } else if let uint64Value = try? container.decode(UInt64.self) {
      value = uint64Value
    } else if let doubleValue = try? container.decode(Double.self) {
      value = doubleValue
    } else if let floatValue = try? container.decode(Float.self) {
      value = floatValue
    } else if let boolValue = try? container.decode(Bool.self) {
      value = boolValue
    } else if let arrayValue = try? container.decode([AnyDecodable].self) {
      value = arrayValue.map(\.value)
    } else if let dictionaryValue = try? container.decode([String: AnyDecodable].self) {
      value = dictionaryValue.mapValues { $0.value }

    } else {
      throw DecodingError.dataCorruptedError(
        in: container,
        debugDescription: "Unable to decode value of type: \(type(of: value))"
      )
    }
  }

  public init(_ value: Any?) {
    self.value = value
  }
}

