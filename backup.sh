#!/bin/bash

echo -e '\e[36m ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo -e '|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo -e '\ \  \ |\ \ \  \|\  \ \  \ \  \ \  \___|\ \  \_\  \|\/_|\  \ \  \|\  \'
echo -e ' \ \  \  \ \ \  \ \  \ \  \ \  \ \  \  __\ \   __  \|/ \ \  \ \  \ \  \'
echo -e '  \ \  \__\ \ \  \_\  \ \  \_\  \ \  \_\  \ \  \ \  \   \ \  \ \  \_\  \'
echo -e '   \ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo -e '    \|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo -e '\e[33m'
echo 'https://github.com/dough10/hl2dm-stats'
echo -e '\e[39mBackup Running...'

SMB=//192.168.86.2/Main
STORAGE=/mnt/nas
SERVER_LOC=/hoedown/hl2mp
STATS_SERVER_LOC=home/crumb/hl2dm-stats
BACKUP_LOC=home/crumb/DM-backup
MONTH=$(date +%b)



echo "Creating $MONTH folders"
mkdir -p -m 777 $BACKUP_LOC/logs/$MONTH
mkdir -p -m 777 $BACKUP_LOC/demos/$MONTH

echo "Copying files"
cp -r -u -v -p $SERVER_LOC/logs/* $BACKUP_LOC/logs/$MONTH
cp -r -u -v -p $SERVER_LOC/*.dem $BACKUP_LOC/demos/$MONTH 
cp -r -u -v -p $STATS_SERVER_LOC/old-top/* $BACKUP_LOC/old-top
cp -r -u -v -p $STATS_SERVER_LOC/old-stats/* $BACKUP_LOC/old-stats