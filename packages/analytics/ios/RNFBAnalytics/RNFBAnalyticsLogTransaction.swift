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

/// iOS-only: logs a verified StoreKit 2 transaction to Firebase Analytics (iOS 15+).
/// Swift bridge for React Native; call from ObjC via alloc/init then logTransactionWithTransactionId:resolve:reject: (see RNFBFunctionsCallHandler).
@objc(RNFBAnalyticsLogTransaction)
public class RNFBAnalyticsLogTransaction: NSObject {

  private static let kCode = "firebase_analytics"
  private static let kUnsupportedMessage = "logTransaction() is only supported on iOS 15.0 or newer"

  /// Resolve/reject types matching RCTPromiseResolveBlock / RCTPromiseRejectBlock for React Native bridge.
  @objc public func logTransaction(
    transactionId: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    if #available(iOS 15.0, *) {
      logTransactionWithStoreKit(transactionId: transactionId, resolve: resolve, reject: reject)
    } else {
      DispatchQueue.main.async {
        reject(Self.kCode, Self.kUnsupportedMessage, nil)
      }
    }
  }

  @available(iOS 15.0, *)
  private func logTransactionWithStoreKit(
    transactionId: String,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, NSError?) -> Void
  ) {
    Task {
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
}
