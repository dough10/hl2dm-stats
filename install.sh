#!/bin/sh

echo ' ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo '|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo '\ \  \_|\ \ \  \|\  \ \  \\\  \ \  \___|\ \  \\\  \|\/_|\  \ \  \|\  \'
echo  '\ \  \ \\ \ \  \\\  \ \  \\\  \ \  \  __\ \   __  \|/ \ \  \ \  \\\  \'
echo   '\ \  \_\\ \ \  \\\  \ \  \\\  \ \  \|\  \ \  \ \  \   \ \  \ \  \\\  \'
echo    '\ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo     '\|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo ''
echo 'https://github.com/dough10/hl2dm-stats'

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
