/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Messaging for compiling RNFBMessagingHelper.m
 * and asserting SDK call wiring without linking the real SDK.
 */
#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

typedef NS_ENUM(NSInteger, FIRMessagingAPNSTokenType) {
  FIRMessagingAPNSTokenTypeUnknown,
  FIRMessagingAPNSTokenTypeSandbox,
  FIRMessagingAPNSTokenTypeProd,
};

typedef void (^FIRMessagingFCMTokenCompletion)(NSString *_Nullable token, NSError *_Nullable error);
typedef void (^FIRMessagingDeleteFCMTokenCompletion)(NSError *_Nullable error);
typedef void (^FIRMessagingTopicOperationCompletion)(NSError *_Nullable error);

@class FIRMessaging;

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

- (void)retrieveFCMTokenForSenderID:(NSString *)senderID
                         completion:(FIRMessagingFCMTokenCompletion)completion;
- (void)deleteFCMTokenForSenderID:(NSString *)senderID
                       completion:(FIRMessagingDeleteFCMTokenCompletion)completion;
- (void)setAPNSToken:(NSData *)token type:(FIRMessagingAPNSTokenType)type;
- (void)subscribeToTopic:(NSString *)topic
              completion:(FIRMessagingTopicOperationCompletion)completion;
- (void)unsubscribeFromTopic:(NSString *)topic
                  completion:(FIRMessagingTopicOperationCompletion)completion;
- (void)registerWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)unregisterWithCompletion:(void (^)(NSError *_Nullable error))completion;

/** Test seams */
@property(class, nonatomic, copy, nullable) NSString *lastRetrieveSenderID;
@property(class, nonatomic, copy, nullable) NSString *retrieveFCMTokenResult;
@property(class, nonatomic, copy, nullable) NSError *retrieveFCMTokenError;
@property(class, nonatomic, copy, nullable) NSString *lastDeleteSenderID;
@property(class, nonatomic, copy, nullable) NSError *deleteFCMTokenError;
@property(class, nonatomic, copy, nullable) NSData *lastSetAPNSTokenData;
@property(class, nonatomic, assign) FIRMessagingAPNSTokenType lastSetAPNSTokenType;
@property(class, nonatomic, copy, nullable) NSString *lastSubscribeTopic;
@property(class, nonatomic, copy, nullable) NSString *lastUnsubscribeTopic;
@property(class, nonatomic, copy, nullable) NSError *topicOperationError;
@property(class, nonatomic, assign) NSUInteger subscribeCallCount;
@property(class, nonatomic, assign) NSUInteger unsubscribeCallCount;
@property(nonatomic, assign) BOOL installationIdEnabledForTesting;
@property(nonatomic, strong, nullable) NSError *completionErrorForTesting;
@property(nonatomic, assign) NSUInteger registerCallCountForTesting;
@property(nonatomic, assign) NSUInteger unregisterCallCountForTesting;
- (void)resetForTesting;

+ (void)resetTestState;

@end
