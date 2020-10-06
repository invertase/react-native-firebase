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
#import "RNFBFirestoreModule.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBPreferences.h"

@implementation RNFBFirestoreModule
#pragma mark -
#pragma mark Module Setup


RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return [RNFBFirestoreCommon getFirestoreQueue];
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

#pragma mark -
#pragma mark Firebase Firestore Methods

RCT_EXPORT_METHOD(setLogLevel:
  (FIRLoggerLevel) loggerLevel
) {
  [[FIRConfiguration sharedInstance] setLoggerLevel:loggerLevel];
}

RCT_EXPORT_METHOD(disableNetwork:
  (FIRApp *) firebaseApp
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp] disableNetworkWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(enableNetwork:
  (FIRApp *) firebaseApp
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp] enableNetworkWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(settings:
  (FIRApp *) firebaseApp
    :(NSDictionary *)settings
    :(RCTPromiseResolveBlock)resolve
    :(RCTPromiseRejectBlock)reject
) {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];

  if (settings[@"cacheSizeBytes"]) {
    NSString *cacheKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_CACHE_SIZE, appName];
    [[RNFBPreferences shared] setIntegerValue:cacheKey integerValue:[settings[@"cacheSizeBytes"] integerValue]];
  }

  if (settings[@"host"]) {
    NSString *hostKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_HOST, appName];
    [[RNFBPreferences shared] setStringValue:hostKey stringValue:settings[@"host"]];
  }

  if (settings[@"persistence"]) {
    NSString *persistenceKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_PERSISTENCE, appName];
    [[RNFBPreferences shared] setBooleanValue:persistenceKey boolValue:[settings[@"persistence"] boolValue]];
  }

  if (settings[@"ssl"]) {
    NSString *sslKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_SSL, appName];
    [[RNFBPreferences shared] setBooleanValue:sslKey boolValue:[settings[@"ssl"] boolValue]];
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(clearPersistence:
  (FIRApp *) firebaseApp
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp] clearPersistenceWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(waitForPendingWrites:
  (FIRApp *) firebaseApp
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp] waitForPendingWritesWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(terminate:
  (FIRApp *) firebaseApp
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
    FIRFirestore *instance = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
    
    [instance terminateWithCompletion:^(NSError *error) {
      if (error) {
        [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
      } else {
        [instanceCache removeObjectForKey: [firebaseApp name]];
        resolve(nil);
      }
    }];
}


@end
