/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRApp

- (instancetype)initWithName:(NSString *)name {
  self = [super init];
  if (self) {
    _name = [name copy];
  }
  return self;
}

@end

@implementation FIRInstallationsAuthTokenResult {
  NSString *_authToken;
}

- (instancetype)initWithAuthToken:(NSString *)authToken {
  self = [super init];
  if (self) {
    _authToken = [authToken copy];
  }
  return self;
}

- (NSString *)authToken {
  return _authToken;
}

@end

@implementation FIRInstallations

static void (^sDeleteHandler)(FIRInstallationsDeleteCompletion);
static void (^sInstallationIDHandler)(FIRInstallationsIDHandler);
static void (^sAuthTokenHandler)(BOOL, FIRInstallationsTokenHandler);
static NSMutableDictionary<NSString *, FIRInstallations *> *sInstances;

+ (void)initialize {
  if (self == [FIRInstallations class]) {
    sInstances = [NSMutableDictionary new];
  }
}

+ (void (^)(FIRInstallationsDeleteCompletion))deleteHandler {
  return sDeleteHandler;
}

+ (void)setDeleteHandler:(void (^)(FIRInstallationsDeleteCompletion))deleteHandler {
  sDeleteHandler = [deleteHandler copy];
}

+ (void (^)(FIRInstallationsIDHandler))installationIDHandler {
  return sInstallationIDHandler;
}

+ (void)setInstallationIDHandler:(void (^)(FIRInstallationsIDHandler))installationIDHandler {
  sInstallationIDHandler = [installationIDHandler copy];
}

+ (void (^)(BOOL, FIRInstallationsTokenHandler))authTokenHandler {
  return sAuthTokenHandler;
}

+ (void)setAuthTokenHandler:(void (^)(BOOL, FIRInstallationsTokenHandler))authTokenHandler {
  sAuthTokenHandler = [authTokenHandler copy];
}

+ (void)resetTestState {
  sDeleteHandler = nil;
  sInstallationIDHandler = nil;
  sAuthTokenHandler = nil;
  [sInstances removeAllObjects];
}

+ (instancetype)installationsWithApp:(FIRApp *)app {
  NSString *key = app.name ?: @"__nil__";
  FIRInstallations *existing = sInstances[key];
  if (existing != nil) {
    return existing;
  }
  FIRInstallations *created = [[FIRInstallations alloc] init];
  sInstances[key] = created;
  return created;
}

- (void)deleteWithCompletion:(FIRInstallationsDeleteCompletion)completion {
  if (sDeleteHandler != nil) {
    sDeleteHandler(completion);
    return;
  }
  if (completion != nil) {
    completion(nil);
  }
}

- (void)installationIDWithCompletion:(FIRInstallationsIDHandler)completion {
  if (sInstallationIDHandler != nil) {
    sInstallationIDHandler(completion);
    return;
  }
  if (completion != nil) {
    completion(@"stub-installation-id", nil);
  }
}

- (void)authTokenForcingRefresh:(BOOL)forceRefresh
                     completion:(FIRInstallationsTokenHandler)completion {
  if (sAuthTokenHandler != nil) {
    sAuthTokenHandler(forceRefresh, completion);
    return;
  }
  if (completion != nil) {
    completion([[FIRInstallationsAuthTokenResult alloc] initWithAuthToken:@"stub-auth-token"], nil);
  }
}

@end
