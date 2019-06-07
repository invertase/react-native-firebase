---
title: Android Setup | App Indexing
description: Setup your Android application to handle app indexed URLs.
---

# Android Setup

Your Android application needs to be setup to detect whether URLs which a user navigates to on your device are to be
handled by your application.

To set this up, add a new `intent-filter` to your manifest file. The example below will trigger the app indexing module
to handle URLs from any `https://invertase.io/blog` URL.

`android/app/src/main/AndroidManifest.xml`:
```xml
<manifest ...>
  <application android:name="com.your.app.MainApplication"
    ...>
    <activity android:name="com.your.app.MainActivity"
      ...>
        <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <category android:name="android.intent.category.BROWSABLE" />

          <data
            android:scheme="https"
            android:host="invertase.io"
            android:pathPrefix="/blog" />
        </intent-filter>
```
