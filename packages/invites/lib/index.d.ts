/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
  ReactNativeFirebaseModule,
  ReactNativeFirebaseNamespace,
  ReactNativeFirebaseModuleAndStatics,
} from '@react-native-firebase/app-types';

/**
 * Firebase Invites package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `invites` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/invites';
 *
 * // firebase.invites().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `invites` package:
 *
 * ```js
 * import invites from '@react-native-firebase/invites';
 *
 * // invites().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/invites';
 *
 * // firebase.invites().X
 * ```
 *
 * @firebase invites
 */
export namespace Invites {
  /**
   * firebase.invites.X
   */
  export interface Statics {
    /**
     * Invitation returns an `InviteBuilder` instance used to send new invites.
     */
    Invitation: InviteBuilder;
  }

  /**
   * Additional referral parameters for {@link invites.AndroidInviteBuilder#setAdditionalReferralParameters}.
   *
   * #### Example
   *
   * ```js
   * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
   * invite.android.setAdditionalReferralParameters({
   *   screen: 'Profile',
   * });
   * ```
   */
  export interface AdditionalReferralParameters {
    [key: string]: string;
  }

  /**
   * Android Invite representation. Instance is returned from {@link links.InviteBuilder#android}.
   */
  export class AndroidInviteBuilder {
    /**
     * Adds query parameters to the play store referral URL when the app needs additional referral parameters for other
     * application component referrals. These parameters are added to the referral URL sent from the play store and are
     * available to be processed by other application components, for example Google Analytics. The parameters are set
     * as name, value pairs that will be set as query parameter name and value on the referral URL.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.android.setAdditionalReferralParameters({
     *   screen: 'Profile',
     * });
     * ```
     *
     * @param additionalReferralParameters Referral parameters defined as string name value pairs.
     */
    setAdditionalReferralParameters(
      additionalReferralParameters: AdditionalReferralParameters,
    ): InviteBuilder;

    /**
     * Sets the HTML-formatted (UTF-8 encoded, no JavaScript) content for invites sent through email. If set, this will
     * be sent instead of the default email.
     *
     * emailHtmlContent must be valid HTML for standard email processing. The pattern `%%APPINVITE_LINK_PLACEHOLDER%%`
     * should be embedded in your htmlContent and will be replaced with the invitation URL.
     * This url is a link that will launch the app if already installed or take the user to the appropriate app store
     * if not. In both cases the deep link will be available if provided using setDeepLink(Uri).
     *
     * > Cannot be used with {@link invites.InviteBuilder#setCallToActionText}
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.android.setEmailHtmlContent('<p><strong>Rich HTML content</strong></p>');
     * ```
     *
     * @param emailHtmlContent The html-formatted content for the email.
     */
    setEmailHtmlContent(emailHtmlContent: string): InviteBuilder;

    /**
     * Sets the subject for invites sent by email.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.android.emailSubject(`Hey ${user.name}, joint my app!`);
     * ```
     *
     * @param emailSubject The subject for the email.
     */
    setEmailSubject(emailSubject: string): InviteBuilder;

    /**
     * Sets the Google Analytics Tracking id. The tracking id should be created for the calling application under
     * Google Analytics. See more about how to get a tracking id . The tracking id is recommended so that invitations
     * sent from the calling application are available in Google Analytics.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.android.setGoogleAnalyticsTrackingId('UA-1234-5');
     * ```
     *
     * @param gaTrackingId String of the form UA-xxxx-y
     */
    setGoogleAnalyticsTrackingId(gaTrackingId: string): InviteBuilder;
  }

  /**
   * Invite builder representation returned from {@link invites#createInvitation}.
   */
  export class InviteBuilder {
    /**
     * Set Android specific Invite properties
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.android.setGoogleAnalyticsTrackingId('UA-1234-5');
     * ```
     */
    android: AndroidInviteBuilder;

    /**
     * Set the Android target client ID for the invitation.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.setAndroidClientId('xxxxxxxxxxxx');
     * ```
     *
     * @param androidClientId The android client ID.
     */
    setAndroidClientId(androidClientId: string): InviteBuilder;

    /**
     * Sets the minimum version of the android app installed on the receiving device. If this minimum version is not installed then the install flow will be triggered.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.setAndroidMinimumVersionCode(18);
     * ```
     *
     * @param androidMinimumVersionCode Minimum version of the android app.
     */
    setAndroidMinimumVersionCode(androidMinimumVersionCode: number): InviteBuilder;

    /**
     * Text shown on the email invitation for the user to accept the invitation. Default install text used if not set.
     *
     * > Cannot be used with {@link invites.AndroidInviteBuilder#setEmailHtmlContent}.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.setCallToActionText('Join the app!');
     * ```
     *
     * @param callToActionText Text to use on the invitation button.
     */
    setCallToActionText(callToActionText: string): InviteBuilder;

    /**
     * Sets an image for invitations.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.setCustomImage('https://my-cdn.com/assets/invites.png');
     * ```
     *
     * @param customImage The image Uri. The Uri is required to be in absolute format. The supported image formats are "jpg", "jpeg" and "png".
     */
    setCustomImage(customImage: string): InviteBuilder;

    /**
     * Sets the deep link that is made available to the app when opened from the invitation. This deep link is made
     * available both to a newly installed application and an already installed application. The deep link can be sent
     * to Android and other platforms so should be formatted to support deep links across platforms.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.deepLink('/invites');
     * ```
     *
     * @param deepLink The app deep link.
     */
    setDeepLink(deepLink: string): InviteBuilder;

