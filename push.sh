#!/bin/sh
echo "$1, V: $v";
if [ "$2" == "+" ]
  then
    v=$(node modules/incriment-version.js);
  else
    v=$(node -p "require('./package.json').version");
fi
node make-docs
git add .;
git commit -m "$1, V: $v";
git push;
