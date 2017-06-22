#!/usr/bin/env bash

# Copy firebase lib into tests directory
cp -R $(node --eval "console.log(require('path').resolve('./lib'));")/* $(node --eval "console.log(require('path').resolve('./tests/firebase'));")/

# Install /tests npm packages
cd tests && npm install
