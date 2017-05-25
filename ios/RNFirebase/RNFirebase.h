#ifndef RNFirebase_h
#define RNFirebase_h

#import <UIKit/UIKit.h>
#if __has_include(<React/RCTEventDispatcher.h>)
#import <React/RCTEventDispatcher.h>
#else // Compatibility for RN version < 0.40
#import "RCTEventDispatcher.h"
#endif
#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else // Compatibility for RN version < 0.40
#import "RCTEventEmitter.h"
#endif
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@interface RNFirebase : RCTEventEmitter <RCTBridgeModule> {
}

@end

#endif
