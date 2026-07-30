---
type: Reference
title: iOS UNUserNotificationCenter delegate forwarding
description: Design and regression history for RNFB's iOS foreground-notification delegate chaining and the completionHandler exactly-once contract.
tags: [messaging, ios, notifications, delegate, completionHandler, regression, expo-notifications]
timestamp: 2026-07-09T00:00:00Z
---

# iOS UNUserNotificationCenter delegate forwarding

**Policy:** [OKF documentation and commit policy](../../documentation-policy.md).

`RNFBMessagingUNUserNotificationCenter` (`packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m`) installs itself as `[UNUserNotificationCenter currentNotificationCenter].delegate` and stores whatever delegate the host app had set (`_originalDelegate`), forwarding calls to it so RNFB and the app's own `AppDelegate`/`UNUserNotificationCenterDelegate` can coexist.

## The contract

`completionHandler` blocks passed by `UNUserNotificationCenterDelegate` methods (`willPresentNotification:withCompletionHandler:`, `didReceiveNotificationResponse:withCompletionHandler:`) **must be invoked exactly once** — never zero times (notification silently never presents / action never completes), never more than once (undefined behavior; a second invocation is a no-op at best and can assert/crash depending on iOS version).

Because RNFB forwards the *same* completion handler reference to `_originalDelegate`, whichever side calls it first "wins" the presentation decision, and any second call breaks the contract. This means: when an original delegate exists and implements the callback, ownership of the handler must pass to it exclusively — RNFB must not also call it.

`didReceiveNotificationResponse:withCompletionHandler:` already gets this right via a plain `if`/`else`:

```174:180:packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m
  if (_originalDelegate != nil && originalDelegateRespondsTo.didReceiveNotificationResponse) {
    [_originalDelegate userNotificationCenter:center
               didReceiveNotificationResponse:response
                        withCompletionHandler:completionHandler];
  } else {
    completionHandler();
  }
```

`willPresentNotification:withCompletionHandler:` follows the same shape ([current implementation](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m)):

```142:159:packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m
  // completionHandler must be invoked exactly once. If the original delegate
  // implements willPresentNotification, defer to it entirely - it owns the
  // completionHandler contract (and may call it asynchronously). Only fall
  // back to our own presentationOptions when there is no original delegate
  // to hand off to.
  //
  // _originalDelegate is weak, so it is captured into a strong local first -
  // otherwise it could be deallocated between the nil-check and the message
  // send (turning the send into a no-op) and completionHandler would never
  // be called at all.
  id<UNUserNotificationCenterDelegate> strongOriginalDelegate = _originalDelegate;
  if (strongOriginalDelegate != nil && originalDelegateRespondsTo.willPresentNotification) {
    [strongOriginalDelegate userNotificationCenter:center
                           willPresentNotification:notification
                             withCompletionHandler:completionHandler];
  } else {
    completionHandler(presentationOptions);
  }
```

**Trade-off (accepted):** when the host app implements `willPresentNotification`, RNFB's own `messaging_ios_foreground_presentation_options` (from `firebase.json`) is not applied — the app owns presentation entirely once it opts in by implementing the delegate method. This matches the exactly-once contract and is the pre-regression (pre-#8786) behavior for the delegation branch.

**Weak-reference note:** `_originalDelegate` is declared `@property(nonatomic, nullable, weak)`. A bare `if (_originalDelegate != nil && ...)` followed by a separate message send re-reads the weak property twice — a TOCTOU window where deallocation between the two reads turns the send into a silent no-op, which would violate exactly-once in the *zero-calls* direction. Capture into a strong local (`strongOriginalDelegate`) before the check so both the check and the send observe the same retained reference.

**Not exclusive to the host app's own `AppDelegate`:** any library that installs itself as `[UNUserNotificationCenter currentNotificationCenter].delegate` before RNFB's `observe` runs becomes `_originalDelegate` and is subject to this same contract — e.g. `expo-notifications`' native delegate (`EXNotificationCenterDelegate` / `NotificationCenterManager`, depending on SDK version), which forwards `willPresentNotification` to the JS `Notifications.setNotificationHandler` callback. See [#9050](#regression-history) below.

## Regression history

| # | Change | Effect |
|---|--------|--------|
| Pre-[#8786](https://github.com/invertase/react-native-firebase/pull/8786) | `gcm.message_id` branch called `completionHandler(presentationOptions)` immediately, **then** unconditionally forwarded the same handler to `_originalDelegate` if present | **[#8754](https://github.com/invertase/react-native-firebase/issues/8754):** RNFB's own presentation choice always "won" (consumed first) — the host app's custom `willPresentNotification` logic had no effect, since the handler was already spent by the time it ran |
| [#8786](https://github.com/invertase/react-native-firebase/pull/8786) (merged 2026-01-29) | Removed the early call inside the `gcm.message_id` branch; changed the delegation branch from `if/else` to `if` + an **unconditional** trailing `completionHandler(presentationOptions)` | Fixed #8754's ordering, but broke the exactly-once contract: when `_originalDelegate` responds to `willPresentNotification` and calls `completionHandler` itself (sync or async), RNFB calls it again right after |
| **[#9049](https://github.com/invertase/react-native-firebase/issues/9049)** (reported 2026-06-11) | Regression from #8786 | `completionHandler` invoked twice whenever the host app implements `willPresentNotification`; breaks apps that resolve presentation options asynchronously, since RNFB's trailing call fires independently of the app's own timing |
| **[#9050](https://github.com/invertase/react-native-firebase/issues/9050)** (reported 2026-06-12) | Same regression from #8786, different `_originalDelegate` — `expo-notifications`' native delegate, not a hand-written `AppDelegate` | `expo-notifications` local notifications stopped showing in the foreground: its delegate decides presentation via the JS `setNotificationHandler` callback and calls `completionHandler` once, then RNFB's unconditional trailing call fires again with the default (unset) `messaging_ios_foreground_presentation_options` (`None`), suppressing the notification. Setting that config to a non-empty list "fixed" it only because it made the *second*, otherwise-suppressing call also request presentation — the reported workaround. Confirmed by version bracketing: `v23.8.4` (pre-#8786, unaffected per report) tagged 2026-01-24; `v24.1.1` (post-#8786, affected per report) tagged 2026-06-10 |
| **Fix (this pass)** | Restored `if`/`else` mutual exclusivity for the delegation branch (matching `didReceiveNotificationResponse`); kept #8786's removal of the early `gcm.message_id` call; captured `_originalDelegate` into a strong local to close the weak-reference TOCTOU race (flagged in PR review) | Exactly-once in all cases; original delegate's decision (sync or async) is respected when present, regardless of whether it's the host app's own `AppDelegate` or a library's delegate (e.g. `expo-notifications`); RNFB's `firebase.json` presentation options apply only when there is no original delegate to defer to |

No wrapping/timeout guard (`__block BOOL handled`, `dispatch_after` fallback) was adopted — mutual exclusivity is sufficient and avoids an arbitrary timeout that would either fire too early for legitimately slow app logic or leave the app waiting if it forgets to call the handler (the app's own responsibility per the standard `UNUserNotificationCenterDelegate` contract, same as it would be with no RNFB in the chain at all).

## Related repository files

* [`RNFBMessaging+UNUserNotificationCenter.m`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.m) — delegate install (`observe`), `originalDelegateRespondsTo` capability bits, both delegate methods
* [`RNFBMessaging+UNUserNotificationCenter.h`](../../../packages/messaging/ios/RNFBMessaging/RNFBMessaging+UNUserNotificationCenter.h) — `_originalDelegate` storage
