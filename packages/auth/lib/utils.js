export function warnDynamicLink(actionCodeSettings) {
  if (actionCodeSettings && actionCodeSettings.dynamicLinkDomain) {
    // eslint-disable-next-line no-console
    console.warn(
      'Firebase Dynamic Links is deprecated and will be shut down as early as August * 2025. \
      Instead, use ActionCodeSettings.linkDomain to set up a custom domain. Learn more at: https://firebase.google.com/support/dynamic-links-faq',
    );
  }
}
