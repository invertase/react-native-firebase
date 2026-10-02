/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Replaces RNFBFirestoreCommon.m so helpers can be driven without the SDK.
 */
#import "RNFBFirestoreCommon.h"

#import <Firebase/Firebase.h>

NSString *const FIRESTORE_CACHE_SIZE = @"firebase_firestore_cache_size";
NSString *const FIRESTORE_HOST = @"firebase_firestore_host";
NSString *const FIRESTORE_PERSISTENCE = @"firebase_firestore_persistence";
NSString *const FIRESTORE_SSL = @"firebase_firestore_ssl";
NSString *const FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR =
    @"firebase_firestore_server_timestamp_behavior";
NSMutableDictionary *instanceCache;

@implementation RNFBFirestoreCommon

+ (dispatch_queue_t)getFirestoreQueue {
  return dispatch_get_main_queue();
}

+ (NSString *)createFirestoreKeyWithAppName:(NSString *)appName databaseId:(NSString *)databaseId {
  return [NSString stringWithFormat:@"%@-%@", appName ?: @"", databaseId ?: @""];
}

+ (FIRFirestore *)getFirestoreForApp:(FIRApp *)firebaseApp databaseId:(NSString *)databaseId {
  (void)firebaseApp;
  (void)databaseId;
  if (FIRFirestore.testInstance != nil) {
    return FIRFirestore.testInstance;
  }
  return [[FIRFirestore alloc] init];
}

+ (void)setFirestoreSettings:(FIRFirestore *)firestore
                     appName:(NSString *)appName
                  databaseId:(NSString *)databaseId {
  (void)firestore;
  (void)appName;
  (void)databaseId;
}

+ (FIRDocumentReference *)getDocumentForFirestore:(FIRFirestore *)firestore path:(NSString *)path {
  (void)firestore;
  FIRDocumentReference *ref = [[FIRDocumentReference alloc] init];
  ref.path = path;
  return ref;
}

+ (FIRQuery *)getQueryForFirestore:(FIRFirestore *)firestore
                              path:(NSString *)path
                              type:(NSString *)type {
  (void)firestore;
  (void)path;
  (void)type;
  return [[FIRQuery alloc] init];
}

+ (void)promiseRejectFirestoreException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  if (reject == nil) {
    return;
  }
  reject(@"firestore/unknown", error.localizedDescription ?: @"error", error);
}

+ (NSArray *)getCodeAndMessage:(NSError *)error {
  return @[ @"firestore/unknown", error.localizedDescription ?: @"error" ];
}

@end
