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

#import <Firebase/Firebase.h>
#import <React/RCTUtils.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseReferenceModule.h"
#import "RNFBDatabaseTurboModules.h"

@interface RNFBDatabaseReferenceModule () <NativeRNFBTurboDatabaseReferenceSpec, RCTBridgeModule>
@end

@implementation RNFBDatabaseReferenceModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseReferenceSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseReference);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseCommon getDispatchQueue];
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
}

#pragma mark -
#pragma mark Firebase Database

- (void)set:(NSString *)app
      dbURL:(NSString *)dbURL
       path:(NSString *)path
      props:(NSDictionary *)props
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setValue:[props valueForKey:@"value"]
             withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
               if (error != nil) {
                 [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
               } else {
                 resolve([NSNull null]);
               }
             }];
}

- (void)update:(NSString *)app
         dbURL:(NSString *)dbURL
          path:(NSString *)path
         props:(NSDictionary *)props
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference updateChildValues:[props valueForKey:@"values"]
                      withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
                        if (error != nil) {
                          [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
                        } else {
                          resolve([NSNull null]);
                        }
                      }];
}

- (void)setWithPriority:(NSString *)app
                  dbURL:(NSString *)dbURL
                   path:(NSString *)path
                  props:(NSDictionary *)props
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setValue:[props valueForKey:@"value"]
                     andPriority:[props valueForKey:@"priority"]
             withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
               if (error != nil) {
                 [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
               } else {
                 resolve([NSNull null]);
               }
             }];
}

- (void)remove:(NSString *)app
         dbURL:(NSString *)dbURL
          path:(NSString *)path
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference
      removeValueWithCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
        if (error != nil) {
          [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
        } else {
          resolve([NSNull null]);
        }
      }];
}

- (void)setPriority:(NSString *)app
              dbURL:(NSString *)dbURL
               path:(NSString *)path
              props:(NSDictionary *)props
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setPriority:[props valueForKey:@"priority"]
                withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
                  if (error != nil) {
                    [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
                  } else {
                    resolve([NSNull null]);
                  }
                }];
}

@end
