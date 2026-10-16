/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Core / Installations for compiling RNFBInstallationsHelper.m
 * and driving completion branches without linking the SDK.
 */
#import <Foundation/Foundation.h>

@interface FIRApp : NSObject
@property(nonatomic, copy) NSString *name;
- (instancetype)initWithName:(NSString *)name;
@end

@interface FIRInstallationsAuthTokenResult : NSObject
@property(nonatomic, readonly, copy) NSString *authToken;
- (instancetype)initWithAuthToken:(NSString *)authToken;
@end

typedef void (^FIRInstallationsDeleteCompletion)(NSError *_Nullable error);
typedef void (^FIRInstallationsIDHandler)(NSString *_Nullable identifier, NSError *_Nullable error);
typedef void (^FIRInstallationsTokenHandler)(FIRInstallationsAuthTokenResult *_Nullable token,
                                             NSError *_Nullable error);

@interface FIRInstallations : NSObject

+ (instancetype)installationsWithApp:(FIRApp *)app;

- (void)deleteWithCompletion:(FIRInstallationsDeleteCompletion)completion;
- (void)installationIDWithCompletion:(FIRInstallationsIDHandler)completion;
- (void)authTokenForcingRefresh:(BOOL)forceRefresh
                     completion:(FIRInstallationsTokenHandler)completion;

/** Test seams: when set, invoked instead of a network/SDK fetch. */
@property(class, nonatomic, copy, nullable) void (^deleteHandler)
    (FIRInstallationsDeleteCompletion completion);
@property(class, nonatomic, copy, nullable) void (^installationIDHandler)
    (FIRInstallationsIDHandler completion);
@property(class, nonatomic, copy, nullable) void (^authTokenHandler)
    (BOOL forceRefresh, FIRInstallationsTokenHandler completion);

+ (void)resetTestState;

@end
