#!/bin/sh
cd /var/www/hl2dm
forever start api.js -l -o -e

foreverOutput=$(forever list)
log=$(echo $foreverOutput | cut -d ' ' -f18)
tail -f /root/.forever/$log.log
