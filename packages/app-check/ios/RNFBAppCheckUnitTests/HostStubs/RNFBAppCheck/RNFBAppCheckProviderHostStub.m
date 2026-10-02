/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Replaces production RNFBAppCheckProvider.m (DeviceCheck / App Attest / debug SDK).
 */
#import "RNFBAppCheckProvider.h"

NSString *const kRNFBAppCheckProviderNotReadyMessage =
    @"App Check provider is not ready. Call initializeAppCheck before requesting tokens.";

@interface RNFBAppCheckHostStubDelegateProvider : NSObject <FIRAppCheckProvider>
@end

@implementation RNFBAppCheckHostStubDelegateProvider
@end

@implementation RNFBAppCheckProvider

- (id)initWithApp:(FIRApp *)app {
  self = [super init];
  if (self) {
    self.app = app;
  }
  return self;
}

- (void)configure:(FIRApp *)app
     providerName:(NSString *)providerName
       debugToken:(NSString *)debugToken {
  (void)providerName;
  (void)debugToken;
  self.app = app;
  // Mark ready so Helper RejectIfProviderNotReady allows token APIs.
  self.delegateProvider = [[RNFBAppCheckHostStubDelegateProvider alloc] init];
}

- (void)getTokenWithCompletion:(nonnull void (^)(FIRAppCheckToken *_Nullable,
                                                 NSError *_Nullable))handler {
  if (handler != nil) {
    handler(nil, [NSError errorWithDomain:@"RNFBAppCheckHostStub"
                                     code:0
                                 userInfo:@{
                                   @"code" : @"provider-not-ready",
                                   NSLocalizedDescriptionKey : kRNFBAppCheckProviderNotReadyMessage,
                                 }]);
  }
}

@end
