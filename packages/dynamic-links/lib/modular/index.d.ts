import { ReactNativeFirebase } from '@react-native-firebase/app';
import { FirebaseDynamicLinksTypes } from '..';

type DynamicLinks = FirebaseDynamicLinksTypes.Module;

export declare const ShortLinkType = FirebaseDynamicLinksTypes.ShortLinkType;

/**
 * Returns an instance of DynamicLinks.
 *
 * #### Example
 * ```js
 * const dynamicLinks = getDynamicLinks();
 * ```
 */
export declare function getDynamicLinks(app?: ReactNativeFirebase.FirebaseApp): DynamicLinks;

/**
 * Builds a Dynamic Link from the provided DynamicLinkParameters instances.
 *
 * #### Example
 *
 * ```js
 * const dynamicLinks = getDynamicLinks();
 * const link = await buildLink(dynamicLinks, {
 *   link: 'https://invertase.io',
 *   domainUriPrefix: 'https://xyz.page.link',
 *   analytics: {
 *     campaign: 'banner',
 *   }
 * });
 * ```
 */
export declare function buildLink(
  dynamicLinks: DynamicLinks,
  dynamicLinkParams: FirebaseDynamicLinksTypes.DynamicLinkParameters,
): Promise<string>;
/**
 * Builds a short Dynamic Link from the provided DynamicLinkParameters interface.
 *
 *  ```js
 * const dynamicLinks = getDynamicLinks();
 * const link = await buildShortLink(
 *   dynamicLinks,
 *   {
 *     link: 'https://invertase.io',
 *     domainUriPrefix: 'https://xyz.page.link',
 *     analytics: {
 *       campaign: 'banner',
 *     }
 *   },
 *   ShortLinkType.UNGUESSABLE,
 * );
 * ```
 */
export declare function buildShortLink(
  dynamicLinks: DynamicLinks,
  dynamicLinkParams: FirebaseDynamicLinksTypes.DynamicLinkParameters,
  shortLinkType?: FirebaseDynamicLinksTypes.ShortLinkType,
): Promise<string>;

/**
 * Returns the Dynamic Link that the app has been launched from. If the app was not launched from a Dynamic Link the value will be null.
 *
 * > Use {@link auth#isSignInWithEmailLink} to check if an inbound dynamic link is an email sign-in link.
 *
 * #### Example
 *
 * ```js
 * async function bootstrapApp() {
 *    const dynamicLinks = getDynamicLinks();
 *    const initialLink = await getInitialLink(dynamicLinks);
 *
 *    if (initialLink) {
 *      // Handle dynamic link inside your own application
 *      if (initialLink.url === 'https://invertase.io/offer') return navigateTo('/offers')
 *    }
 * }
 * ```
 */
export declare function getInitialLink(): Promise<FirebaseDynamicLinksTypes.DynamicLink | null>;

/**
 * Subscribe to Dynamic Link open events while the app is still running.
 *
 * The listener is called from Dynamic Link open events whilst the app is still running, use
 * {@link dynamic-links#getInitialLink} for Dynamic Links which cause the app to open from a previously closed / not running state.
 *
 * #### Example
 *
 * ```jsx
 * function App() {
 *   const handleDynamicLink = (link) => {
 *     // Handle dynamic link inside your own application
 *     if (link.url === 'https://invertase.io/offer') return navigateTo('/offers')
 *   };
 *
 *   useEffect(() => {
 *     const dynamicLinks = getDynamicLinks();
 *     const unsubscribe = onLink(dynamicLinks, handleDynamicLink);
 *     // When the component unmounts, remove the listener
 *     return unsubscribe;
 *   }, []);
 *
 *   return <YourApp />;
 * }
 * ```
 */
export declare function onLink(
  dynamicLinks: DynamicLinks,
  listener: (link: FirebaseDynamicLinksTypes.DynamicLink) => void,
): () => void;

/**
 * Perform built-in diagnostics on iOS. This is best performed on a real device running
 * a build from Xcode so you may see the output easily. Alternatively it should be visible
 * in Console.app with an iPhone plugged into a macOS computer
 *
 * NOTE: iOS only
 */
export declare function performDiagnostics(dynamicLinks: DynamicLinks): void;

/**
 * Resolve a given dynamic link (short or long) directly.
 *
 * This mimics the result of external link resolution, app open, and the DynamicLink you
 * would get from {@link dynamic-links#getInitialLink}
 *
 * #### Example
 *
 * ```js
 * const dynamicLinks = getDynamicLinks();
 * const link = await resolveLink(dynamicLinks, 'https://reactnativefirebase.page.link/76adfasdf');
 * console.log('Received link with URL: ' + link.url);
 * ```
 *
 * Can throw error with message 'Invalid link parameter' if link parameter is null
 * Can throw error with code 'not-found' if the link does not resolve
 * Can throw error with code 'resolve-link-error' if there is a processing error
 */
export declare function resolveLink(dynmaicLinks: DynamicLinks, link: string): Promise<DynamicLink>;
