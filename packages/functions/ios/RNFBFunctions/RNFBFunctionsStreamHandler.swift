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

/// Swift wrapper for Firebase Functions streaming that's accessible from Objective-C
/// This is necessary because Firebase's streaming API uses Swift's AsyncStream which
/// doesn't have Objective-C bridging
@available(iOS 15.0, macOS 12.0, *)
@objc(RNFBFunctionsStreamHandler)
public class RNFBFunctionsStreamHandler: NSObject {
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
    app: Any,
    regionOrCustomDomain: String?,
    emulatorHost: String?,
    emulatorPort: Int,
    functionName: String?,
    functionUrl: String?,
    parameters: Any?,
    timeout: Double,
    eventCallback: @escaping ([AnyHashable: Any]) -> Void
  ) {
    // Create Task with explicit priority and detached context for macOS compatibility
    streamTask = Task.detached(priority: .userInitiated) {
      // Convert app to Swift FirebaseApp
      let swiftApp: FirebaseApp
      if let firApp = app as? FIRApp {
        // Convert FIRApp to FirebaseApp
        swiftApp = FirebaseApp.app(named: firApp.name) ?? FirebaseApp.app()!
      } else if let firebaseApp = app as? FirebaseApp {
        swiftApp = firebaseApp
      } else {
        // Use DispatchQueue instead of MainActor for macOS compatibility
        DispatchQueue.main.async {
          eventCallback([
            "data": NSNull(),
            "error": "Invalid Firebase App instance",
            "done": false
          ])
        }
        return
      }
      
      // Create Swift Functions instance directly (required for macOS streaming)
      let swiftFunctions: Functions
      if let regionOrCustomDomain = regionOrCustomDomain,
         let url = URL(string: regionOrCustomDomain),
         url.scheme != nil && url.host != nil {
        // Custom domain
        swiftFunctions = Functions.functions(app: swiftApp, customDomain: regionOrCustomDomain)
      } else if let region = regionOrCustomDomain {
        // Region
        swiftFunctions = Functions.functions(app: swiftApp, region: region)
      } else {
        // Default
        swiftFunctions = Functions.functions(app: swiftApp)
      }
      
      // Configure emulator if provided
      if let emulatorHost = emulatorHost, emulatorPort > 0 {
        swiftFunctions.useEmulator(withHost: emulatorHost, port: emulatorPort)
      }
      
      await performStream(
        functions: swiftFunctions,
        functionName: functionName,
        functionUrl: functionUrl,
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
  
  private func performStream(
    functions: Functions,
    functionName: String?,
    functionUrl: String?,
    parameters: Any?,
    timeout: Double,
    eventCallback: @escaping ([AnyHashable: Any]) -> Void
  ) async {
    // Create the callable function reference
    var callable: Callable<AnyEncodable, StreamResponse<AnyDecodable, AnyDecodable>>
    
    if let functionName = functionName {
      callable = functions.httpsCallable(functionName)
    } else if let functionUrl = functionUrl, let url = URL(string: functionUrl) {
      callable = functions.httpsCallable(url)
    } else {
      // Use DispatchQueue instead of MainActor for macOS compatibility
      DispatchQueue.main.async {
        eventCallback([
          "data": NSNull(),
          "error": "Either functionName or functionUrl must be provided",
          "done": false
        ])
      }
      return
    }
    
    // Set timeout if provided
    if timeout > 0 {
      callable.timeoutInterval = timeout / 1000
    }
    
    do {
      // Encode parameters
      let encodedParams = AnyEncodable(parameters)
      
      // Start streaming using Firebase SDK's native stream() method
      let stream = try callable.stream(encodedParams)
      
      // Iterate over stream responses with cancellation check
      var streamCompleted = false
      do {
        for try await response in stream {
          // Check if task was cancelled (throws CancellationError on macOS if cancelled)
          try Task.checkCancellation()
          
          // Process response - build event dictionary first
          let event: [AnyHashable: Any]
          switch response {
          case .message(let message):
            // This is a data chunk from sendChunk()
            event = [
              "data": message.value ?? NSNull(),
              "error": NSNull(),
              "done": false
            ]
          case .result(let result):
            // This is the final result - stream ends after this
            event = [
              "data": result.value ?? NSNull(),
              "error": NSNull(),
              "done": true
            ]
            streamCompleted = true
          }
          
          // Emit event on main queue (use DispatchQueue instead of MainActor for macOS compatibility)
          // Don't await - just dispatch and continue to avoid blocking the stream iteration
          DispatchQueue.main.async {
            eventCallback(event)
          }
          
          // Break after final result - stream should complete naturally
          if streamCompleted {
            break
          }
        }
      } catch is CancellationError {
        // Task was cancelled - emit cancellation event
        DispatchQueue.main.async {
          eventCallback([
            "data": NSNull(),
            "error": "Stream cancelled",
            "done": true
          ])
        }
        return
      }
      
      // If we reach here without a .result case, emit final done event
      // This shouldn't happen with Firebase Functions, but handle it anyway
      if !streamCompleted {
        DispatchQueue.main.async {
          eventCallback([
            "data": NSNull(),
            "error": NSNull(),
            "done": true
          ])
        }
      }
    } catch {
      // Check if error is due to cancellation
      let isCancelled = error is CancellationError || (error as NSError).code == NSURLErrorCancelled
      
      DispatchQueue.main.async {
        eventCallback([
          "data": NSNull(),
          "error": error.localizedDescription,
          "done": isCancelled ? true : false
        ])
      }
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

