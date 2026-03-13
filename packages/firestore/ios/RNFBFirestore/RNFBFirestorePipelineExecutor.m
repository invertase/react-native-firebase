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

#import "RNFBFirestorePipelineExecutor.h"
#import <RNFBFirestore/RNFBFirestore-Swift.h>
#import "RNFBFirestoreCommon.h"

@interface RNFBFirestorePipelineExecutor ()

@property(nonatomic, strong) FIRFirestore *firestore;

@end

@implementation RNFBFirestorePipelineExecutor

- (instancetype)initWithFirestore:(FIRFirestore *)firestore {
  self = [super init];
  if (self) {
    _firestore = firestore;
  }
  return self;
}

- (void)executeWithPipeline:(NSDictionary *)pipeline
                    options:(NSDictionary *)options
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  RNFBFirestorePipelineCallHandler *handler = [[RNFBFirestorePipelineCallHandler alloc] init];
  [handler executeWithFirestore:self.firestore
                       pipeline:pipeline
                        options:options
                     completion:^(NSDictionary *_Nullable result, NSDictionary *_Nullable error) {
                       if (error != nil) {
                         NSString *code = error[@"code"];
                         NSString *message = error[@"message"];
                         NSError *nativeError = error[@"nativeError"];
                         if (nativeError != nil) {
                           [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:nativeError];
                           return;
                         }
                         reject(code ?: @"firestore/unknown", message ?: @"Failed to execute pipeline.", nil);
                         return;
                       }

                       resolve(result ?: @{@"results" : @[]});
                     }];
}

@end
