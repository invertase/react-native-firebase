/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRAppDistributionRelease
@end

@implementation FIRAppDistribution

static FIRAppDistribution *sSharedInstance;
static void (^sSignInTesterHandler)(FIRAppDistributionSignInTesterCompletion);
static void (^sCheckForUpdateHandler)(FIRAppDistributionCheckForUpdateCompletion);

+ (void)initialize {
  if (self == [FIRAppDistribution class]) {
    sSharedInstance = [[FIRAppDistribution alloc] init];
  }
}

+ (instancetype)appDistribution {
  return sSharedInstance;
}

+ (void (^)(FIRAppDistributionSignInTesterCompletion))signInTesterHandler {
  return sSignInTesterHandler;
}

+ (void)setSignInTesterHandler:
    (void (^)(FIRAppDistributionSignInTesterCompletion))signInTesterHandler {
  sSignInTesterHandler = [signInTesterHandler copy];
}

+ (void (^)(FIRAppDistributionCheckForUpdateCompletion))checkForUpdateHandler {
  return sCheckForUpdateHandler;
}

+ (void)setCheckForUpdateHandler:
    (void (^)(FIRAppDistributionCheckForUpdateCompletion))checkForUpdateHandler {
  sCheckForUpdateHandler = [checkForUpdateHandler copy];
}

+ (void)resetTestState {
  sSignInTesterHandler = nil;
  sCheckForUpdateHandler = nil;
  sSharedInstance.isTesterSignedIn = NO;
}

- (void)signInTesterWithCompletion:(FIRAppDistributionSignInTesterCompletion)completion {
  if (sSignInTesterHandler != nil) {
    sSignInTesterHandler(completion);
    return;
  }
  self.isTesterSignedIn = YES;
  if (completion != nil) {
    completion(nil);
  }
}

- (void)signOutTester {
  self.isTesterSignedIn = NO;
}

- (void)checkForUpdateWithCompletion:(FIRAppDistributionCheckForUpdateCompletion)completion {
  if (sCheckForUpdateHandler != nil) {
    sCheckForUpdateHandler(completion);
    return;
  }
  if (completion != nil) {
    FIRAppDistributionRelease *release = [[FIRAppDistributionRelease alloc] init];
    release.displayVersion = @"1.0.0";
    release.buildVersion = @"1";
    release.releaseNotes = @"notes";
    release.isExpired = NO;
    release.downloadURL = [NSURL URLWithString:@"https://example.com/app.ipa"];
    completion(release, nil);
  }
}

@end
