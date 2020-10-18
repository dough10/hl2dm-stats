#!/bin/sh
echo ' ___  ___  ___        _______  ________  _____ ______                  ________  _________  ________  _________  ________'
echo '|\  \|\  \|\  \      /  ___  \|\   ___ \|\   _ \  _   \               |\   ____\|\___   ___\\   __  \|\___   ___\\   ____\'
echo '\ \  \\\  \ \  \    /__/|_/  /\ \  \_|\ \ \  \\\__\ \  \  ____________\ \  \___|\|___ \  \_\ \  \|\  \|___ \  \_\ \  \___|_'
echo ' \ \   __  \ \  \   |__|//  / /\ \  \ \\ \ \  \\|__| \  \|\____________\ \_____  \   \ \  \ \ \   __  \   \ \  \ \ \_____  \'
echo '  \ \  \ \  \ \  \____  /  /_/__\ \  \_\\ \ \  \    \ \  \|____________|\|____|\  \   \ \  \ \ \  \ \  \   \ \  \ \|____|\  \'
echo '   \ \__\ \__\ \_______\\________\ \_______\ \__\    \ \__\               ____\_\  \   \ \__\ \ \__\ \__\   \ \__\  ____\_\  \'
echo '    \|__|\|__|\|_______|\|_______|\|_______|\|__|     \|__|              |\_________\   \|__|  \|__|\|__|    \|__| |\_________\'
echo '                                                                         \|_________|                              \|_________|'
echo ''
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
