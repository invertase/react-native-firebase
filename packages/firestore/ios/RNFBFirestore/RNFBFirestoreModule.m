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

#import "RNFBFirestoreModule.h"
#import <React/RCTUtils.h>
#import "RNFBFirestoreCommon.h"
#import "RNFBPreferences.h"

NSMutableDictionary *emulatorConfigs;

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

RCT_EXPORT_METHOD(setLogLevel : (FIRLoggerLevel)loggerLevel) {
  [[FIRConfiguration sharedInstance] setLoggerLevel:loggerLevel];
}

RCT_EXPORT_METHOD(disableNetwork
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp]
      disableNetworkWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

RCT_EXPORT_METHOD(enableNetwork
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp]
      enableNetworkWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

RCT_EXPORT_METHOD(settings
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)settings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];

  if (settings[@"cacheSizeBytes"]) {
    NSString *cacheKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_CACHE_SIZE, appName];
    [[RNFBPreferences shared] setIntegerValue:cacheKey
                                 integerValue:[settings[@"cacheSizeBytes"] integerValue]];
  }

  if (settings[@"host"]) {
    NSString *hostKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_HOST, appName];
    [[RNFBPreferences shared] setStringValue:hostKey stringValue:settings[@"host"]];
  }

  if (settings[@"persistence"]) {
    NSString *persistenceKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_PERSISTENCE, appName];
    [[RNFBPreferences shared] setBooleanValue:persistenceKey
                                    boolValue:[settings[@"persistence"] boolValue]];
  }

  if (settings[@"ssl"]) {
    NSString *sslKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_SSL, appName];
    [[RNFBPreferences shared] setBooleanValue:sslKey boolValue:[settings[@"ssl"] boolValue]];
  }

  if (settings[@"serverTimestampBehavior"]) {
    NSString *key =
        [NSString stringWithFormat:@"%@_%@", FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR, appName];
    [[RNFBPreferences shared] setStringValue:key stringValue:settings[@"serverTimestampBehavior"]];
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(loadBundle
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)bundle
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSData *bundleData = [bundle dataUsingEncoding:NSUTF8StringEncoding];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp]
      loadBundle:bundleData
      completion:^(FIRLoadBundleTaskProgress *progress, NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve([self taskProgressToDictionary:progress]);
        }
      }];
}

RCT_EXPORT_METHOD(clearPersistence
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp]
      clearPersistenceWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

RCT_EXPORT_METHOD(useEmulator
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)host
                  : (NSInteger)port) {
  if (emulatorConfigs == nil) {
    emulatorConfigs = [[NSMutableDictionary alloc] init];
  }
  if (!emulatorConfigs[firebaseApp.name]) {
    FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
    [firestore useEmulatorWithHost:host port:port];
    emulatorConfigs[firebaseApp.name] = @YES;

    // It is not sufficient to just use emulator. You have toggle SSL off too.
    FIRFirestoreSettings *settings = firestore.settings;
    settings.sslEnabled = FALSE;
    firestore.settings = settings;
  }
}

RCT_EXPORT_METHOD(waitForPendingWrites
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp]
      waitForPendingWritesWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

RCT_EXPORT_METHOD(terminate
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *instance = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];

  [instance terminateWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      [instanceCache removeObjectForKey:[firebaseApp name]];
      resolve(nil);
    }
  }];
}

- (NSMutableDictionary *)taskProgressToDictionary:(FIRLoadBundleTaskProgress *)progress {
  NSMutableDictionary *progressMap = [[NSMutableDictionary alloc] init];
  progressMap[@"bytesLoaded"] = @(progress.bytesLoaded);
  progressMap[@"documentsLoaded"] = @(progress.documentsLoaded);
  progressMap[@"totalBytes"] = @(progress.totalBytes);
  progressMap[@"totalDocuments"] = @(progress.totalDocuments);

  NSString *state;
  switch (progress.state) {
    case FIRLoadBundleTaskStateError:
      state = @"Error";
      break;
    case FIRLoadBundleTaskStateSuccess:
      state = @"Success";
      break;
    case FIRLoadBundleTaskStateInProgress:
      state = @"Running";
      break;
  }
  progressMap[@"taskState"] = state;
  return progressMap;
}

@end
