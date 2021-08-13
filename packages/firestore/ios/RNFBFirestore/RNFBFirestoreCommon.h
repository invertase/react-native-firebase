//
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
#import <React/RCTBridgeModule.h>

@interface RNFBFirestoreCommon : NSObject

+ (dispatch_queue_t)getFirestoreQueue;

+ (FIRFirestore *)getFirestoreForApp:(FIRApp *)firebaseApp;

+ (void)setFirestoreSettings:(FIRFirestore *)firestore appName:(NSString *)appName;

+ (FIRDocumentReference *)getDocumentForFirestore:(FIRFirestore *)firestore path:(NSString *)path;

+ (FIRQuery *)getQueryForFirestore:(FIRFirestore *)firestore
                              path:(NSString *)path
                              type:(NSString *)type;

+ (void)promiseRejectFirestoreException:(RCTPromiseRejectBlock)reject error:(NSError *)error;

+ (NSArray *)getCodeAndMessage:(NSError *)error;

@end

extern NSString *const FIRESTORE_CACHE_SIZE;
extern NSString *const FIRESTORE_HOST;
extern NSString *const FIRESTORE_PERSISTENCE;
extern NSString *const FIRESTORE_SSL;
extern NSString *const FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR;
extern NSMutableDictionary *instanceCache;
