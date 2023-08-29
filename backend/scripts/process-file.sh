#!/bin/sh

#
# Command line arguments:
# =======================
# $1 - input filename (the file received from the user)
# $2 - output filename with path, without extension (.oga and .flac)
# $3 - project sample rate
#

sox "$1" -r $3 -C 7 -c 2 -t ogg "$2.oga" > /dev/null
if [ $? -ne 0 ]
then
  echo OGG conversion failed! >&2
  exit 1
fi

sox "$1" -r $3 -C 8 -c 2 "$2.flac" > /dev/null
if [ $? -ne 0 ]
then 
  echo FLAC conversion failed! >&2
  exit 2
fi

rm "$1" > /dev/null
if [ $? -ne 0 ]
then 
  echo Could not remove uploaded file! >&2
  exit 3
fi

soxi -s "$2.oga"
