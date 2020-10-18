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
echo 'Starting app...'
cd /var/www/hl2dm
forever start api.js -l -o -e

echo "resume monitor"
./monitor.sh
