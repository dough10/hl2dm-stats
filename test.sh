#!/bin/bash
U=$1
if [ -z ${U+x} ]; 
  then 
    echo "U is unset";  
  else 
    echo "U is set to $U"; 
fi
