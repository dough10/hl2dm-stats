#!/bin/sh
ve=$(node -p "require('./package.json').version")
# if [ "$1" == "+" ]
#   then
#     ve=$(node incriment-version.js)
# fi
d=$(date +%s)
git add .
git commit -m "$d, V:$ve"
git push
