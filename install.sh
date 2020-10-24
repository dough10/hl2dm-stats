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
echo '\e[39mInstalling..'
cd /var/www/hl2dm
echo "-----------install npm modules------------"
npm install


echo "-----------build app from source----------"
node build.js


echo "------------check nginx install-----------"
if ! command -v nginx &> /dev/null
then
    sudo apt-get install nginx -y
fi

echo "------------check certbot install-----------"
if ! command -v certbot &> /dev/null
then
    sudo apt-get install certbot -y
fi

echo "-------------ssl cert install--------------"
certbot certonly -a webroot --webroot-path=/var/www/html -d hl2dm.dough10.me


echo "----------install nginx site file----------"
sudo cp -u -p /var/www/hl2dm/hl2 /etc/nginx/sites-enabled/hl2


echo "--------------restart nginx---------------"
sudo systemctl restart nginx


echo "-----------------start API----------------"
forever start api.js -l -o -e


echo "---------chmod sh files executable--------"
chmod +x ./monitor.sh
chmod +x ./update.sh
chmod +x ./start.sh
chmod +x ./install.sh


echo "--------------resume monitor--------------"
./monitor.sh
