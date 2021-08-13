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

@interface RNFBFirestoreSerialize : NSObject

+ (NSDictionary *)querySnapshotToDictionary:(NSString *)source
                                   snapshot:(FIRQuerySnapshot *)snapshot
                     includeMetadataChanges:(BOOL)includeMetadataChanges
                                    appName:(NSString *)appName;

+ (NSDictionary *)documentChangeToDictionary:(FIRDocumentChange *)documentChange
                            isMetadataChange:(BOOL)isMetadataChange
                                     appName:(NSString *)appName;

+ (NSDictionary *)documentSnapshotToDictionary:(FIRDocumentSnapshot *)snapshot
                                       appName:(NSString *)appName;

+ (NSDictionary *)serializeDictionary:(NSDictionary *)dictionary;

+ (NSArray *)serializeArray:(NSArray *)array;

+ (NSArray *)buildTypeMap:(id)value;

+ (NSDictionary *)parseNSDictionary:(FIRFirestore *)firestore dictionary:(NSDictionary *)dictionary;

+ (NSArray *)parseNSArray:(FIRFirestore *)firestore array:(NSArray *)array;

+ (id)parseTypeMap:(FIRFirestore *)firestore typeMap:(NSArray *)typeMap;

@end
