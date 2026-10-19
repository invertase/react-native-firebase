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
} NS_SWIFT_NAME(FirebaseLoggerLevel);

NS_SWIFT_NAME(FirebaseOptions)
@interface FIROptions : NSObject
- (nonnull instancetype)initWithGoogleAppID:(nullable NSString *)googleAppID
                                GCMSenderID:(nullable NSString *)GCMSenderID;
@property(nonatomic, copy, nullable) NSString *APIKey NS_SWIFT_NAME(apiKey);
@property(nonatomic, copy, nullable) NSString *googleAppID;
@property(nonatomic, copy, nullable) NSString *projectID;
@property(nonatomic, copy, nullable) NSString *databaseURL;
@property(nonatomic, copy, nullable) NSString *storageBucket;
@property(nonatomic, copy, nullable) NSString *GCMSenderID NS_SWIFT_NAME(gcmSenderID);
@property(nonatomic, copy, nullable) NSString *clientID;
@property(nonatomic, copy, nullable) NSString *bundleID;
@property(nonatomic, copy, nullable) NSString *appGroupID;
@end

/**
 * Mirrors FirebaseCore `FIRApp` Swift names
 * (`FirebaseCore/Sources/Public/FirebaseCore/FIRApp.h`: `NS_SWIFT_NAME(FirebaseApp)`,
 * `defaultApp` → `app()`, `appNamed:` → `app(name:)`).
 */
NS_SWIFT_NAME(FirebaseApp)
@interface FIRApp : NSObject
@property(nonatomic, copy, readonly, nonnull) NSString *name;
@property(nonatomic, strong, readonly, nonnull) FIROptions *options;
- (nonnull instancetype)initWithName:(nonnull NSString *)name
                             options:(nullable FIROptions *)options;
@property(nonatomic, readwrite, getter=isDataCollectionDefaultEnabled)
    BOOL dataCollectionDefaultEnabled;

+ (nullable FIRApp *)defaultApp NS_SWIFT_NAME(app());
+ (nullable FIRApp *)appNamed:(nonnull NSString *)name NS_SWIFT_NAME(app(name:));
@property(class, readonly, nullable) NSDictionary<NSString *, FIRApp *> *allApps;

+ (void)configure;
+ (void)configureWithOptions:(nonnull FIROptions *)options NS_SWIFT_NAME(configure(options:));
+ (void)configureWithName:(nonnull NSString *)name
                  options:(nonnull FIROptions *)options NS_SWIFT_NAME(configure(name:options:));

+ (void)registerLibrary:(nonnull NSString *)name withVersion:(nonnull NSString *)version;
+ (void)setRegisterLibraryAvailableForTesting:(BOOL)available;

- (void)deleteApp:(void (^_Nonnull)(BOOL success))completion;

+ (void)setDefaultAppForTesting:(nullable FIRApp *)app;
+ (void)registerAppForTesting:(nonnull FIRApp *)app;
+ (void)resetRegistryForTesting;

+ (nullable NSString *)lastRegisteredLibraryNameForTesting;
+ (nullable NSString *)lastRegisteredLibraryVersionForTesting;
@end

NS_SWIFT_NAME(FirebaseConfiguration)
@interface FIRConfiguration : NSObject
@property(nonatomic, assign, readonly) FIRLoggerLevel loggerLevel;

@property(class, nonatomic, readonly, nonnull)
    FIRConfiguration *sharedInstance NS_SWIFT_NAME(shared);
- (void)setLoggerLevel:(FIRLoggerLevel)loggerLevel;

+ (void)resetForTesting;
@end
