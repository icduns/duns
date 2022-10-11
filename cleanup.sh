#!/bin/sh

# cleanup ii
cd ii-dev
rm -rf ./.dfx
rm -rf ./dist

# cleanup dapp
cd ..
rm -rf ./.dfx
rm -rf ./dist
rm -rf ./declarations

