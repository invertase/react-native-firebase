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

#import <React/RCTUtils.h>

#import "RNFBDatabaseQueue.h"
#import "RNFBDatabaseTransactionHelper.h"
#import "RNFBDatabaseTransactionModule.h"
#import "RNFBDatabaseTurboModules.h"

// NOTE: This module deliberately never imports Firebase Database headers.
// See RNFBDatabaseModule.mm for rationale. All Firebase Database calls, and
// the pending-transaction dispatch queue/bookkeeping, live in the plain
// Objective-C `RNFBDatabaseTransactionHelper`.

@interface RNFBDatabaseTransactionModule () <NativeRNFBTurboDatabaseTransactionSpec,
                                             RCTBridgeModule>
@end

@implementation RNFBDatabaseTransactionModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseTransactionSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseTransaction);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseQueue getDispatchQueue];
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBDatabaseTransactionHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Database

- (void)transactionStart:(NSString *)app
                   dbURL:(NSString *)dbURL
                    path:(NSString *)path
           transactionId:(double)transactionId
            applyLocally:(BOOL)applyLocally {
  [RNFBDatabaseTransactionHelper transactionStart:app
                                             dbURL:dbURL
                                              path:path
                                     transactionId:transactionId
                                      applyLocally:applyLocally];
}

- (void)transactionTryCommit:(NSString *)app
                       dbURL:(NSString *)dbURL
               transactionId:(double)transactionId
                     updates:(NSDictionary *)updates {
  [RNFBDatabaseTransactionHelper transactionTryCommit:app
                                                 dbURL:dbURL
                                         transactionId:transactionId
                                               updates:updates];
}

@end
