#import "RNFirebaseAdMobBannerManager.h"
#import "BannerComponent.h"

@implementation RNFirebaseAdMobBannerManager

RCT_EXPORT_MODULE();

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

RCT_EXPORT_VIEW_PROPERTY(size, NSString);
RCT_EXPORT_VIEW_PROPERTY(unitId, NSString);
RCT_EXPORT_VIEW_PROPERTY(request, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(onBannerEvent, RCTBubblingEventBlock);

@synthesize bridge = _bridge;

- (UIView *)view
{
  BannerComponent *banner = [BannerComponent new];
  return banner;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

#endif

@end
