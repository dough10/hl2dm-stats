#!/bin/sh
foreverOutput=$(forever list)
log=$(echo $foreverOutput | cut -d ' ' -f18)
tail -f /root/.forever/$log.log
