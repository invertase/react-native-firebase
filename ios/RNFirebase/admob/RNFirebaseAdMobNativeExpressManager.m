#import "RNFirebaseAdMobNativeExpressManager.h"
#import "NativeExpressComponent.h"

@implementation RNFirebaseAdMobNativeExpressManager

RCT_EXPORT_MODULE();

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

@synthesize bridge = _bridge;

- (UIView *)view
{
    return [[NativeExpressComponent alloc] init];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}


RCT_EXPORT_VIEW_PROPERTY(size, NSString);
RCT_EXPORT_VIEW_PROPERTY(unitId, NSString);
RCT_EXPORT_VIEW_PROPERTY(request, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(video, NSDictionary);

RCT_EXPORT_VIEW_PROPERTY(onBannerEvent, RCTBubblingEventBlock);

#endif

@end