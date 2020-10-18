#!/bin/sh
cd /var/www/hl2dm
forever start api.js -l -o -e

echo "resume monitor"
./monitor.sh
