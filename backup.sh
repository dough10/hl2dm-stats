#!/bin/sh
echo '\e[36m ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo '|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo '\ \  \ |\ \ \  \|\  \ \  \ \  \ \  \___|\ \  \_\  \|\/_|\  \ \  \|\  \'
echo ' \ \  \  \ \ \  \ \  \ \  \ \  \ \  \  __\ \   __  \|/ \ \  \ \  \ \  \'
echo '  \ \  \__\ \ \  \_\  \ \  \_\  \ \  \_\  \ \  \ \  \   \ \  \ \  \_\  \'
echo '   \ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo '    \|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo '\e[33m'
echo 'https://github.com/dough10/hl2dm-cfgs'
echo '\e[39mBackup Running...'

MONTH=$(date +%b)

echo "creating "$MONTH" folders"
sudo mkdir -p -m 777 /mnt/nas/DM-backup/logs/$MONTH
sudo mkdir -p -m 777 /mnt/nas/DM-backup/demos/$MONTH

echo "copying files"
sudo cp -r -u -v -p /hoedown/hl2mp/logs/* /mnt/nas/DM-backup/logs/$MONTH
sudo cp -r -u -v -p /hoedown/hl2mp/*.dem /mnt/nas/DM-backup/demos/$MONTH 
sudo cp -r -u -v -p /home/crumb/hl2dm-stats/old-top/* /mnt/nas/DM-backup/old-top
sudo cp -r -u -v -p /home/crumb/hl2dm-stats/old-stats/* /mnt/nas/DM-backup/old-stats
