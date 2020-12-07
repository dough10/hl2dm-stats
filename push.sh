#!/bin/sh
v=$(node -p "require('./package.json').version");
# if [ "$1" == "+" ]
#   then
#     v=$(node incriment-version.js)
# fi
d=$(date +%s);
git add .
git commit -m "$d, V: $v"
git push
