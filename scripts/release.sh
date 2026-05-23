#!/bin/bash

set -xe

if [[ ! -z ${NIGHTLY_RELEASE} ]] ; then
  pnpm exec tsx ./scripts/bump-nightly
fi

echo "Publishing"
npm publish --access public --tag next
