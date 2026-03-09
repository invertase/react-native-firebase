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
import FirebaseAnalytics
import StoreKit

/// Swift wrapper for logging a verified StoreKit 2 transaction to Firebase Analytics.
/// Accessible from Objective-C; necessary because StoreKit 2 and Analytics.logTransaction use Swift async APIs.
/// Call from ObjC only when @available(iOS 15.0, *) (see RNFBFunctionsStreamHandler pattern).
@available(iOS 15.0, macOS 12.0, *)
@objc(RNFBAnalyticsLogTransaction)
@objcMembers
public class RNFBAnalyticsLogTransaction: NSObject {

  private static let kCode = "firebase_analytics"
  private var logTask: Task<Void, Never>?

  /// Resolve/reject types matching RCTPromiseResolveBlock / RCTPromiseRejectBlock for React Native bridge.
  @objc public func logTransaction(
    transactionId: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    logTask = Task {
      await performLogTransaction(transactionId: transactionId, resolve: resolve, reject: reject)
      logTask = nil
    }
  }

  private func performLogTransaction(
    transactionId: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) async {
    do {
      guard let id = UInt64(transactionId) else {
        await MainActor.run { reject(Self.kCode, "Invalid transactionId", nil) }
        return
      }

      var foundTransaction: StoreKit.Transaction?
      for await result in StoreKit.Transaction.all {
        switch result {
        case let .verified(transaction):
          if transaction.id == id {
            foundTransaction = transaction
            break
          }
        case .unverified:
          continue
        }
      }

      guard let transaction = foundTransaction else {
        await MainActor.run { reject(Self.kCode, "Transaction not found", nil) }
        return
      }

      Analytics.logTransaction(transaction)
      await MainActor.run { resolve(NSNull()) }
    } catch {
      let nsError = error as NSError
      await MainActor.run { reject(Self.kCode, error.localizedDescription, nsError) }
    }
  }
}
