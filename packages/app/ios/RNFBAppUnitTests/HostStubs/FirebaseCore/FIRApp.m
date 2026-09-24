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

@implementation FIRApp {
  BOOL _dataCollectionDefaultEnabled;
}

static FIRApp *_Nullable RNFBStubDefaultApp;
static NSMutableDictionary<NSString *, FIRApp *> *_Nullable RNFBStubNamedApps;

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

- (void)setDataCollectionDefaultEnabled:(BOOL)enabled {
  _dataCollectionDefaultEnabled = enabled;
}

- (BOOL)isDataCollectionDefaultEnabled {
  return _dataCollectionDefaultEnabled;
}

+ (FIRApp *)defaultApp {
  return RNFBStubDefaultApp;
}

+ (FIRApp *)appNamed:(NSString *)name {
  return [self namedAppsRegistry][name];
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
