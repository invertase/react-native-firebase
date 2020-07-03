---
title: Messaging with XMPP
description: To send and receive messages with FCM requires additional steps to ensure listeners are correctly working.
---

This page demonstrates how to send and receive messages through a custom server. This will have to be deployed separately.

- Please note: A common issue found when using Firestore Messaging is that
- messages can only be received unless sent through an `XMPP` enabled server.

To give an example in your app, using `messaging.sendMessage()` will result in your FCM message been acknowledged by the server, however none of the client listeners will not be able to receive the message.

Below is an example of how to configure a custom server using `node-xcs`.

```js
const Sender = require('node-xcs').Sender;

async function operation() {
  return new Promise((resolve, reject) => {
    console.log('Listening >>>');

    // Enter firebase credentials here. {SenderID, ServerKey}
    var xcs = new Sender('XXXXXXXX', 'XXXXXXXX');

    xcs.start();

    xcs.on('message', function(messageId, from, data, category) {
      console.log('received message', messageId, from, data, category);
    });

    xcs.on('receipt', function(messageId, from, data, category) {
      console.log('received receipt', arguments);
    });

    xcs.on('error', e => console.warn('XMPP error.', e));
  });
}

async function app() {
  await operation();
}

app();
```

Using the events above you can then send messages, this will trigger the listeners on the devices.

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

Our recommendation would be to deploy a cloud function that could host your implementation.
