#!/bin/sh
foreverOutput=$(forever list)
uid=$(echo $foreverOutput | cut -d ' ' -f18)
forever stop $uid
cd /var/www/hl2dm
git pull
node build.js
forever start api.js -l -o -e
