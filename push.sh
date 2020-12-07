#!/bin/sh
if [ "$1" == "+" ]
  then
    v=$(node incriment-version.js)
  else
    v=$(node -p "console.log(require('./package.json').version)")
fi
d=$(node -p "new Date().getTime()")
echo "$d, V: $v"
git add .
git commit -m "$d, V: $v"
git push