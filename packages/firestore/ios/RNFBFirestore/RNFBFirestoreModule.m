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
#import <React/RCTUtils.h>
#import "FirebaseFirestoreInternal/FIRPersistentCacheIndexManager.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBPreferences.h"

NSMutableDictionary *emulatorConfigs;
static __strong NSMutableDictionary *snapshotsInSyncListeners;
static NSString *const RNFB_FIRESTORE_SNAPSHOTS_IN_SYNC = @"firestore_snapshots_in_sync_event";

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
                  : (NSString *)databaseId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
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
                  : (NSString *)databaseId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
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
                  : (NSString *)databaseId
                  : (NSDictionary *)settings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
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

RCT_EXPORT_METHOD(loadBundle
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSString *)bundle
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
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

RCT_EXPORT_METHOD(clearPersistence
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
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
                  : (NSString *)databaseId
                  : (nonnull NSString *)host
                  : (NSInteger)port) {
  if (emulatorConfigs == nil) {
    emulatorConfigs = [[NSMutableDictionary alloc] init];
  }

  NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:firebaseApp.name
                                                                   databaseId:databaseId];
  if (!emulatorConfigs[firestoreKey]) {
    FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                           databaseId:databaseId];
    [firestore useEmulatorWithHost:host port:port];
    emulatorConfigs[firestoreKey] = @YES;

    // It is not sufficient to just use emulator. You have toggle SSL off too.
    FIRFirestoreSettings *settings = firestore.settings;
    settings.sslEnabled = FALSE;
    firestore.settings = settings;
  }
}

RCT_EXPORT_METHOD(waitForPendingWrites
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
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
                  : (NSString *)databaseId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *instance = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                        databaseId:databaseId];

  [instance terminateWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:firebaseApp.name
                                                                       databaseId:databaseId];
      [instanceCache removeObjectForKey:firestoreKey];
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(persistenceCacheIndexManager
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSInteger)requestType
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRPersistentCacheIndexManager *persistentCacheIndexManager =
      [RNFBFirestoreCommon getFirestoreForApp:firebaseApp databaseId:databaseId]
          .persistentCacheIndexManager;

  if (persistentCacheIndexManager) {
    switch (requestType) {
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

RCT_EXPORT_METHOD(addSnapshotsInSync
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)listenerId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  if (snapshotsInSyncListeners[listenerId]) {
    resolve(nil);
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];

  id<FIRListenerRegistration> listener = [firestore addSnapshotsInSyncListener:^{
    [[RNFBRCTEventEmitter shared]
        sendEventWithName:RNFB_FIRESTORE_SNAPSHOTS_IN_SYNC
                     body:@{
                       @"appName" : [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name],
                       @"databaseId" : databaseId,
                       @"listenerId" : listenerId,
                       @"body" : @{}
                     }];
  }];

  snapshotsInSyncListeners[listenerId] = listener;

  resolve(nil);
}

RCT_EXPORT_METHOD(removeSnapshotsInSync
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)listenerId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  id<FIRListenerRegistration> listener = snapshotsInSyncListeners[listenerId];
  if (listener) {
    [listener remove];
    [snapshotsInSyncListeners removeObjectForKey:listenerId];
  }

  resolve(nil);
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
