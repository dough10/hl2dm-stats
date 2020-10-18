#!/bin/sh
echo '\e[36m ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo '|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo '\ \  \ |\ \ \  \|\  \ \  \ \  \ \  \___|\ \  \_\  \|\/_|\  \ \  \|\  \'
echo ' \ \  \  \ \ \  \ \  \ \  \ \  \ \  \  __\ \   __  \|/ \ \  \ \  \ \  \'
echo '  \ \  \__\ \ \  \_\  \ \  \_\  \ \  \_\  \ \  \ \  \   \ \  \ \  \_\  \'
echo '   \ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo '    \|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo '\e[39m'
echo 'https://github.com/dough10/hl2dm-stats'
echo 'Updating...'

echo "---------------stopping API---------------"
foreverOutput=$(forever list)
uid=$(echo $foreverOutput | cut -d ' ' -f18)
forever stop $uid


echo "-------------pull from github-------------"
cd /var/www/hl2dm
git stash
git pull


echo "-----------build app from source----------"
node build.js


echo "----------------restart API---------------"
forever start api.js -l -o -e


echo "----------update nginx site file----------"
cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2


echo "--------------restart nginx---------------"
systemctl restart nginx


echo "---------chmod sh files executable--------"
chmod +x ./monitor.sh
chmod +x ./update.sh
chmod +x ./start.sh
chmod +x ./install.sh


echo "--------------resume monitor--------------"
./monitor.sh
