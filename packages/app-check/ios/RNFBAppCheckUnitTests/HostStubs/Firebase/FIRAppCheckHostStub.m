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

@implementation FIRAppCheckToken {
  NSString *_token;
}

- (instancetype)initWithToken:(NSString *)token {
  self = [super init];
  if (self) {
    _token = [token copy];
  }
  return self;
}

- (NSString *)token {
  return _token;
}

@end

@implementation FIRAppCheck

static id<FIRAppCheckProviderFactory> sFactory;
static void (^sTokenForcingRefreshHandler)(BOOL, FIRAppCheckTokenCompletionBlock);
static void (^sLimitedUseTokenHandler)(FIRAppCheckTokenCompletionBlock);
static NSMutableDictionary<NSString *, FIRAppCheck *> *sInstances;

+ (void)initialize {
  if (self == [FIRAppCheck class]) {
    sInstances = [NSMutableDictionary new];
  }
}

+ (void)setAppCheckProviderFactory:(id<FIRAppCheckProviderFactory>)factory {
  sFactory = factory;
}

+ (void (^)(BOOL, FIRAppCheckTokenCompletionBlock))tokenForcingRefreshHandler {
  return sTokenForcingRefreshHandler;
}

+ (void)setTokenForcingRefreshHandler:
    (void (^)(BOOL, FIRAppCheckTokenCompletionBlock))tokenForcingRefreshHandler {
  sTokenForcingRefreshHandler = [tokenForcingRefreshHandler copy];
}

+ (void (^)(FIRAppCheckTokenCompletionBlock))limitedUseTokenHandler {
  return sLimitedUseTokenHandler;
}

+ (void)setLimitedUseTokenHandler:
    (void (^)(FIRAppCheckTokenCompletionBlock))limitedUseTokenHandler {
  sLimitedUseTokenHandler = [limitedUseTokenHandler copy];
}

+ (void)resetTestState {
  sTokenForcingRefreshHandler = nil;
  sLimitedUseTokenHandler = nil;
  [sInstances removeAllObjects];
}

+ (instancetype)appCheckWithApp:(FIRApp *)app {
  NSString *key = app.name ?: @"__nil__";
  FIRAppCheck *existing = sInstances[key];
  if (existing != nil) {
    return existing;
  }
  FIRAppCheck *created = [[FIRAppCheck alloc] init];
  sInstances[key] = created;
  return created;
}

- (void)tokenForcingRefresh:(BOOL)forceRefresh
                 completion:(FIRAppCheckTokenCompletionBlock)completion {
  if (sTokenForcingRefreshHandler != nil) {
    sTokenForcingRefreshHandler(forceRefresh, completion);
    return;
  }
  if (completion != nil) {
    completion(nil, nil);
  }
}

- (void)limitedUseTokenWithCompletion:(FIRAppCheckTokenCompletionBlock)completion {
  if (sLimitedUseTokenHandler != nil) {
    sLimitedUseTokenHandler(completion);
    return;
  }
  if (completion != nil) {
    completion(nil, nil);
  }
}

@end
