#!/bin/sh

# deploy ii
cd ii-dev
dfx deploy --no-wallet --argument '(null)'

# deploy dapp
cd ..
dfx deploy

