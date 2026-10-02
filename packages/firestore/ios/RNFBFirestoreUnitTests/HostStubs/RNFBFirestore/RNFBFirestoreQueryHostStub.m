/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Pass-through wrapper so Collection helper can be driven without FIRFieldPath.
 */
#import "RNFBFirestoreQuery.h"

@implementation RNFBFirestoreQuery

- (id)initWithModifiers:(FIRFirestore *)firestore
                  query:(FIRQuery *)query
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options {
  self = [super init];
  if (self) {
    _firestore = firestore;
    _query = query;
    _filters = filters;
    _orders = orders;
    _options = options;
  }
  return self;
}

- (FIRQuery *)instance {
  return _query;
}

@end
