---
title: Init
description: Automatically initialises an application. Can be used to create or update a current application.
next: /command-line-interface
previous: /command-line-interface/doctor
---

This module allows users to quickly install a new application or to update an existing project.

Once a project has been selected, a guide for installing `Android` and `iOS` applications will be provided.

## Usage

```bash
react-native firebase init
```

## Initial setup

The utility will prompt for which commands to run:

**Credentials**

If not logged in, the user will be prompted to login with their Firebase Credentials.

If `logged in`, the user will be prompted to continue with the option of changing accounts.

**Android Installation**

A prompt asks whether to install an Android application. Choosing `n` will skip this step.

**iOS Installation**

A prompt asks whether to install an iOS application. Choosing `n` will skip this step.

**Project Selection**

A list of Firebase projects based on your current credentials will be listed. Choose a specific project to install.

## Installation (Android)

**google-services.json**

This will be automatically added if none exists. A prompt to overwrite will be provided if the file already exists.

**firebase-perf**

The firebase performance plugin will automatically registered, if it not already.

**signing certificate**

A prompt asks whether to install a signing certificate. Choosing `n` will skip this step.

Selecting `y` will prompt the user to manually add the SHA-1 or SHA-256 fingerprint of your certificate.

## Installation (iOS)

**Admob Application Id**

This will be automatically added if none exists. A prompt to overwrite will be provided if the file already exists.

**GoogleService-Info.plist**

This will be automatically added if none exists. A prompt to overwrite will be provided if the file already exists.

**AppDelegate.m**

This will be automatically added if none exists. A prompt to overwrite will be provided if the file already exists.

## Web

Not applicable
