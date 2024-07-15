---
name: '⚠️ Other Platforms - Bug/Issue report'
about: Please provide as much detail as possible. Issues may be closed if they do
  not follow the template.
title: "[\U0001F41B] Other Platforms Bug Report Title - CHANGE ME "
labels: 'Help: Needs Triage, Impact: Bug, Platform: Other'
description: Create an issue specific to Other platforms on React Native Firebase.
body:
  - type: checkboxes
    attributes:
      label: Is there an existing issue for this?
      description: |
        Please search to see if an issue already exists for the bug you encountered.
      options:
        - label: I have searched the existing issues.
          required: true

  - type: checkboxes
    attributes:
      label: Please confirm you are aware of the 'Other' platform limitations.
      description: |
        Please see our [Other Platforms](https://rnfirebase.io/platforms) documentation for more information.
      options:
        - label: I confirm that issue is not relating to a known platform limitation.
          required: true

  - type: checkboxes
    attributes:
      label: Please confirm, this issue is NOT for Android or iOS?
      description: |
        This issue template is specifically for issues relating to the 'Other' platforms as defined in our [Other Platforms](https://rnfirebase.io/platforms) documentation.
      options:
        - label: I confirm that this issue is not for Android and not for iOS.
          required: true

  - type: markdown
    attributes:
      value: |
        ---

  - type: textarea
    attributes:
      label: Please describe your issue here.
      description: |
        Please provide as much detail as possible on your issue here,
        include which Firebase module you are using, which React Native version you are using,
        what version of React Native Firebase you are using, and any other relevant information.

        **Make sure to remove any sensitive information from your issue before submitting it.**
    validations:
      required: true

  - type: markdown
    attributes:
      value: |
        ---

  - type: textarea
    id: comments
    attributes:
      label: Additional context and comments
      description: |
        Anything else you want to add for this issue?
---

- 👉 Check out [`React Native Firebase`](https://twitter.com/rnfirebase) and [`Invertase`](https://twitter.com/invertaseio) on Twitter for updates on the library.
