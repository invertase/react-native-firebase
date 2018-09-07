#import "RNFirebaseInvites.h"

#if __has_include(<FirebaseInvites/FirebaseInvites.h>)
#import "RNFirebaseEvents.h"
#import "RNFirebaseLinks.h"
#import "RNFirebaseUtil.h"
#import <FirebaseInvites/FirebaseInvites.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@implementation RNFirebaseInvites

static RNFirebaseInvites *theRNFirebaseInvites = nil;
static NSString *initialInvite = nil;
static bool jsReady = FALSE;

+ (nonnull instancetype)instance {
    // If an event comes in before the bridge has initialised the native module
    // then we create a temporary instance which handles events until the bridge
    // and JS side are ready
    if (theRNFirebaseInvites == nil) {
        theRNFirebaseInvites = [[RNFirebaseInvites alloc] init];
    }
    return theRNFirebaseInvites;
}

RCT_EXPORT_MODULE()

- (id)init {
    self = [super init];
    if (self != nil) {
        DLog(@"Setting up RNFirebaseInvites instance");
        // Set static instance for use from AppDelegate
        theRNFirebaseInvites = self;
    }
    return self;
}

// *******************************************************
// ** Start AppDelegate methods
// *******************************************************

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [self handleUrl:url];
}

- (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler {
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        return [self handleUrl:userActivity.webpageURL];
    }
    return NO;
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
        if (error.code == -402) {
            _invitationsRejecter(@"invites/invitation-cancelled", @"Invitation cancelled", nil);
        } else if (error.code == -404) {
            _invitationsRejecter(@"invites/invitation-error", @"User must be signed in with GoogleSignIn", nil);
        } else {
            _invitationsRejecter(@"invites/invitation-error", @"Invitation failed to send", error);
        }
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
    NSURL* url = nil;
    if (self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey]) {
        url = (NSURL*)self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey];
    } else if (self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey]) {
        NSDictionary *dictionary = self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
        if ([dictionary[UIApplicationLaunchOptionsUserActivityTypeKey] isEqual:NSUserActivityTypeBrowsingWeb]) {
            NSUserActivity* userActivity = (NSUserActivity*) dictionary[@"UIApplicationLaunchOptionsUserActivityKey"];
            url = userActivity.webpageURL;
        }
    }
    
    if (url) {
        [FIRInvites handleUniversalLink:url completion:^(FIRReceivedInvite * _Nullable receivedInvite, NSError * _Nullable error) {
            if (error) {
                DLog(@"Failed to handle universal link: %@", [error localizedDescription]);
                reject(@"invites/initial-invitation-error", @"Failed to handle invitation", error);
            } else if (receivedInvite && receivedInvite.inviteId) {
                resolve(@{
                          @"deepLink": receivedInvite.deepLink,
                          @"invitationId": receivedInvite.inviteId,
                          });
            } else {
                resolve(initialInvite);
            }
        }];
    } else {
        resolve(initialInvite);
    }
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
    dispatch_async(dispatch_get_main_queue(), ^{
        [inviteDialog open];
    });
}

RCT_EXPORT_METHOD(jsInitialised:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    jsReady = TRUE;
    resolve(nil);
}

// ** Start internals **
- (BOOL)handleUrl:(NSURL *)url {
    return [FIRInvites handleUniversalLink:url completion:^(FIRReceivedInvite * _Nullable receivedInvite, NSError * _Nullable error) {
        if (error) {
            DLog(@"Failed to handle invitation: %@", [error localizedDescription]);
        } else if (receivedInvite && receivedInvite.inviteId) {
            [self sendJSEvent:self name:INVITES_INVITATION_RECEIVED body:@{
                                                                           @"deepLink": receivedInvite.deepLink,
                                                                           @"invitationId": receivedInvite.inviteId,
                                                                          }];
        } else {
            [[RNFirebaseLinks instance] sendLink:receivedInvite.deepLink];
        }
    }];
}

// Because of the time delay between the app starting and the bridge being initialised
// we catch any events that are received before the JS is ready to receive them
- (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(id)body {
    if (emitter.bridge && jsReady) {
        [RNFirebaseUtil sendJSEvent:emitter name:name body:body];
    } else if (!initialInvite) {
        initialInvite = body;
    } else {
        DLog(@"Multiple invite events received before the JS invites module has been initialised");
    }
}

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

