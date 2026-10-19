/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase App Distribution for compiling RNFBAppDistributionHelper.m
 * and driving completion branches without linking the SDK.
 */
#import <Foundation/Foundation.h>

@interface FIRAppDistributionRelease : NSObject
@property(nonatomic, copy) NSString *displayVersion;
@property(nonatomic, copy) NSString *buildVersion;
@property(nonatomic, copy, nullable) NSString *releaseNotes;
@property(nonatomic, assign) BOOL isExpired;
@property(nonatomic, strong) NSURL *downloadURL;
@end

typedef void (^FIRAppDistributionSignInTesterCompletion)(NSError *_Nullable error);
typedef void (^FIRAppDistributionCheckForUpdateCompletion)(
    FIRAppDistributionRelease *_Nullable release, NSError *_Nullable error);

@interface FIRAppDistribution : NSObject

@property(nonatomic, assign) BOOL isTesterSignedIn;

+ (instancetype)appDistribution;

- (void)signInTesterWithCompletion:(FIRAppDistributionSignInTesterCompletion)completion;
- (void)signOutTester;
- (void)checkForUpdateWithCompletion:(FIRAppDistributionCheckForUpdateCompletion)completion;

/** Test seams: when set, invoked instead of a network/SDK fetch. */
@property(class, nonatomic, copy, nullable) void (^signInTesterHandler)
    (FIRAppDistributionSignInTesterCompletion completion);
@property(class, nonatomic, copy, nullable) void (^checkForUpdateHandler)
    (FIRAppDistributionCheckForUpdateCompletion completion);

+ (void)resetTestState;

@end
