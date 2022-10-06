#!/bin/sh

# deploy ii
cd ii-dev
rm -rf ./.dfx
npm ci
dfx deploy --no-wallet --argument '(null)'

# deploy dapp
cd ..
rm -rf ./.dfx
#rm -rf ./declarations
yarn
dfx deploy

