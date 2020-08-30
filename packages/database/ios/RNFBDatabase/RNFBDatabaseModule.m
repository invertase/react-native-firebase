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
#import <Firebase/Firebase.h>

#import "RNFBDatabaseModule.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBPreferences.h"

@implementation RNFBDatabaseModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseCommon getDispatchQueue];
}


#pragma mark -
#pragma mark Firebase Database

RCT_EXPORT_METHOD(goOnline:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOnline];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(goOffline:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOffline];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setPersistenceEnabled:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (BOOL) enabled
) {
  [[RNFBPreferences shared] setBooleanValue:DATABASE_PERSISTENCE_ENABLED boolValue:enabled];
}

RCT_EXPORT_METHOD(setLoggingEnabled:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (BOOL) enabled
) {
  [[RNFBPreferences shared] setBooleanValue:DATABASE_LOGGING_ENABLED boolValue:enabled];
}

RCT_EXPORT_METHOD(setPersistenceCacheSizeBytes:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSInteger *) bytes
) {
  [[RNFBPreferences shared] setIntegerValue:DATABASE_PERSISTENCE_CACHE_SIZE integerValue:bytes];
}

@end
