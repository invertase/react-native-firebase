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

@implementation RNFBFirestoreModule
#pragma mark -
#pragma mark Module Setup

static dispatch_queue_t firestoreQueue;

- (id)init {
  self = [super init];
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    firestoreQueue = dispatch_queue_create("io.invertase.firebase.firestore", DISPATCH_QUEUE_SERIAL);
  });
  return self;
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return firestoreQueue;
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
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  FIRFirestoreSettings *firestoreSettings = [[FIRFirestoreSettings alloc] init];

  firestoreSettings.dispatchQueue = firestoreQueue;

  if (settings[@"host"]) {
    firestoreSettings.host = settings[@"host"];
  } else {
    firestoreSettings.host = firestore.settings.host;
  }

  if (settings[@"persistence"]) {
    firestoreSettings.persistenceEnabled = [settings[@"persistence"] boolValue];
  } else {
    firestoreSettings.persistenceEnabled = firestore.settings.persistenceEnabled;
  }

  if (settings[@"ssl"]) {
    firestoreSettings.sslEnabled = [settings[@"ssl"] boolValue];
  } else {
    firestoreSettings.sslEnabled = firestore.settings.sslEnabled;
  }

  if (settings[@"cacheSizeBytes"]) {
    NSInteger cacheSizeBytes = [settings[@"cacheSizeBytes"] integerValue];

    if (cacheSizeBytes == -1) {
      firestoreSettings.cacheSizeBytes = kFIRFirestoreCacheSizeUnlimited;
    } else {
      // TODO Test this
      firestoreSettings.cacheSizeBytes = (int) cacheSizeBytes;
    }

  } else {
    firestoreSettings.cacheSizeBytes = firestore.settings.cacheSizeBytes;
  }

  firestore.settings = firestoreSettings;
}

@end
