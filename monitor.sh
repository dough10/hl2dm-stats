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
echo '\e[39mMonitoring..'
foreverOutput=$(forever list)
log=$(echo $foreverOutput | cut -d ' ' -f18)
tail -f $HOME/.forever/$log.log
