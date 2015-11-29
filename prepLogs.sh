#!/bin/bash

# This is needed to make things work in non-interactive shells
SCRIPT_HOME=/home/aw/www/hydro.weekendhack.it/sensoreDataScripts
cd $SCRIPT_HOME

FILETHP=work/thp.tmp
FILELUMEN=work/lumen.tmp
TH_JSON=work/th.json
PRES_JSON=work/pressure.json
LIGHT_JSON=work/luminocity.json

# Strip unwanted whitespace and make timestamps javascript friendly, like '2015-11-28T18:27:14.969Z'
cat ../public_html/sensorlogs/tempHumidityPressure.log | sed "s/[[:space:]],[[:space:]]/,/g" | sed "s/\(....-..-..\)[[:space:]]\([0-9][0-9]:[0-9][0-9]\)/\1T\2:00.000Z/g" > $FILETHP
cat ../public_html/sensorlogs/luminocity.log | sed "s/[[:space:]],[[:space:]]/,/g" | sed "s/\(....-..-..\)[[:space:]]\([0-9][0-9]:[0-9][0-9]\)/\1T\2:00.000Z/g" > $FILELUMEN

# Create json files for graphing the data in the browser
node ./convertTHP.js $FILETHP $TH_JSON $PRES_JSON
node ./convertLight.js $FILELUMEN $LIGHT_JSON

# Make the new data available
mv $TH_JSON ../public_html/sensorlogs
mv $PRES_JSON ../public_html/sensorlogs
mv $LIGHT_JSON ../public_html/sensorlogs

# Clean up
rm $FILETHP $FILELUMEN
