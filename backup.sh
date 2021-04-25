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

SERVER_LOC=/hoedown/hl2mp
STATS_SERVER_LOC=/home/crumb/hl2dm-stats
BACKUP_LOC=/mnt/nas/DM-backup
MONTH=$(date +%b)

echo "mounting NAS"
mountpoint -q /mnt/nas && echo "mounted" || sudo mount -t cifs -o username=$1,password=$2 //192.168.86.2/Main /mnt/nas/

echo "creating "$MONTH" folders"
sudo mkdir -p -m 777 $BACKUP_LOC/logs/$MONTH
sudo mkdir -p -m 777 $BACKUP_LOC/demos/$MONTH

echo "copying files"
sudo cp -r -u -v -p $SERVER_LOC/logs/* $BACKUP_LOC/logs/$MONTH
sudo cp -r -u -v -p $SERVER_LOC/*.dem $BACKUP_LOC/demos/$MONTH 
sudo cp -r -u -v -p $STATS_SERVER_LOC/old-top/* $BACKUP_LOC/old-top
sudo cp -r -u -v -p $STATS_SERVER_LOC/old-stats/* $BACKUP_LOC/old-stats
