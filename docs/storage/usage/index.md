---
title: Cloud Storage
description: Installation and getting started with Storage.
icon: //static.invertase.io/assets/firebase/cloud-storage.svg
next: /app/usage
previous: /messaging/server-integration
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the storage module
yarn add @react-native-firebase/storage

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/storage/usage/installation/ios) and [Android](/storage/usage/installation/android).

# What does it do

Storage is built for app developers who need to store and serve user-generated content, such as photos or videos.

<Youtube id="_tyjqozrEPY" />

Your data is stored in a Google Cloud Storage bucket, an exabyte scale object storage solution with high availability and
global redundancy. Storage lets you securely upload these files directly from mobile devices, handling spotty networks with ease.

# Usage

Your files are stored in a Google Cloud Storage bucket. The files in this bucket are presented in a hierarchical structure,
just like a file system. By creating a reference to a file, your app gains access to it. These references can then be
used to upload or download data, get or update metadata or delete the file. A reference can either point to a specific
file or to a higher level node in the hierarchy.

The Storage module also provides support for multiple buckets.

You can view your buckets on the [Firebase Console](https://console.firebase.google.com/project/_/storage/files).

## Creating a reference

A reference is a local pointer to some file on your bucket. This can either be a file which already exists, or one
which does not exist yet. To create a reference, use the `ref` method:

```js
import storage from '@react-native-firebase/storage';

const reference = storage().ref('black-t-shirt-sm.png');
```

You can also specify a file located in a deeply nested directory:

```js
const reference = storage().ref('/images/t-shirts/black-t-shirt-sm.png');
```

## Upload a file

To upload a file directly from the users device, the `putFile` method on a reference accepts a string path to the file
on the users device. For example, you may be creating an app which uploads users photos. The React Native Firebase
library provides [Utils](/app/utils) to help identify device directories:

```jsx
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';

import { utils } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

function App() {
  // create bucket storage reference to not yet existing image
  const reference = storage().ref('black-t-shirt-sm.png');

  return (
    <View>
      <Button
        onPress={async () => {
          // path to existing file on filesystem
          const pathToFile = `${utils.FilePath.PICTURES_DIRECTORY}/black-t-shirt-sm.png`;
          // uploads file
          await reference.putFile(pathToFile);
        }}
      />
    </View>
  );
}
```

### Tasks

The `putFile` method returns a [`Task`](/reference/storage/task), which if required, allows you to hook into information
such as the current upload progress:

```js
const task = reference.putFile(pathToFile);

task.on('state_changed', taskSnapshot => {
  console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
});

task.then(() => {
  console.log('Image uploaded to the bucket!');
});
```

A task also provides the ability to pause & resume on-going operations:

```js
const task = reference.putFile(pathToFile);

task.pause();

// Sometime later...
task.resume();
```

## Download URLs

A common use-case for Cloud Storage is to use it as a global Content Delivery Network (CDN) for your images. When uploading
files to a bucket, they are not automatically available for consumption via a HTTP URL. To generate a new Download URL, you
need to call the `getDownloadURL` method on a reference:

```js
import storage from '@react-native-firebase/storage';

const url = await storage().ref('images/profile-1.png').getDownloadURL();
```

> Images uploaded manually via the Firebase Console automatically generate a download URL.

## Listing files & directories

If you wish to view a full list of the current files & directories within a particular bucket reference, you can use
the `list` method. The results are however paginated, and if more results are available you can pass a page token into the request:

```js
import storage from '@react-native-firebase/storage';

function listFilesAndDirectories(reference, pageToken) {
  return reference.list({ pageToken }).then(result => {
    // Loop over each item
    result.items.forEach(ref => {
      console.log(ref.fullPath);
    });

    if (result.nextPageToken) {
      return listFilesAndDirectories(reference, result.nextPageToken);
    }

    return Promise.resolve();
  });
}

const reference = storage().ref('images');

listFilesAndDirectories(reference).then(() => {
  console.log('Finished listing');
});
```

## Security

By default your bucket will come with rules which allows only authenticated users on your project to access it. You can
however fully customize the security rules to your own applications requirements.

To learn more, view the [Storage Security](https://firebase.google.com/docs/storage/security/start) documentation
on the Firebase website.

## Multiple Buckets

A single Firebase project can have multiple storage buckets. The module will use the default bucket if no bucket argument
is passed to the `storage` instance. To switch buckets, provide the module with the `gs://` bucket URL found on the
Firebase Console, under Storage > Files.

```js
import storage, { firebase } from '@react-native-firebase/storage';

const defaultStorageBucket = storage();
const secondaryStorageBucket = firebase.app().storage('gs://my-secondary-bucket.appspot.com');
```
