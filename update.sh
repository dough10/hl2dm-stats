#!/bin/sh
foreverOutput=$(forever list)
uid=$(echo $foreverOutput | cut -d ' ' -f18)
forever stop $uid
cd /var/www/hl2dm
git pull
node build.js
forever start api.js -l -o -e
cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2
systemctl restart nginx
