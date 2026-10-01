/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */

#import "FirebaseCore.h"

@implementation FIROptions

- (instancetype)initWithGoogleAppID:(NSString *)googleAppID GCMSenderID:(NSString *)GCMSenderID {
  self = [super init];
  if (self) {
    _googleAppID = [googleAppID copy];
    _GCMSenderID = [GCMSenderID copy];
  }
  return self;
}

@end

@implementation FIRApp

static FIRApp *_Nullable RNFBStubDefaultApp;
static NSMutableDictionary<NSString *, FIRApp *> *_Nullable RNFBStubNamedApps;
static NSString *_Nullable RNFBStubLastLibraryName;
static NSString *_Nullable RNFBStubLastLibraryVersion;
static BOOL RNFBStubRegisterLibraryAvailable = YES;

+ (NSMutableDictionary<NSString *, FIRApp *> *)namedAppsRegistry {
  if (RNFBStubNamedApps == nil) {
    RNFBStubNamedApps = [[NSMutableDictionary alloc] init];
  }
  return RNFBStubNamedApps;
}

- (instancetype)initWithName:(NSString *)name options:(FIROptions *)options {
  self = [super init];
  if (self) {
    _name = [name copy];
    _options = options ?: [[FIROptions alloc] init];
    _dataCollectionDefaultEnabled = NO;
  }
  return self;
}

+ (FIRApp *)defaultApp {
  return RNFBStubDefaultApp;
}

+ (FIRApp *)appNamed:(NSString *)name {
  return [self namedAppsRegistry][name];
}

+ (NSDictionary<NSString *, FIRApp *> *)allApps {
  NSMutableDictionary<NSString *, FIRApp *> *apps = [[NSMutableDictionary alloc] init];
  if (RNFBStubDefaultApp != nil) {
    apps[RNFBStubDefaultApp.name] = RNFBStubDefaultApp;
  }
  [apps addEntriesFromDictionary:[self namedAppsRegistry]];
  return apps.count > 0 ? apps : nil;
}

+ (void)configure {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"stub-app-id"
                                                    GCMSenderID:@"stub-sender"];
  [self configureWithOptions:options];
}

+ (void)configureWithOptions:(FIROptions *)options {
  RNFBStubDefaultApp = [[FIRApp alloc] initWithName:@"__FIRAPP_DEFAULT" options:options];
}

+ (void)configureWithName:(NSString *)name options:(FIROptions *)options {
  FIRApp *app = [[FIRApp alloc] initWithName:name options:options];
  [self namedAppsRegistry][name] = app;
}

+ (void)registerLibrary:(NSString *)name withVersion:(NSString *)version {
  RNFBStubLastLibraryName = [name copy];
  RNFBStubLastLibraryVersion = [version copy];
}

+ (void)setRegisterLibraryAvailableForTesting:(BOOL)available {
  RNFBStubRegisterLibraryAvailable = available;
}

+ (BOOL)respondsToSelector:(SEL)selector {
  if (selector == @selector(registerLibrary:withVersion:) && !RNFBStubRegisterLibraryAvailable) {
    return NO;
  }
  return [super respondsToSelector:selector];
}

- (void)deleteApp:(void (^)(BOOL success))completion {
  if (RNFBStubDefaultApp == self) {
    RNFBStubDefaultApp = nil;
  }
  [[self.class namedAppsRegistry] removeObjectForKey:self.name];
  if (completion) {
    completion(YES);
  }
}

+ (void)setDefaultAppForTesting:(FIRApp *)app {
  RNFBStubDefaultApp = app;
}

+ (void)registerAppForTesting:(FIRApp *)app {
  [self namedAppsRegistry][app.name] = app;
}

+ (void)resetRegistryForTesting {
  RNFBStubDefaultApp = nil;
  [RNFBStubNamedApps removeAllObjects];
  RNFBStubLastLibraryName = nil;
  RNFBStubLastLibraryVersion = nil;
}

+ (NSString *)lastRegisteredLibraryNameForTesting {
  return RNFBStubLastLibraryName;
}

+ (NSString *)lastRegisteredLibraryVersionForTesting {
  return RNFBStubLastLibraryVersion;
}

@end

@implementation FIRConfiguration {
  FIRLoggerLevel _loggerLevel;
}

static FIRConfiguration *_Nullable RNFBStubSharedConfiguration;

+ (instancetype)sharedInstance {
  if (RNFBStubSharedConfiguration == nil) {
    RNFBStubSharedConfiguration = [[FIRConfiguration alloc] init];
  }
  return RNFBStubSharedConfiguration;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _loggerLevel = FIRLoggerLevelError;
  }
  return self;
}

- (FIRLoggerLevel)loggerLevel {
  return _loggerLevel;
}

- (void)setLoggerLevel:(FIRLoggerLevel)loggerLevel {
  _loggerLevel = loggerLevel;
}

+ (void)resetForTesting {
  RNFBStubSharedConfiguration = nil;
}

@end
