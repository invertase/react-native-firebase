---
title: Doctor
description: Command to display the health of your application. 
next: /command-line-interface/init
previous: /command-line-interface
---

This module allows users to quickly evaluate the health of your application. Influenced by Flutters own `doctor` command.

Once an application has been selected, the current project will be compared to check the health of the installation. An overview of the projects dependencies will also be listed.

## Usage

```bash
react-native firebase doctor
```

## Health Report

This utility will print out information regarding your application. And will include the following:

**Packages**

A complete list of packages and their current version will be output into the terminal.

**List of modules**

Connected applications such as `Admob` will be displayed and accomepanied with a `✓` if configured correctly.

**Android Installation**

The application Id will be displayed.

In addition, version dependencies and the status of any plugins will be evaluated with a `✓` for correctly configured modules.

The projects `google-services.json` is also evaluated to ensure the project has the correct configuration.

**iOS Installation**

Your `GoogleService-Info.plist` will be evaluated with a `✓` for correctly configured module.

Your `Configured iOS credentials` will be evaluated with a `✓` for correctly configured module.


## Flags

**-f --force**

Initialise Firebase for the project regardless of pending changes

**-p --platform**

Run the action only for a specific platform. Options: android, ios (not supported), web (not supported), all.