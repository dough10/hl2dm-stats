#!/bin/sh
v=$(node modules/incriment-version/incriment-version.js);
echo "$1, V: $v";
node make-docs
git add .;
git commit -m "$1, V: $v";
git push;
