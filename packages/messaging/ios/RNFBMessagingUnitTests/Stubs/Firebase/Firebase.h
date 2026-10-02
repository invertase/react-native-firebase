/**
 * Host-test stand-in for the Firebase umbrella header. Only the FIRMessaging surface compiled by
 * RNFBMessagingModule.mm and RNFBMessaging+FIRMessagingDelegate.m is declared. Test knobs are
 * suffixed `ForTesting`. See IosTest-AD-1 (okf-bundle/testing/ios-architecture-decisions.md).
 */

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

@class FIRMessaging;

typedef NS_ENUM(NSInteger, FIRMessagingAPNSTokenType) {
  FIRMessagingAPNSTokenTypeUnknown,
  FIRMessagingAPNSTokenTypeSandbox,
  FIRMessagingAPNSTokenTypeProd,
};

@protocol FIRMessagingDelegate <NSObject>
@optional
- (void)messaging:(FIRMessaging *)messaging
    didReceiveRegistrationToken:(nullable NSString *)fcmToken;
- (void)messaging:(FIRMessaging *)messaging
    didReceiveRegistration:(nullable NSString *)installationId;
- (void)messaging:(FIRMessaging *)messaging didUnregister:(NSString *)installationId;
@end

@interface FIRMessaging : NSObject

+ (instancetype)messaging;

@property(nonatomic, weak, nullable) id<FIRMessagingDelegate> delegate;
@property(nonatomic, assign) BOOL autoInitEnabled;
@property(nonatomic, copy, nullable) NSData *APNSToken;
@property(nonatomic, readonly, getter=isInstallationIdEnabled) BOOL installationIdEnabled;

- (void)setAPNSToken:(NSData *)apnsToken type:(FIRMessagingAPNSTokenType)type;
- (void)registerWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)unregisterWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)retrieveFCMTokenForSenderID:(NSString *)senderID
                         completion:(void (^)(NSString *_Nullable token,
                                              NSError *_Nullable error))completion;
- (void)deleteFCMTokenForSenderID:(NSString *)senderID
                       completion:(void (^)(NSError *_Nullable error))completion;
- (void)subscribeToTopic:(NSString *)topic
              completion:(void (^)(NSError *_Nullable error))completion;
- (void)unsubscribeFromTopic:(NSString *)topic
                  completion:(void (^)(NSError *_Nullable error))completion;

#pragma mark Test knobs

@property(nonatomic, assign) BOOL installationIdEnabledForTesting;
/// Error handed to `registerWithCompletion:` / `unregisterWithCompletion:`; nil means success.
@property(nonatomic, strong, nullable) NSError *completionErrorForTesting;
@property(nonatomic, assign) NSUInteger registerCallCountForTesting;
@property(nonatomic, assign) NSUInteger unregisterCallCountForTesting;
- (void)resetForTesting;

@end

NS_ASSUME_NONNULL_END
