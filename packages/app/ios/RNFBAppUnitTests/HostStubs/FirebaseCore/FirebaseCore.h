/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@interface FIROptions : NSObject
@property(nonatomic, copy, nullable) NSString *APIKey;
@property(nonatomic, copy, nullable) NSString *googleAppID;
@property(nonatomic, copy, nullable) NSString *projectID;
@property(nonatomic, copy, nullable) NSString *databaseURL;
@property(nonatomic, copy, nullable) NSString *storageBucket;
@property(nonatomic, copy, nullable) NSString *GCMSenderID;
@property(nonatomic, copy, nullable) NSString *clientID;
@end

@interface FIRApp : NSObject
@property(nonatomic, copy, readonly, nonnull) NSString *name;
@property(nonatomic, strong, readonly, nonnull) FIROptions *options;
- (BOOL)isDataCollectionDefaultEnabled;
@end
