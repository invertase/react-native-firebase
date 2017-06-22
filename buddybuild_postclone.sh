#!/usr/bin/env bash

# Copy firebase lib into tests directory
mkdir tests/firebase
cp -R lib/* tests/firebase

# Install /tests npm packages
cd tests && npm install
