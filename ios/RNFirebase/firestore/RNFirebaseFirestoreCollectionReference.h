#ifndef RNFirebaseFirestoreCollectionReference_h
#define RNFirebaseFirestoreCollectionReference_h
#import <Foundation/Foundation.h>

#if __has_include(<Firestore/FIRFirestore.h>)

#import <Firestore/Firestore.h>
#import "RNFirebaseFirestore.h"
#import "RNFirebaseFirestoreDocumentReference.h"

@interface RNFirebaseFirestoreCollectionReference : NSObject
@property NSString *app;
@property NSString *path;
@property NSArray *filters;
@property NSArray *orders;
@property NSDictionary *options;
@property FIRQuery *query;

- (id)initWithPathAndModifiers:(NSString *)app path:(NSString *)path filters:(NSArray *)filters orders:(NSArray *)orders options:(NSDictionary *)options;
- (void)get:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
+ (NSDictionary *)snapshotToDictionary:(FIRQuerySnapshot *)querySnapshot;
@end

#else

@interface RNFirebaseFirestoreCollectionReference : NSObject
@end
#endif

#endif
