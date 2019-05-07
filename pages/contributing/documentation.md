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

_We're working on providing full API docs for each usable MDX component_

## Deploying changes

Changes are automatically deployed to our servers when merged with the main repository. Deployed changes can take a few
minutes to deploy.

## Other ways to Contribute

You can learn more about other ways of contributing to this project by visiting any of the sections below.

<Grid columns="2">
	<Block
		icon="error_outline"
		color="#2196f3"
		title="Issues, PRs & Project Management"
		to="/contributing/issues-prs-pm"
	>
		Help out with GitHub Issues, answering help requests on Discord and reviewing GitHub Pull Requests. This helps maintainers focus more on programming.
	</Block>
	<Block
		icon="code"
		color="#673ab7"
		title="Code, Testing & Review"
		to="/contributing/code-testing-review"
	>
		Learn how to contribute, review and test code to the project and learn more about our coding guidelines.
	</Block>
	<Block
		icon="edit"
		color="#673ab7"
		title="Marketing & Content"
		to="/contributing/marketing-content"
	>
		Have you recently written an article or tutorial about React Native Firebase? We'd love to include it on the documentation.
	</Block>
	<Block
		icon="person_pin"
		color="#3f51b5"
		title="Community & Events"
		to="/contributing/community"
	>
		Hosting a meetup or event that features React Native Firebase? We may be able to sponsor it through our Open Collective, provide swag or even attend it.
	</Block>
	<Block
		icon="attach_money"
		color="#ffeb3b"
		title="Donations & Expenses"
		to="/contributing/donations-expenses"
	>
		Donating through our Open Collective exclusively helps to support all the maintainers and collaborators. We also encourage contributors to submit expenses for work done.
	</Block>
</Grid>
