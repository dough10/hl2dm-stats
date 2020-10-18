#!/bin/sh
echo 'Default \e[36mCyan ________  ________  ___  ___  ________  ___  ___    _____  ________'
echo 'Default \e[36mCyan|\   ___ \|\   __  \|\  \|\  \|\   ____\|\  \|\  \  / __  \|\   __  \'
echo 'Default \e[36mCyan\ \  \ |\ \ \  \|\  \ \  \ \  \ \  \___|\ \  \_\  \|\/_|\  \ \  \|\  \'
echo 'Default \e[36mCyan \ \  \  \ \ \  \ \  \ \  \ \  \ \  \  __\ \   __  \|/ \ \  \ \  \ \  \'
echo 'Default \e[36mCyan  \ \  \__\ \ \  \_\  \ \  \_\  \ \  \_\  \ \  \ \  \   \ \  \ \  \_\  \'
echo 'Default \e[36mCyan   \ \_______\ \_______\ \_______\ \_______\ \__\ \__\   \ \__\ \_______\'
echo 'Default \e[36mCyan    \|_______|\|_______|\|_______|\|_______|\|__|\|__|    \|__|\|_______|'
echo ''
echo 'https://github.com/dough10/hl2dm-stats'
echo 'Monitoring..'
foreverOutput=$(forever list)
log=$(echo $foreverOutput | cut -d ' ' -f18)
tail -f /root/.forever/$log.log
