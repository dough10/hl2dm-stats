#!/bin/sh
node incriment-version.js
git add .;
git commit -m "$1";
git push;