#!/bin/sh

# deploy ii
cd ii-dev
npm ci

# deploy dapp
cd ..
yarn

