---
title: Messaging with XMPP
description: Send and receive FCM messages directly between devices & your server with a XMPP server.
---

## Introduction

This is a reference for using the Firebase Messaging service to send and receive messages directly between devices. Although methods (e.g. `sendMessage()` are provided for sending and receiving message, additional configuration is needed to ensure a working solution for direct messaging from devices.

> A custom solution is **only required** if plan to exchange messages directly between devices (including the message sender device)
> please ensure a solution from this article has been configured to successfully send and receive messages from a device.

The following describes how to set up a server to handle messages, including...

- A custom XMPP server with XCS for receiving messages.
- Firebase admin for sending messages.

So what are we going to do?

1. Send a message from a client device.
2. Intercept using a custom XMPP server.
3. Push the message to Firebase using firebase-admin
4. Receive the message and acknowledge on other connected devices.

## Why can't I send and receive messages?

A common instance involves an implementation similar to the following.

```js
firebase.messaging().onMessage(message => {
  console.log('Received a message');
});

firebase.messaging().onMessageSent(message => {
  console.log('Sent a message');
});

firebase.messaging().onSendError(message => {
  console.log('Received an Error');
});

firebase.messaging().sendMessage({
  data: {
    foo: 'bar',
  },
});
```

Although correct, none of the listeners will acknowledge a `message` or `error`.

Permissions are limited on the client meaning an additional solution is required to communicate between `FCM` and any connected devices.

## How do I receive messages?

This is where you will need to deploy a custom server based, for example one based on Node XCS

Below is an example of how to configure a custom XMPP server using `node-xcs`.

```js
const Sender = require('node-xcs').Sender;

async function operation() {
  return () => {
    console.log('Listening >>>');

    // Enter firebase credentials here. {SenderID, ServerKey}
    var xcs = new Sender('XXXXXXXX', 'XXXXXXXX');

    xcs.start();

    xcs.on('message', function (messageId, from, data, category) {
      console.log('received message', messageId, from, data, category);
    });

    xcs.on('receipt', function (messageId, from, data, category) {
      console.log('received receipt', arguments);
    });

    xcs.on('error', e => console.warn('XMPP error.', e));
  };
}

async function app() {
  await operation();
}

app();
```

## How do I send messages?

For sending messages we can use the Firebase Admin SDK.

```js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

(async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'XXXXXXXX',
  });

  await admin.messaging().send({
    token: 'XXXXXXX',
    data: {
      foo: 'bar',
    },
  });
})();
```
