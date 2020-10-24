#!/bin/sh
echo curl -s './config.sh' | jq -r '.serverHostname'
