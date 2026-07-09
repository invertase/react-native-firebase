---
type: Reference
title: iOS UNUserNotificationCenter delegate forwarding
description: Design and regression history for RNFB's iOS foreground-notification delegate chaining and the completionHandler exactly-once contract.
tags: [messaging, ios, notifications, delegate, completionHandler, regression]
timestamp: 2026-07-09T00:00:00Z
---

# iOS UNUserNotificationCenter delegate forwarding

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

`RNFBMessagingUNUserNotificationCenter` (`packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m`) installs itself as `[UNUserNotificationCenter currentNotificationCenter].delegate` and stores whatever delegate the host app had set (`_originalDelegate`), forwarding calls to it so RNFB and the app's own `AppDelegate`/`UNUserNotificationCenterDelegate` can coexist.

## The contract

`completionHandler` blocks passed by `UNUserNotificationCenterDelegate` methods (`willPresentNotification:withCompletionHandler:`, `didReceiveNotificationResponse:withCompletionHandler:`) **must be invoked exactly once** — never zero times (notification silently never presents / action never completes), never more than once (undefined behavior; a second invocation is a no-op at best and can assert/crash depending on iOS version).

Because RNFB forwards the *same* completion handler reference to `_originalDelegate`, whichever side calls it first "wins" the presentation decision, and any second call breaks the contract. This means: when an original delegate exists and implements the callback, ownership of the handler must pass to it exclusively — RNFB must not also call it.

`didReceiveNotificationResponse:withCompletionHandler:` already gets this right via a plain `if`/`else`:

```165:171:packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m
  if (_originalDelegate != nil && originalDelegateRespondsTo.didReceiveNotificationResponse) {
    [_originalDelegate userNotificationCenter:center
               didReceiveNotificationResponse:response
                        withCompletionHandler:completionHandler];
  } else {
    completionHandler();
  }
```

`willPresentNotification:withCompletionHandler:` follows the same shape ([current implementation](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m)):

```142:153:packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m
  // completionHandler must be invoked exactly once. If the original delegate
  // implements willPresentNotification, defer to it entirely - it owns the
  // completionHandler contract (and may call it asynchronously). Only fall
  // back to our own presentationOptions when there is no original delegate
  // to hand off to.
  if (_originalDelegate != nil && originalDelegateRespondsTo.willPresentNotification) {
    [_originalDelegate userNotificationCenter:center
                      willPresentNotification:notification
                        withCompletionHandler:completionHandler];
  } else {
    completionHandler(presentationOptions);
  }
```

**Trade-off (accepted):** when the host app implements `willPresentNotification`, RNFB's own `messaging_ios_foreground_presentation_options` (from `firebase.json`) is not applied — the app owns presentation entirely once it opts in by implementing the delegate method. This matches the exactly-once contract and is the pre-regression (pre-#8786) behavior for the delegation branch.

## Regression history

| # | Change | Effect |
|---|--------|--------|
| Pre-[#8786](https://github.com/invertase/react-native-firebase/pull/8786) | `gcm.message_id` branch called `completionHandler(presentationOptions)` immediately, **then** unconditionally forwarded the same handler to `_originalDelegate` if present | **[#8754](https://github.com/invertase/react-native-firebase/issues/8754):** RNFB's own presentation choice always "won" (consumed first) — the host app's custom `willPresentNotification` logic had no effect, since the handler was already spent by the time it ran |
| [#8786](https://github.com/invertase/react-native-firebase/pull/8786) (merged 2026-01-29) | Removed the early call inside the `gcm.message_id` branch; changed the delegation branch from `if/else` to `if` + an **unconditional** trailing `completionHandler(presentationOptions)` | Fixed #8754's ordering, but broke the exactly-once contract: when `_originalDelegate` responds to `willPresentNotification` and calls `completionHandler` itself (sync or async), RNFB calls it again right after |
| **[#9049](https://github.com/invertase/react-native-firebase/issues/9049)** (reported 2026-06-11) | Regression from #8786 | `completionHandler` invoked twice whenever the host app implements `willPresentNotification`; breaks apps that resolve presentation options asynchronously, since RNFB's trailing call fires independently of the app's own timing |
| **Fix (this pass)** | Restored `if`/`else` mutual exclusivity for the delegation branch (matching `didReceiveNotificationResponse`); kept #8786's removal of the early `gcm.message_id` call | Exactly-once in all cases; original delegate's decision (sync or async) is respected when present; RNFB's `firebase.json` presentation options apply only when there is no original delegate to defer to |

No wrapping/timeout guard (`__block BOOL handled`, `dispatch_after` fallback) was adopted — mutual exclusivity is sufficient and avoids an arbitrary timeout that would either fire too early for legitimately slow app logic or leave the app waiting if it forgets to call the handler (the app's own responsibility per the standard `UNUserNotificationCenterDelegate` contract, same as it would be with no RNFB in the chain at all).

## Related repository files

* [`RNFBMessaging+UNUserNotificationCenter.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m) — delegate install (`observe`), `originalDelegateRespondsTo` capability bits, both delegate methods
* [`RNFBMessaging+UNUserNotificationCenter.h`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.h) — `_originalDelegate` storage
