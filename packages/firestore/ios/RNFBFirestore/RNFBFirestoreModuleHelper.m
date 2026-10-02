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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseFirestore/FirebaseFirestore.h>
#else
@import FirebaseCore;
@import FirebaseFirestore;
#endif

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTUtils.h>
#import "FirebaseFirestoreInternal/FIRPersistentCacheIndexManager.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBFirestoreListenerRegistry.h"
#import "RNFBFirestoreModuleHelper.h"
#import "RNFBPreferences.h"

NSMutableDictionary *emulatorConfigs;
static RNFBFirestoreListenerRegistry *snapshotsInSyncListeners;
static NSString *const RNFB_FIRESTORE_SNAPSHOTS_IN_SYNC = @"firestore_snapshots_in_sync_event";

@implementation RNFBFirestoreModuleHelper

+ (void)ensureListeners {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    snapshotsInSyncListeners = [[RNFBFirestoreListenerRegistry alloc] init];
  });
}

+ (void)invalidate {
  [self ensureListeners];
  [snapshotsInSyncListeners removeAll];
}

#pragma mark Firebase Firestore Methods

+ (void)setLogLevel:(NSString *)logLevel {
  if ([logLevel isEqualToString:@"debug"] || [logLevel isEqualToString:@"error"]) {
    [[FIRConfiguration sharedInstance] setLoggerLevel:FIRLoggerLevelDebug];
  } else {
    [[FIRConfiguration sharedInstance] setLoggerLevel:FIRLoggerLevelMin];
  }
}

+ (void)disableNetwork:(NSString *)appName
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

+ (void)enableNetwork:(NSString *)appName
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

+ (void)settings:(NSString *)appName
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

+ (void)loadBundle:(NSString *)appName
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

+ (void)clearPersistence:(NSString *)appName
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

+ (void)useEmulator:(NSString *)appName
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

+ (void)waitForPendingWrites:(NSString *)appName
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

+ (void)terminate:(NSString *)appName
       databaseId:(NSString *)databaseId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRFirestore *instance = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                        databaseId:databaseId];

  // Evict only after terminate completes. Clearing instanceCache beforehand lets a concurrent
  // getFirestoreForApp rebuild a production-hosted client while the singleton is still shutting
  // down; later connectFirestoreEmulator is then too late and getDoc can hang (CI release flake).
  // Cache key must be native FIRApp.name (__FIRAPP_DEFAULT), not the JS bridge name ([DEFAULT]).
  [instance terminateWithCompletion:^(NSError *error) {
    if (error) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:[firebaseApp name]
                                                                       databaseId:databaseId];
      [instanceCache removeObjectForKey:firestoreKey];

      // emulatorConfigs is keyed by the JS bridge appName; clear so a later
      // connectFirestoreEmulator can attach the emulator to a freshly created FIRFirestore.
      if (emulatorConfigs != nil) {
        NSString *emulatorKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                        databaseId:databaseId];
        [emulatorConfigs removeObjectForKey:emulatorKey];
      }

      resolve(nil);
    }
  }];
}

+ (void)persistenceCacheIndexManager:(NSString *)appName
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

+ (void)addSnapshotsInSync:(NSString *)appName
                databaseId:(NSString *)databaseId
                listenerId:(double)listenerId {
  [self ensureListeners];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *listenerIdNumber = @(listenerId);
  if ([snapshotsInSyncListeners get:listenerIdNumber] != nil) {
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

  [snapshotsInSyncListeners putOrDiscard:listenerIdNumber value:listener];
}

+ (void)removeSnapshotsInSync:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId {
  [self ensureListeners];
  NSNumber *listenerIdNumber = @(listenerId);
  [snapshotsInSyncListeners takeAndRemove:listenerIdNumber];
}

+ (NSMutableDictionary *)taskProgressToDictionary:(FIRLoadBundleTaskProgress *)progress {
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