    /**
     * Set the iOS target client ID for the invitation.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app with me and share content!');
     * invite.setIOSClientId('xxxxxxxxxxxx');
     * ```
     *
     * @param iOSClientId The iOS client ID.
     */
    setIOSClientId(iOSClientId: string): InviteBuilder;
  }

  /**
   * A native invite representation returned from getInitialInvite and onInvite.
   *
   * #### Example 1
   *
   * When an invitation has been opened from a closed/terminated app.
   *
   * ```js
   * const invite = firebase.invites().getInitialInvitation();
   *
   * if (invite) {
   *   console.log('Deeplink: ', invite.deepLink);
   *   console.log('ID: ', invite.invitationId);
   * }
   * ```
   *
   * #### Example 2
   *
   * When an invite has been opened and the app is running.
   *
   * ```js
   *  function handleInvitation({ deepLink, invitationId}) {
   *   console.log('Deeplink: ', deepLink);
   *   console.log('ID: ', invitationId);
   *  }
   *
   *  firebase.invites().onInvitation(handleInvitation);
   * ```
   */
  export interface NativeInvite {
    /**
     * The deepLink that should be opened within the application.
     */
    deepLink: string;

    /**
     * The ID of the invitation that was opened.
     */
    invitationId: string;
  }

  /**
   * A type alias for an invite listener used with {@link invites#onInvitation}
   *
   * #### Example
   *
   * ```js
   * firebase.invites().onInvitation((invite) => {
   *   console.log('Deeplink: ', invite.deepLink);
   *   console.log('ID: ', invite.invitationId);
   * });
   * ```
   */
  export type InviteListener = (nativeInvite: NativeInvite) => void;

  /**
   * The Firebase Invites service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Invites service for the default app:
   *
   * ```js
   * const defaultAppInvites = firebase.invites();
   * ```
   */
  export class Module extends ReactNativeFirebaseModule {
    /**
     * Create an invitation via an InvitationBuilder instance.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app and share content');
     * ```
     *
     * @param title The title displayed in the invitation.
     * @param message The message displayed in the invitation.
     */
    createInvitation(title: string, message: string): InviteBuilder;

    /**
     * When an invitation is opened whilst the app is open, the listener is invoked with the invitation.
     * Returns a function that when called unsubscribes the listener from further events.
     *
     * #### Example
     *
     * ```js
     * function handleInvitation({ deepLink, invitationId}) {
     *   console.log('Deeplink: ', deepLink);
     *   console.log('ID: ', invitationId);
     * }
     *
     * const subscriber = firebase.invites().onInvitation(handleInvitation);
     *
     * // Unsubscribe from invitation listener
     * subscriber();
     * ```
     *
     * @param listener A function called when an invitation is opened.
     */
    onInvitation(listener: InviteListener): Function;

    /**
     * Returns the Invitation that the app has been launched from. If the app was not launched from an Invitation the
     * return value will be null.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().getInitialInvitation();
     *
     * if (invite) {
     *  console.log('Deeplink: ', invite.deepLink);
     *  console.log('ID: ', invite.invitationId);
     * }
     * ```
     */
    getInitialInvitation(): Promise<NativeInvite>;

    /**
     * Displays the invitation dialog which allows the user to select who received the invitation.
     * Returns a promise that resolves with the created invitation IDs if the invitation is sent, otherwise it is
     * rejected with an error.
     *
     * #### Example
     *
     * ```js
     * const invite = firebase.invites().createInvitation('Join my app', 'Join my app and share content');
     * const ids = await firebase.invites().sendInvitation(invite);
     * ```
     *
     * @param invite The invitation to send. Must be an instance of InviteBuilder
     */
    sendInvitation(invite: InviteBuilder): Promise<string[]>;
  }
}

declare module '@react-native-firebase/invites' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';

  const FirebaseNamespaceExport: {} & ReactNativeFirebaseNamespace;

  /**
   * @example
   * ```js
   * import { firebase } from '@react-native-firebase/invites';
   * firebase.invites().X(...);
   * ```
   */
  export const firebase = FirebaseNamespaceExport;

  const InvitesDefaultExport: ReactNativeFirebaseModuleAndStatics<Invites.Module, Invites.Statics>;
  /**
   * @example
   * ```js
   * import invites from '@react-native-firebase/invites';
   * invites().X(...);
   * ```
   */
  export default InvitesDefaultExport;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    /**
     * <b>Firebase Invites is deprecated</b>. You can create cross-platform invitation links that survive app installation using Firebase Dynamic Links instead.
     * Firebase Invites are an out-of-the-box solution for app referrals and sharing via email or SMS.
     * To customize the invitation user experience, or to generate links programmatically, use Firebase Dynamic Links.
     */
    invites: ReactNativeFirebaseModuleAndStatics<Invites.Module, Invites.Statics>;
  }

  interface FirebaseApp {
    /**
     * <b>Firebase Invites is deprecated</b>. You can create cross-platform invitation links that survive app installation using Firebase Dynamic Links instead.
     * Firebase Invites are an out-of-the-box solution for app referrals and sharing via email or SMS.
     * To customize the invitation user experience, or to generate links programmatically, use Firebase Dynamic Links.
     *
     */
    invites(): Invites.Module;
  }
}
