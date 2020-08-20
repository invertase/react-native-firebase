# React Native Firebase - Documentation Website

This `website` directory contains all of the source code for the [rnfirebase.io](https://rnfirebase.io/) website.
The contents and configuration is pulled locally from the `docs` directory.

The website is deployed automatically on changes to the repository.

## Running locally

First, install the dependencies:

```bash
yarn
```

Run the website in development mode:

```bash
yarn develop
```

Note; the initial build may take a couple of minutes to complete due to the volume of content being generated.

## Reference

The reference API is automatically sourced from the local repository on each build using [Typedoc](https://github.com/TypeStrong/typedoc).
