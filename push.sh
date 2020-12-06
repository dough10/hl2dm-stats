#!/bin/sh
if [ "$1" == "+" ]
  then
    v=$(node incriment-version.js)
  else
    v=$(node -p "require('./package.json').version")
fi
d=$(date +%s)
git add .
git commit -m "$d, V:$v"
git push