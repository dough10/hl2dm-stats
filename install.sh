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
echo 'Installing..'
cd /var/www/hl2dm
echo "-----------install npm modules------------"
npm install


echo "-----------build app from source----------"
node build.js


echo "------------check nginx install-----------"
if ! command -v nginx &> /dev/null
then
    apt-get install nginx
    exit
fi


echo "----------install nginx site file----------"
cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2


echo "--------------restart nginx---------------"
systemctl restart nginx


echo "-----------------start API----------------"
forever start api.js -l -o -e


echo "---------chmod sh files executable--------"
chmod +x ./monitor.sh
chmod +x ./update.sh
chmod +x ./start.sh
chmod +x ./install.sh


echo "--------------resume monitor--------------"
./monitor.sh
