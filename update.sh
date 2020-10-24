#!/bin/sh
echo '\e[36m ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo '|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo '\ \  \ |\ \ \  \|\  \ \  \ \  \ \  \___|\ \  \_\  \|\/_|\  \ \  \|\  \'
echo ' \ \  \  \ \ \  \ \  \ \  \ \  \ \  \  __\ \   __  \|/ \ \  \ \  \ \  \'
echo '  \ \  \__\ \ \  \_\  \ \  \_\  \ \  \_\  \ \  \ \  \   \ \  \ \  \_\  \'
echo '   \ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo '    \|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo '\e[33m'
echo 'https://github.com/dough10/hl2dm-stats'
echo '\e[39mUpdating...'

echo "\e[39m---------------\e[33mstopping API\e[39m---------------"
foreverOutput=$(forever list)
uid=$(echo $foreverOutput | cut -d ' ' -f18)
forever stop $uid


echo "\e[39m---------------\e[33mpull from github\e[39m---------------"
cd /var/www/hl2dm
git stash
git pull


echo "\e[39m---------------\e[33mbuild app from source\e[39m---------------"
node build.js


echo "\e[39m---------------\e[33mrestart API\e[39m---------------"
forever start api.js -l -o -e


echo "\e[39m---------------\e[33mupdate nginx site file\e[39m---------------"
cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2


echo "\e[39m---------------\e[33mrestart nginx\e[39m---------------"
sudo systemctl restart nginx


echo "\e[39m---------------\e[33mchmod sh files executable\e[39m---------------"
sudo chmod +x ./monitor.sh
sudo chmod +x ./update.sh
sudo chmod +x ./start.sh
sudo chmod +x ./install.sh


echo "\e[39m---------------\e[33mresume monitor\e[39m---------------"
./monitor.sh
