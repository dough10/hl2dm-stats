#!/bin/sh
echo "----------stopping API----------"
foreverOutput=$(forever list)
uid=$(echo $foreverOutput | cut -d ' ' -f18)
forever stop $uid


echo "----------pull from github----------"
cd /var/www/hl2dm
git pull


echo "----------build app from source----------"
node build.js


echo "----------restart API----------"
forever start api.js -l -o -e


echo "----------update nginx site  file----------"
cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2


echo "----------restart nginx----------"
systemctl restart nginx


echo "----------chmod sh files executable----------"
chmod +x ./monitor.sh
chmod +x ./update.sh
chmod +x ./start.sh
