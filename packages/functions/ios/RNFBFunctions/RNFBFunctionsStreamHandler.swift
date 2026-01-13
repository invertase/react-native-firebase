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
  
  /// Helper function to log to both NSLog and a file
  private func log(_ message: String) {
    let logMessage = "RNFBFunctions: \(message)"
    NSLog("%@", logMessage)
    
    // Also write to a file for easier access (in home directory)
    let homeDir = FileManager.default.homeDirectoryForCurrentUser
    let logFile = homeDir.appendingPathComponent("rnfb-functions-stream-debug.log")
    
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
    let timestamp = formatter.string(from: Date())
    let fileMessage = "[\(timestamp)] \(message)\n"
    
    if let data = fileMessage.data(using: .utf8) {
      if FileManager.default.fileExists(atPath: logFile.path) {
        if let fileHandle = try? FileHandle(forWritingTo: logFile) {
          fileHandle.seekToEndOfFile()
          fileHandle.write(data)
          fileHandle.closeFile()
        }
      } else {
        // File doesn't exist, create it
        try? data.write(to: logFile)
      }
    }
  }
  
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
    // Convert app to Swift FirebaseApp synchronously (called from background queue already)
    let swiftApp: FirebaseApp
    if let firApp = app as? FIRApp {
      // Convert FIRApp to FirebaseApp
      swiftApp = FirebaseApp.app(named: firApp.name) ?? FirebaseApp.app()!
    } else if let firebaseApp = app as? FirebaseApp {
      swiftApp = firebaseApp
    } else {
      // Invalid app - emit error on main thread
      DispatchQueue.main.async {
        eventCallback([
          "data": NSNull(),
          "error": "Invalid Firebase App instance",
          "done": false
        ])
      }
      return
    }
    
    // Create Swift Functions instance synchronously (called from background queue already)
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
    
    // Start stream iteration in detached task to avoid blocking
    // Use detached because we're called from background GCD queue
    // Callbacks will be dispatched to main thread without blocking stream iteration
    log("Creating detached task to start stream")
    streamTask = Task.detached(priority: .userInitiated) {
      self.log("Task started, calling performStream")
      await self.performStream(
        functions: swiftFunctions,
        functionName: functionName,
        functionUrl: functionUrl,
        parameters: parameters,
        timeout: timeout,
        eventCallback: eventCallback
      )
      self.log("performStream completed")
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
    log("performStream called with functionName=\(functionName ?? "nil"), functionUrl=\(functionUrl ?? "nil")")
    
    // Create the callable function reference
    var callable: Callable<AnyEncodable, StreamResponse<AnyDecodable, AnyDecodable>>
    
    if let functionName = functionName {
      log("Creating callable with function name: \(functionName)")
      callable = functions.httpsCallable(functionName)
    } else if let functionUrl = functionUrl, let url = URL(string: functionUrl) {
      log("Creating callable with function URL: \(functionUrl)")
      callable = functions.httpsCallable(url)
    } else {
      // Missing function name/URL - emit error
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
    // Timeout is already in seconds from Objective-C (TypeScript converts milliseconds to seconds)
    if timeout > 0 {
      log("Setting timeout to \(timeout) seconds")
      callable.timeoutInterval = timeout
    }
    
    do {
      // Encode parameters
      log("Encoding parameters")
      let encodedParams = AnyEncodable(parameters)
      log("Parameters encoded, about to call stream()")
      
      // Start streaming using Firebase SDK's native stream() method
      let stream = try callable.stream(encodedParams)
      log("Stream created successfully, starting iteration")
      
      // Iterate over stream responses
      // Use standard for-await loop as per Firebase documentation
      // Dispatch callbacks to main thread without blocking stream iteration
      for try await response in stream {
        log("Received stream response")
        // Check for cancellation
        try Task.checkCancellation()
        
        // Build event dictionary
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
        }
        
        // Dispatch to main thread without blocking stream iteration
        // Use async dispatch (non-blocking) to avoid blocking the for-await loop
        let eventCopy = event
        DispatchQueue.main.async {
          eventCallback(eventCopy)
        }
      }
    } catch {
      // Handle errors - dispatch to main thread
      log("Error in stream: \(error.localizedDescription)")
      let errorDescription = error.localizedDescription
      let isCancelled = error is CancellationError || (error as NSError).code == NSURLErrorCancelled
      
      DispatchQueue.main.async {
        eventCallback([
          "data": NSNull(),
          "error": errorDescription,
          "done": isCancelled ? true : false
        ])
      }
    }
    log("performStream finished")
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

