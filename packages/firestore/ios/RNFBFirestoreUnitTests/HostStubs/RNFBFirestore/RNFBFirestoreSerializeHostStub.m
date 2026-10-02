/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBFirestoreSerialize.h"

@implementation RNFBFirestoreSerialize

+ (NSDictionary *)querySnapshotToDictionary:(NSString *)source
                                   snapshot:(FIRQuerySnapshot *)snapshot
                     includeMetadataChanges:(BOOL)includeMetadataChanges
                                    appName:(NSString *)appName
                                 databaseId:(NSString *)databaseId {
  (void)snapshot;
  return @{
    @"source" : source ?: @"",
    @"includeMetadataChanges" : @(includeMetadataChanges),
    @"appName" : appName ?: @"",
    @"databaseId" : databaseId ?: @"",
  };
}

+ (NSDictionary *)documentChangeToDictionary:(FIRDocumentChange *)documentChange
                            isMetadataChange:(BOOL)isMetadataChange
                                     appName:(NSString *)appName
                                  databaseId:(NSString *)databaseId {
  (void)documentChange;
  (void)isMetadataChange;
  (void)appName;
  (void)databaseId;
  return @{};
}

+ (NSDictionary *)documentSnapshotToDictionary:(FIRDocumentSnapshot *)snapshot
                                  firestoreKey:(NSString *)firestoreKey {
  (void)snapshot;
  return [NSMutableDictionary dictionaryWithDictionary:@{
    @"firestoreKey" : firestoreKey ?: @"",
  }];
}

+ (NSDictionary *)serializeDictionary:(NSDictionary *)dictionary {
  return dictionary ?: @{};
}

+ (NSArray *)serializeArray:(NSArray *)array {
  return array ?: @[];
}

+ (NSArray *)buildTypeMap:(id)value {
  (void)value;
  return @[ @"null", [NSNull null] ];
}

+ (NSDictionary *)parseNSDictionary:(FIRFirestore *)firestore
                         dictionary:(NSDictionary *)dictionary {
  (void)firestore;
  return dictionary ?: @{};
}

+ (NSArray *)parseNSArray:(FIRFirestore *)firestore array:(NSArray *)array {
  (void)firestore;
  return array ?: @[];
}

+ (id)parseTypeMap:(FIRFirestore *)firestore typeMap:(NSArray *)typeMap {
  (void)firestore;
  return typeMap;
}

@end
