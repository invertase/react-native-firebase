#import "RNFirebaseInvites.h"

#if __has_include(<FirebaseInvites/FirebaseInvites.h>)
#import "RNFirebaseEvents.h"
#import <FirebaseInvites/FirebaseInvites.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@implementation RNFirebaseInvites

static RNFirebaseInvites *theRNFirebaseInvites = nil;

+ (nonnull instancetype)instance {
    return theRNFirebaseInvites;
}

RCT_EXPORT_MODULE()

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseInvites instance");
        // Set static instance for use from AppDelegate
        theRNFirebaseInvites = self;
    }
    return self;
}

// *******************************************************
// ** Start AppDelegate methods
// *******************************************************

// Listen for permission response
- (void) didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
    
}

// Listen for FCM data messages that arrive as a remote notification
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
    
}

// *******************************************************
// ** Finish AppDelegate methods
// *******************************************************


// *******************************************************
// ** Start FIRInviteDelegate methods
// *******************************************************

// Listen for invitation response
- (void)inviteFinishedWithInvitations:(NSArray *)invitationIds error:(NSError *)error {
    if (error) {
        _invitationsRejecter(@"invites/invitation-error", @"Invitation failed to send", error);
    } else if (invitationIds.count == 0) {
        _invitationsRejecter(@"invites/invitation-cancelled", @"Invitation cancelled", nil);
    } else {
        _invitationsResolver(invitationIds);
    }
    _invitationsRejecter = nil;
    _invitationsResolver = nil;
}

// *******************************************************
// ** Finish FIRInviteDelegate methods
// *******************************************************

// ** Start React Module methods **
RCT_EXPORT_METHOD(getInitialInvitation:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // TODO
    resolve(nil);
}

RCT_EXPORT_METHOD(sendInvitation:(NSDictionary *) invitation
                         resolve:(RCTPromiseResolveBlock) resolve
                          reject:(RCTPromiseRejectBlock) reject) {
    if (!invitation[@"message"]) {
        reject(@"invites/invalid-invitation", @"The supplied invitation is missing a 'message' field", nil);
    }
    if (!invitation[@"title"]) {
        reject(@"invites/invalid-invitation", @"The supplied invitation is missing a 'title' field", nil);
    }
    id<FIRInviteBuilder> inviteDialog = [FIRInvites inviteDialog];
    [inviteDialog setInviteDelegate: self];
    [inviteDialog setMessage:invitation[@"message"]];
    [inviteDialog setTitle:invitation[@"title"]];
    
    if (invitation[@"androidClientId"]) {
        FIRInvitesTargetApplication *targetApplication = [[FIRInvitesTargetApplication alloc] init];
        targetApplication.androidClientID = invitation[@"androidClientId"];
        [inviteDialog setOtherPlatformsTargetApplication:targetApplication];
    }
    if (invitation[@"androidMinimumVersionCode"]) {
        [inviteDialog setAndroidMinimumVersionCode:invitation[@"androidMinimumVersionCode"]];
    }
    if (invitation[@"callToActionText"]) {
        [inviteDialog setCallToActionText:invitation[@"callToActionText"]];
    }
    if (invitation[@"customImage"]) {
        [inviteDialog setCustomImage:invitation[@"customImage"]];
    }
    if (invitation[@"deepLink"]) {
        [inviteDialog setDeepLink:invitation[@"deepLink"]];
    }
    
    // Save the promise details for later
    _invitationsRejecter = reject;
    _invitationsResolver = resolve;
    
    // Open the invitation dialog
    [inviteDialog open];
}

// ** Start internals **

- (NSArray<NSString *> *)supportedEvents {
    return @[INVITES_INVITATION_RECEIVED];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseInvites
@end
#endif
