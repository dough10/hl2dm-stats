#!/bin/sh
v=(node incriment-version.js)
git add .;
git commit -m "$v";
git push;