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
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTUtils.h>
#import "FirebaseFirestoreInternal/FIRPersistentCacheIndexManager.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBFirestoreTurboModules.h"
#import "RNFBPreferences.h"

NSMutableDictionary *emulatorConfigs;
static __strong NSMutableDictionary *snapshotsInSyncListeners;
static NSString *const RNFB_FIRESTORE_SNAPSHOTS_IN_SYNC = @"firestore_snapshots_in_sync_event";

@interface RNFBFirestoreModule () <NativeRNFBTurboFirestoreSpec, RCTBridgeModule>
@end

@implementation RNFBFirestoreModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFirestoreSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboFirestore);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)setLogLevel:(NSString *)logLevel {
  if ([logLevel isEqualToString:@"debug"] || [logLevel isEqualToString:@"error"]) {
    [[FIRConfiguration sharedInstance] setLoggerLevel:FIRLoggerLevelDebug];
  } else {
    [[FIRConfiguration sharedInstance] setLoggerLevel:FIRLoggerLevelMin];
  }
}

- (void)disableNetwork:(NSString *)appName
            databaseId:(NSString *)databaseId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
      disableNetworkWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

- (void)enableNetwork:(NSString *)appName
           databaseId:(NSString *)databaseId
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
      enableNetworkWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

- (void)settings:(NSString *)appName
      databaseId:(NSString *)databaseId
        settings:(NSDictionary *)settings
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                   databaseId:databaseId];

  if (settings[@"cacheSizeBytes"]) {
    NSString *cacheKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_CACHE_SIZE, firestoreKey];
    [[RNFBPreferences shared] setIntegerValue:cacheKey
                                 integerValue:[settings[@"cacheSizeBytes"] integerValue]];
  }

  if (settings[@"host"]) {
    NSString *hostKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_HOST, firestoreKey];
    [[RNFBPreferences shared] setStringValue:hostKey stringValue:settings[@"host"]];
  }

  if (settings[@"persistence"]) {
    NSString *persistenceKey =
        [NSString stringWithFormat:@"%@_%@", FIRESTORE_PERSISTENCE, firestoreKey];
    [[RNFBPreferences shared] setBooleanValue:persistenceKey
                                    boolValue:[settings[@"persistence"] boolValue]];
  }

  if (settings[@"ssl"]) {
    NSString *sslKey = [NSString stringWithFormat:@"%@_%@", FIRESTORE_SSL, firestoreKey];
    [[RNFBPreferences shared] setBooleanValue:sslKey boolValue:[settings[@"ssl"] boolValue]];
  }

  if (settings[@"serverTimestampBehavior"]) {
    NSString *key =
        [NSString stringWithFormat:@"%@_%@", FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR, firestoreKey];
    [[RNFBPreferences shared] setStringValue:key stringValue:settings[@"serverTimestampBehavior"]];
  }

  resolve([NSNull null]);
}

- (void)loadBundle:(NSString *)appName
        databaseId:(NSString *)databaseId
            bundle:(NSString *)bundle
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSData *bundleData = [bundle dataUsingEncoding:NSUTF8StringEncoding];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
      loadBundle:bundleData
      completion:^(FIRLoadBundleTaskProgress *progress, NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve([self taskProgressToDictionary:progress]);
        }
      }];
}

- (void)clearPersistence:(NSString *)appName
              databaseId:(NSString *)databaseId
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
      clearPersistenceWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

- (void)useEmulator:(NSString *)appName
         databaseId:(NSString *)databaseId
               host:(NSString *)host
               port:(double)port {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  if (emulatorConfigs == nil) {
    emulatorConfigs = [[NSMutableDictionary alloc] init];
  }

  NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                   databaseId:databaseId];
  if (!emulatorConfigs[firestoreKey]) {
    FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                           databaseId:databaseId];
    [firestore useEmulatorWithHost:host port:(NSInteger)port];
    emulatorConfigs[firestoreKey] = @YES;

    FIRFirestoreSettings *settings = firestore.settings;
    settings.sslEnabled = FALSE;
    firestore.settings = settings;
  }
}

- (void)waitForPendingWrites:(NSString *)appName
                  databaseId:(NSString *)databaseId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
      waitForPendingWritesWithCompletion:^(NSError *error) {
        if (error) {
          [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
        } else {
          resolve(nil);
        }
      }];
}

- (void)terminate:(NSString *)appName
       databaseId:(NSString *)databaseId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRFirestore *instance = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                        databaseId:databaseId];

  [instance terminateWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                       databaseId:databaseId];
      [instanceCache removeObjectForKey:firestoreKey];
      resolve(nil);
    }
  }];
}

- (void)persistenceCacheIndexManager:(NSString *)appName
                          databaseId:(NSString *)databaseId
                         requestType:(double)requestType
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRPersistentCacheIndexManager *persistentCacheIndexManager =
      [RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
          .persistentCacheIndexManager;

  if (persistentCacheIndexManager) {
    switch ((NSInteger)requestType) {
      case 0:
        [persistentCacheIndexManager enableIndexAutoCreation];
        break;
      case 1:
        [persistentCacheIndexManager disableIndexAutoCreation];
        break;
      case 2:
        [persistentCacheIndexManager deleteAllIndexes];
        break;
    }
  } else {
    reject(@"firestore/index-manager-null",
           @"`PersistentCacheIndexManager` is not available, persistence has not been enabled for "
           @"Firestore",
           nil);
    return;
  }
  resolve(nil);
}

- (void)addSnapshotsInSync:(NSString *)appName
                databaseId:(NSString *)databaseId
                listenerId:(double)listenerId {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *listenerIdNumber = @(listenerId);
  if (snapshotsInSyncListeners[listenerIdNumber]) {
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];

  id<FIRListenerRegistration> listener = [firestore addSnapshotsInSyncListener:^{
    [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_FIRESTORE_SNAPSHOTS_IN_SYNC
                                               body:@{
                                                 @"appName" : appName,
                                                 @"databaseId" : databaseId,
                                                 @"listenerId" : listenerIdNumber,
                                                 @"body" : @{}
                                               }];
  }];

  snapshotsInSyncListeners[listenerIdNumber] = listener;
}

- (void)removeSnapshotsInSync:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId {
  NSNumber *listenerIdNumber = @(listenerId);
  id<FIRListenerRegistration> listener = snapshotsInSyncListeners[listenerIdNumber];
  if (listener) {
    [listener remove];
    [snapshotsInSyncListeners removeObjectForKey:listenerIdNumber];
  }
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
