---
title: iOS Setup | App Indexing
description: Setup your iOS application to handle app indexed URLs.
---

# iOS Setup

To handle indexed URLs within your iOS app, the URL definition needs to be added to your project using XCode.

## Setup up with XCode

Depending on your setup, open the following file with XCode:

- Using Pods: `ios/<project>.xcworkspace`
- None Pods Setup: `ios/<project>.xcodeproj`

### Navigate to URL Types

Open the URL Types configuration for your project:

1. Select your project on left hand side file tree
2. Select the Info tab on the middle pane
3. Expand the URL Types section header

![Example](https://prismic-io.s3.amazonaws.com/invertase%2F6b3a9afc-bb0a-44da-b642-ab0da8c48eed_navigate-to-url-types.png)

### Create a URL Type and Scheme

After navigating to the URL Types section of your Xcode workspace you can now add a new URL type.

#### Add new URL type (+)

1. Click the Add items plus (+) icon at the bottom of the URL Types section:

![Example](https://prismic-io.s3.amazonaws.com/invertase%2F806d79c8-3208-46db-9b38-7e5b5a13d7a2_add-item.png)

#### Configure the new URL Type

1. Input the `Identifier` value; The Identifier is normally the same as your Bundle Identifier which is usually the reverse of the domain for your app e.g. com.mycompany.app.
2. Input the `URL Schemes` value - this can be a comma delimited list of values; For example if you set this to myapp,foobar then your app will then accept urls from myapp://* and foobar://*.

`Icon` and `Role` can be left to use the defaults unless you need to change these.

![Example](https://prismic-io.s3.amazonaws.com/invertase%2F5d66eb78-883f-4f87-b390-adcee22bbff0_configure-item.png)






