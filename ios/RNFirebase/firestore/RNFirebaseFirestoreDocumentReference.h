#ifndef RNFirebaseFirestoreDocumentReference_h
#define RNFirebaseFirestoreDocumentReference_h

#import <Foundation/Foundation.h>

#if __has_include(<Firestore/FIRFirestore.h>)

#import <Firestore/Firestore.h>
#import "RNFirebaseFirestore.h"

@interface RNFirebaseFirestoreDocumentReference : NSObject
@property NSString *app;
@property NSString *path;
@property FIRDocumentReference *ref;

- (id)initWithPath:(NSString *)app path:(NSString *)path;
- (void)collections:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)create:(NSDictionary *)data resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)delete:(NSDictionary *)options resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)get:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)set:(NSDictionary *)data options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)update:(NSDictionary *)data resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
+ (NSDictionary *)snapshotToDictionary:(FIRDocumentSnapshot *)documentSnapshot;
@end

#else

@interface RNFirebaseFirestoreDocumentReference : NSObject
@end
#endif

#endif
