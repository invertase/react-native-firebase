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

// This module intentionally has no Firebase imports -- see
// RNFBFirestoreTransactionModuleHelper.h / okf-bundle/ios-spm-native-imports.md.
#import <React/RCTInvalidating.h>

#import "RNFBFirestoreTransactionModule.h"
#import "RNFBFirestoreTransactionModuleHelper.h"
#import "RNFBFirestoreTurboModules.h"

@interface RNFBFirestoreTransactionModule () <NativeRNFBTurboFirestoreTransactionSpec,
                                              RCTBridgeModule,
                                              RCTInvalidating>
@end

@implementation RNFBFirestoreTransactionModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFirestoreTransactionSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboFirestoreTransaction);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBFirestoreTransactionModuleHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)transactionBegin:(NSString *)appName
              databaseId:(NSString *)databaseId
           transactionId:(double)transactionId
             maxAttempts:(double)maxAttempts {
  [RNFBFirestoreTransactionModuleHelper transactionBegin:appName
                                              databaseId:databaseId
                                           transactionId:transactionId
                                             maxAttempts:maxAttempts];
}

- (void)transactionGetDocument:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                          path:(NSString *)path
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:appName
                                                    databaseId:databaseId
                                                 transactionId:transactionId
                                                          path:path
                                                       resolve:resolve
                                                        reject:reject];
}

- (void)transactionDispose:(NSString *)appName
                databaseId:(NSString *)databaseId
             transactionId:(double)transactionId {
  [RNFBFirestoreTransactionModuleHelper transactionDispose:appName
                                                databaseId:databaseId
                                             transactionId:transactionId];
}

- (void)transactionApplyBuffer:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                 commandBuffer:(NSArray *)commandBuffer {
  [RNFBFirestoreTransactionModuleHelper transactionApplyBuffer:appName
                                                    databaseId:databaseId
                                                 transactionId:transactionId
                                                 commandBuffer:commandBuffer];
}

@end
