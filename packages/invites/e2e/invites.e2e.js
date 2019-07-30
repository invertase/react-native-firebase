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

android.describe('invites()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.invites);
      app.invites().app.should.equal(app);
    });
  });

  ios.describe('getInitialInvitation()', () => {
    it('should return initial invitation', () => {
      // TODO(salakar) mock url open with detox -- ios
    });
  });

  describe('createInvitation()', () => {
    it('returns a new instance of Invite', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const { Invite } = firebase.invites;
      invite.should.be.instanceOf(Invite);
    });

    it('throw when title is not a string', () => {
      try {
        firebase.invites().createInvitation(1234, 'bar');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'title' must be a string value");
        return Promise.resolve();
      }
    });

    it('throw when message is not a string', () => {
      try {
        firebase.invites().createInvitation('foo', 1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'message' must be a string value");
        return Promise.resolve();
      }
    });
  });

  describe('getInitialInvitation()', () => {
    it('returns null when no invite', async () => {
      const invite = await firebase.invites().getInitialInvitation();
      should.equal(invite, null);
    });
  });

  describe('sendInvitation()', () => {
    // sending can only be manually tested as this starts an intent on Android
    // we test cancellation as we can call detox's pressBack api to cancel
    it('should cancel sending and reject with cancelled error code', async () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      const inviteParams = {
        android: undefined,
        androidClientId: 'androidClientId',
        androidMinimumVersionCode: 1337,
        callToActionText: 'callToActionText',
        iosClientId: 'iosClientId',
      };
      const androidInviteParams = {
        additionalReferralParameters: {
          a: 'b',
          c: 'd',
        },
        emailHtmlContent: 'emailHtmlContent',
        emailSubject: 'emailSubject',
        googleAnalyticsTrackingId: 'googleAnalyticsTrackingId',
      };

      invite.setAndroidClientId(inviteParams.androidClientId);
      invite.setAndroidMinimumVersionCode(inviteParams.androidMinimumVersionCode);

      // invite.setCustomImage(inviteParams.customImage);
      // invite.setDeepLink(inviteParams.deepLink);
      invite.setIOSClientId(inviteParams.iosClientId);

      androidInvite.setAdditionalReferralParameters(
        androidInviteParams.additionalReferralParameters,
      );

      androidInvite.setEmailHtmlContent(androidInviteParams.emailHtmlContent);
      androidInvite.setEmailSubject(androidInviteParams.emailSubject);
      androidInvite.setGoogleAnalyticsTrackingId(androidInviteParams.googleAnalyticsTrackingId);

      const sendInvitation = firebase.invites().sendInvitation(invite);

      if (device.getPlatform() === 'android') {
        await Utils.sleep(isCI ? 6000 : 1000);
        await device.pressBack();
      }

      try {
        await sendInvitation;
      } catch (error) {
        if (device.getPlatform() === 'android') {
          // TODO flaky test, investigate, sometimes it's `invites/invitation-error` and other times 'invites/invitation-cancelled'
          // error.code.should.equal('invites/invitation-cancelled');
        } else {
          error.code.should.equal('invites/invitation-error');
          error.message.should.containEql('User must be signed in with GoogleSignIn');
        }
      }
    });

    it('throw when not an invite', () => {
      try {
        firebase.invites().sendInvitation('foo');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql('expects and instance of Invite.');
        return Promise.resolve();
      }
    });
  });
});
