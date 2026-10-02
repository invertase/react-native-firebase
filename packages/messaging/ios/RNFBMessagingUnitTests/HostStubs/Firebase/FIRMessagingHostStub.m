/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRMessaging

static BOOL sAutoInitEnabled;
static NSData *sAPNSToken;
static NSString *sLastRetrieveSenderID;
static NSString *sRetrieveFCMTokenResult;
static NSError *sRetrieveFCMTokenError;
static NSString *sLastDeleteSenderID;
static NSError *sDeleteFCMTokenError;
static NSData *sLastSetAPNSTokenData;
static FIRMessagingAPNSTokenType sLastSetAPNSTokenType;
static NSString *sLastSubscribeTopic;
static NSString *sLastUnsubscribeTopic;
static NSError *sTopicOperationError;
static NSUInteger sSubscribeCallCount;
static NSUInteger sUnsubscribeCallCount;

+ (instancetype)messaging {
  static FIRMessaging *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[FIRMessaging alloc] init];
  });
  return shared;
}

+ (void)resetTestState {
  sAutoInitEnabled = NO;
  sAPNSToken = nil;
  sLastRetrieveSenderID = nil;
  sRetrieveFCMTokenResult = @"stub-fcm-token";
  sRetrieveFCMTokenError = nil;
  sLastDeleteSenderID = nil;
  sDeleteFCMTokenError = nil;
  sLastSetAPNSTokenData = nil;
  sLastSetAPNSTokenType = FIRMessagingAPNSTokenTypeUnknown;
  sLastSubscribeTopic = nil;
  sLastUnsubscribeTopic = nil;
  sTopicOperationError = nil;
  sSubscribeCallCount = 0;
  sUnsubscribeCallCount = 0;
  [FIRMessaging messaging].autoInitEnabled = NO;
  [FIRMessaging messaging].APNSToken = nil;
}

- (BOOL)autoInitEnabled {
  return sAutoInitEnabled;
}

- (void)setAutoInitEnabled:(BOOL)autoInitEnabled {
  sAutoInitEnabled = autoInitEnabled;
}

- (NSData *)APNSToken {
  return sAPNSToken;
}

- (void)setAPNSToken:(NSData *)APNSToken {
  sAPNSToken = [APNSToken copy];
}

- (void)retrieveFCMTokenForSenderID:(NSString *)senderID
                         completion:(FIRMessagingFCMTokenCompletion)completion {
  sLastRetrieveSenderID = [senderID copy];
  if (completion != nil) {
    completion(sRetrieveFCMTokenResult, sRetrieveFCMTokenError);
  }
}

- (void)deleteFCMTokenForSenderID:(NSString *)senderID
                       completion:(FIRMessagingDeleteFCMTokenCompletion)completion {
  sLastDeleteSenderID = [senderID copy];
  if (completion != nil) {
    completion(sDeleteFCMTokenError);
  }
}

- (void)setAPNSToken:(NSData *)token type:(FIRMessagingAPNSTokenType)type {
  sLastSetAPNSTokenData = [token copy];
  sLastSetAPNSTokenType = type;
  sAPNSToken = [token copy];
}

- (void)subscribeToTopic:(NSString *)topic
              completion:(FIRMessagingTopicOperationCompletion)completion {
  sSubscribeCallCount += 1;
  sLastSubscribeTopic = [topic copy];
  if (completion != nil) {
    completion(sTopicOperationError);
  }
}

- (void)unsubscribeFromTopic:(NSString *)topic
                  completion:(FIRMessagingTopicOperationCompletion)completion {
  sUnsubscribeCallCount += 1;
  sLastUnsubscribeTopic = [topic copy];
  if (completion != nil) {
    completion(sTopicOperationError);
  }
}

+ (NSString *)lastRetrieveSenderID {
  return sLastRetrieveSenderID;
}

+ (void)setLastRetrieveSenderID:(NSString *)lastRetrieveSenderID {
  sLastRetrieveSenderID = [lastRetrieveSenderID copy];
}

+ (NSString *)retrieveFCMTokenResult {
  return sRetrieveFCMTokenResult;
}

+ (void)setRetrieveFCMTokenResult:(NSString *)retrieveFCMTokenResult {
  sRetrieveFCMTokenResult = [retrieveFCMTokenResult copy];
}

+ (NSError *)retrieveFCMTokenError {
  return sRetrieveFCMTokenError;
}

+ (void)setRetrieveFCMTokenError:(NSError *)retrieveFCMTokenError {
  sRetrieveFCMTokenError = retrieveFCMTokenError;
}

+ (NSString *)lastDeleteSenderID {
  return sLastDeleteSenderID;
}

+ (void)setLastDeleteSenderID:(NSString *)lastDeleteSenderID {
  sLastDeleteSenderID = [lastDeleteSenderID copy];
}

+ (NSError *)deleteFCMTokenError {
  return sDeleteFCMTokenError;
}

+ (void)setDeleteFCMTokenError:(NSError *)deleteFCMTokenError {
  sDeleteFCMTokenError = deleteFCMTokenError;
}

+ (NSData *)lastSetAPNSTokenData {
  return sLastSetAPNSTokenData;
}

+ (void)setLastSetAPNSTokenData:(NSData *)lastSetAPNSTokenData {
  sLastSetAPNSTokenData = [lastSetAPNSTokenData copy];
}

+ (FIRMessagingAPNSTokenType)lastSetAPNSTokenType {
  return sLastSetAPNSTokenType;
}

+ (void)setLastSetAPNSTokenType:(FIRMessagingAPNSTokenType)lastSetAPNSTokenType {
  sLastSetAPNSTokenType = lastSetAPNSTokenType;
}

+ (NSString *)lastSubscribeTopic {
  return sLastSubscribeTopic;
}

+ (void)setLastSubscribeTopic:(NSString *)lastSubscribeTopic {
  sLastSubscribeTopic = [lastSubscribeTopic copy];
}

+ (NSString *)lastUnsubscribeTopic {
  return sLastUnsubscribeTopic;
}

+ (void)setLastUnsubscribeTopic:(NSString *)lastUnsubscribeTopic {
  sLastUnsubscribeTopic = [lastUnsubscribeTopic copy];
}

+ (NSError *)topicOperationError {
  return sTopicOperationError;
}

+ (void)setTopicOperationError:(NSError *)topicOperationError {
  sTopicOperationError = topicOperationError;
}

+ (NSUInteger)subscribeCallCount {
  return sSubscribeCallCount;
}

+ (void)setSubscribeCallCount:(NSUInteger)subscribeCallCount {
  sSubscribeCallCount = subscribeCallCount;
}

+ (NSUInteger)unsubscribeCallCount {
  return sUnsubscribeCallCount;
}

+ (void)setUnsubscribeCallCount:(NSUInteger)unsubscribeCallCount {
  sUnsubscribeCallCount = unsubscribeCallCount;
}

@end
