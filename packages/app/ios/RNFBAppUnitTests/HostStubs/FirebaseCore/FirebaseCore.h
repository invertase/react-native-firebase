/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

/**
 * Mirrors FirebaseCore `FIRLoggerLevel` raw values
 * (`FirebaseCore/Sources/Public/FirebaseCore/FIRLoggerLevel.h`).
 */
typedef NS_ENUM(NSInteger, FIRLoggerLevel) {
  FIRLoggerLevelError = 3,
  FIRLoggerLevelWarning = 4,
  FIRLoggerLevelNotice = 5,
  FIRLoggerLevelInfo = 6,
  FIRLoggerLevelDebug = 7,
};

@interface FIROptions : NSObject
- (nonnull instancetype)initWithGoogleAppID:(nullable NSString *)googleAppID
                                GCMSenderID:(nullable NSString *)GCMSenderID;
@property(nonatomic, copy, nullable) NSString *APIKey;
@property(nonatomic, copy, nullable) NSString *googleAppID;
@property(nonatomic, copy, nullable) NSString *projectID;
@property(nonatomic, copy, nullable) NSString *databaseURL;
@property(nonatomic, copy, nullable) NSString *storageBucket;
@property(nonatomic, copy, nullable) NSString *GCMSenderID;
@property(nonatomic, copy, nullable) NSString *clientID;
@property(nonatomic, copy, nullable) NSString *bundleID;
@end

@interface FIRApp : NSObject
@property(nonatomic, copy, readonly, nonnull) NSString *name;
@property(nonatomic, strong, readonly, nonnull) FIROptions *options;
- (nonnull instancetype)initWithName:(nonnull NSString *)name
                             options:(nullable FIROptions *)options;
- (void)setDataCollectionDefaultEnabled:(BOOL)enabled;
- (BOOL)isDataCollectionDefaultEnabled;

+ (nullable FIRApp *)defaultApp;
+ (nullable FIRApp *)appNamed:(nonnull NSString *)name;

+ (void)setDefaultAppForTesting:(nullable FIRApp *)app;
+ (void)registerAppForTesting:(nonnull FIRApp *)app;
+ (void)resetRegistryForTesting;
@end

@interface FIRConfiguration : NSObject
@property(nonatomic, assign, readonly) FIRLoggerLevel loggerLevel;

+ (nonnull instancetype)sharedInstance;
- (void)setLoggerLevel:(FIRLoggerLevel)loggerLevel;

+ (void)resetForTesting;
@end
