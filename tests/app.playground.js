/* eslint-disable import/extensions,import/no-unresolved,import/first,import/no-extraneous-dependencies,no-console */
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

import React, { Component } from 'react';
import { AppRegistry, Image, StyleSheet, View } from 'react-native';

import '@react-native-firebase/dynamic-links';
import '@react-native-firebase/invites';
import firebase from '@react-native-firebase/app';

class Root extends Component {
  constructor(props) {
    super(props);
    try {
      this.runSingleTest().catch(console.error);
    } catch (error) {
      console.error(error);
    }
  }

  async runSingleTest() {
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

    androidInvite.setAdditionalReferralParameters(androidInviteParams.additionalReferralParameters);

    androidInvite.setEmailHtmlContent(androidInviteParams.emailHtmlContent);
    androidInvite.setEmailSubject(androidInviteParams.emailSubject);
    androidInvite.setGoogleAnalyticsTrackingId(androidInviteParams.googleAnalyticsTrackingId);

    const ids = await firebase.invites().sendInvitation(invite);
    console.warn(ids);
    console.warn('FOOO');
    await firebase
      .links()
      .getInitialLink()
      .then(link => {
        console.warn(`outer${link}`);
      });
  }

  render() {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <Image
          source={{
            uri:
              'https://github.com/invertase/react-native-firebase-starter/raw/master/assets/ReactNativeFirebase.png',
          }}
          style={[styles.logo]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    height: 120,
    marginBottom: 16,
    width: 135,
  },
});

AppRegistry.registerComponent('testing', () => Root);
