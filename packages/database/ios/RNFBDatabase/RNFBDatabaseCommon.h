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


#import <React/RCTBridgeModule.h>
#import <Firebase/Firebase.h>

@interface RNFBDatabaseCommon : NSObject

+ (FIRDatabase *)getDatabaseForApp
    :(FIRApp *)firebaseApp
                             dbURL:(NSString *)dbURL;

+ (dispatch_queue_t)getDispatchQueue;

+ (void)setDatabaseConfig:(FIRDatabase *)firDatabase dbURL:(NSString *)dbURL;

+ (FIRDatabaseReference *)getReferenceForDatabase:(FIRDatabase *)firebaseDatabase path:(NSString *)path;

+ (FIRDatabaseReference *)getReferenceForDatabase:(NSString *)key firebaseDatabase:(FIRDatabase *)firebaseDatabase path:(NSString *)path;

+ (void)removeReferenceByKey:(NSString *)key;

+ (void)promiseRejectDatabaseException:(RCTPromiseRejectBlock)reject error:(NSError *)error;

+ (NSArray *)getCodeAndMessage:(NSError *)error;

+ (int)getEventTypeFromName:(NSString *)name;

+ (NSDictionary *)snapshotWithPreviousChildToDictionary:(FIRDataSnapshot *)snapshot previousChildName:(NSString *)previousChildName;

+ (NSDictionary *)snapshotToDictionary:(FIRDataSnapshot *)dataSnapshot;

+ (NSMutableArray *)getSnapshotChildKeys:(FIRDataSnapshot *)dataSnapshot;

@end

extern NSString *const DATABASE_PERSISTENCE_ENABLED;
extern NSString *const DATABASE_LOGGING_ENABLED;
extern NSString *const DATABASE_PERSISTENCE_CACHE_SIZE;
