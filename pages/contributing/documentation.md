---
title: Documentation
description: We are always looking to improve our documentation. Find out how you can help!
---

# Documentation

All documentation is open sourced and we are happy to accept contributions whether they are typo fixes or new pages.
Content is written in [Markdown](https://www.markdownguide.org/), and takes advantage of [MDX](https://github.com/mdx-js/mdx)
to provide powerful functionality on-top of Markdown.

## Location

The documentation source exists in a number of places:

- Versioned: Any versioned content is contained within the `docs/` directory of the main branch that version works from.
- Non-versioned: Any content which is not specific to a version of the library (e.g. [this page](https://github.com/invertase/react-native-firebase/blob/docs/pages/contributing/documentation.md)), 
is contained within the [docs](https://github.com/invertase/react-native-firebase/tree/docs) branch of the main repository.

## Reference

Our documentation reference is automatically generated from each packages TypeScript declaration. Our build process
automatically generates a [typedoc.json](https://github.com/invertase/react-native-firebase/blob/master/docs/typedoc.json)
file using [Typedoc](https://typedoc.org/), which is then parsed into a consumable format for our documentation generator.

> Please do not edit the `typedoc.json` file, instead make changes to the packages `index.d.ts` declarations.

## MDX

The MDX plugin allows us to use custom JSX components within our documentation pages where Markdown is not suitable.

*We're working on providing full API docs for each usable MDX component*

## Deploying changes

Changes are automatically deployed to our servers when merged with the main repository. Deployed changes can take a few
minutes to deploy.


