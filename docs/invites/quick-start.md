---
title: Quick Start
description: Get to grips with the basics of Invites in React Native Firebase
---

# Invites Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/invites
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Messaging package into your project:

```js
import invites from '@react-native-firebase/invites';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/invites';
```

### Handling incoming invites

Invites can be sent to your users app when the app is already open or not running. React Native Firebase exposes
two methods to handle these events separately.

#### Open app

When the app is already open, incoming invites are handled using the `onInvitation` method. This takes a subscriber
function which contains invite information such as the deep link to handle within your app, and the ID of the invitation
that was opened.

```jsx
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import invites from '@react-native-firebase/invites';

function App() {
  // Subscriber function
  function handleInvitation(invite) {
    // Handle invite within your app
    const deeplink = invite.deeplink;
    Alert.alert('Invitation received', `ID: ${invite.invitationId}`);
  }

  useEffect(() => {
    const subscriber = invites().onInvitation(handleInvitation);
    return subscriber();
  });

  return <HomeScreen />;
}
```

#### Closed/Terminated app

Whenever the app is closed, or terminated, users may still open the invite from their device which triggers the app
to open. To handle this scenario, React Native Firebase provides the `getInitialInvitation` method which is triggered
once the React Native app is ready. This method is always called, even when no invite has been opened.

```jsx
import { Alert } from 'react-native';
import invites from '@react-native-firebase/invites';

async function bootstrap() {
  const invite = await invites().getInitialInvitation();

  // Check if an invite has been opened
  if (invite) onInitialInvite(invite);
}

function onInitialInvite(invite) {
  // Handle invite within your app
  const deeplink = invite.deeplink;
  Alert.alert('Invitation opened', `ID: ${invite.invitationId}`);
}
```

### Sending an invite

To send an invite, it must first be built using `createInvitation` and then sent using `sendInvitation`. The
`createInvitation` returns an instance of a `InviteBuilder` which can be used to enhance your invitation with additional
contents such as HTML content, a Google Analytics tracking ID and a custom email subject and more.

To view all available invite properties, view the <Anchor href="/reference/invitebuilder">`InviteBuilder`</Anchor> reference.

```js
import invites from '@react-native-firebase/invites';

async function createAndSendInvite(user) {
  const invite = invites().createInvitation(
    'Join my app',
    `Hey ${user.name}, join my app with me and share content!`,
  );
  // Set additional invite content
  invite
    .setCallToActionText('Join my app!')
    .setDeepLink(`app:/invite?name=${user.uid}`)
    // Set Android specific content
    .android.setGoogleAnalyticsTrackingId('UA-12345')
    .setEmailSubject(`${user.name}, join my app!`);

  try {
    const id = await invites().sendInvitation(invite);
    console.log(`Invite created with the ID:`, id);
  } catch (e) {
    console.error(e);
  }
}
```
