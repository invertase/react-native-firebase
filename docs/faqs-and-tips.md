---
title: FAQs and Tips
description: Learn about top tips from and common problems faced by the React Native Firebase community.
next: /releases
previous: /migrating-to-v6
---

Over the years, there’s been a lot of discussions on our [GitHub]( https://github.com/invertase/react-native-firebase) and [Discord]( https://invertase.link/discord). Many of them have been about common problems developers face when using our package, and some of them resulted in very good advice being given.

In order to save others time and frustration, this page has been created to document some of these common problems and good pieces of advice.
If you come across a discussion that results in great advice that can benefit many developers, or a discussion that resolves a problem that many developers encounter, please do add it here! Someone will definitely be grateful.


# FAQs

### I need help with [anything regarding <= v5 of React Native Firebase]. Where could I get help with that?

React Native Firebase v5 is now deprecated and unsupported. There's been over a year's grace period provided to migrate to v6, so moving forward maintainers probably won't pay much attention to issues regarding v5. Understandably, upgrading to v6 can take some effort, but staying on v5 probably isn't a great choice for the long-term health of your project.
Lots of the breaking changes that were introduced were either due to upstream deprecations in the official SDKs, or to simply make the package more stable and more representative of how the actual SDKs work.
The longer you stay on v5, the more your project will be out of sync with the official SDKs, unfortunately. Couple that with the fact that it's no longer actively supported, and that's trouble looming over the horizon for your project.

We highly recommend taking the necessary pains to update to v6. 

# Tips
 - Advice on supporting multiple environments (for example, dev, prod, maybe also staging, qa) for your React Native Firebase App: [#3504]( https://github.com/invertase/react-native-firebase/issues/3504)
