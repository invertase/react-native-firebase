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

describe('firebase.invites.Invite', () => {
  describe('setAndroidClientId', () => {
    it('sets the client id', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setAndroidClientId('123456');
      invite._androidClientId.should.equal('123456');
    });

    it('throws if androidClientId is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setAndroidClientId(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'androidClientId' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('setAndroidMinimumVersionCode', () => {
    it('sets the androidMinimumVersionCode', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setAndroidMinimumVersionCode(123456);
      invite._androidMinimumVersionCode.should.equal(123456);
    });

    it('throws if androidMinimumVersionCode is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setAndroidMinimumVersionCode('1234');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'androidMinimumVersionCode' must be a number value`);
        return Promise.resolve();
      }
    });
  });

  describe('setCallToActionText', () => {
    it('sets callToActionText', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setCallToActionText('123456');
      invite._callToActionText.should.equal('123456');
    });

    it('throws if androidClientId is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setCallToActionText(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'callToActionText' must be a string value`);
        return Promise.resolve();
      }
    });

    it('throws if callToActionText is used when emailHtmlContent is set', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      androidInvite.setEmailHtmlContent('1234');

      try {
        invite.setCallToActionText('cta');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(
          `'callToActionText' cannot be used alongside 'emailHtmlContent'`,
        );
        return Promise.resolve();
      }
    });
  });

  describe('setCustomImage', () => {
    it('sets customImage', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setCustomImage('123456');
      invite._customImage.should.equal('123456');
    });

    it('throws if customImage is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setCustomImage(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'customImage' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('setDeepLink', () => {
    it('sets deepLink', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setDeepLink('123456');
      invite._deepLink.should.equal('123456');
    });

    it('throws if deepLink is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setDeepLink(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'deepLink' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('setIOSClientId', () => {
    it('sets iosClientId', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      invite.setIOSClientId('123456');
      invite._iosClientId.should.equal('123456');
    });

    it('throws if iosClientId is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      try {
        invite.setIOSClientId(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'iosClientId' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('build', () => {
    it('it builds', () => {
      const inviteParams = {
        android: undefined,
        androidClientId: 'androidClientId',
        androidMinimumVersionCode: 1337,
        callToActionText: 'callToActionText',
        customImage: 'customImage',
        deepLink: 'deepLink',
        iosClientId: 'iosClientId',
        message: 'message',
        title: 'title',
      };

      const invite = firebase.invites().createInvitation(inviteParams.title, inviteParams.message);
      invite.setAndroidClientId(inviteParams.androidClientId);
      invite.setAndroidMinimumVersionCode(inviteParams.androidMinimumVersionCode);
      invite.setCallToActionText(inviteParams.callToActionText);
      invite.setCustomImage(inviteParams.customImage);
      invite.setDeepLink(inviteParams.deepLink);
      invite.setIOSClientId(inviteParams.iosClientId);

      const builtInvite = invite.build();
      // TODO(salakar) object equal check
      JSON.stringify(inviteParams).should.equal(JSON.stringify(builtInvite));
    });
  });
});
