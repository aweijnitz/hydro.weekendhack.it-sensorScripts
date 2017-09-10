var LineByLineReader = require('line-by-line');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var currentLine = 0;

if (argv.length < 2) {
    console.out('Need one input file and one output file as arguments');
    process.exit(1);
}

console.log(new Date().toString() + ', Reading '+argv._[0]);
console.log(new Date().toString() + ', Writing THRoom '+argv._[1]);

var lr = new LineByLineReader(path.resolve(argv._[0]));
var thFile = argv._[1];
var tData = [];
var hData = [];

// Max 481 lines work. Issue with Metrics.js
var maxLines = 481;

lr.on('error', function (err) {
    console.err('Something went wrong! '+err);
});


lr.on('line', function (line) {
    // 'line' contains the current line without the trailing newline character.
    // Line format: "timestamp", temp, pressure, humidity in %
    var parts = line.split(',');
    if(parts.length < 3) {
        console.err('Data error. Missing entries on line '+currentLine);
        process.exit(2);
    }
    var time = new Date(parts.shift());
    var temp = parseFloat(parts.shift());
    var pressure = parseFloat(parts.shift()); // not used
    var humidity = parseFloat(parts.shift());
    tData.push({ at: time, value: temp.toFixed(2) });
    hData.push({ at: time, value: humidity.toFixed(2) });
    currentLine++;
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    var tMax = tData.length >= maxLines ?  tData.length - maxLines : tData.length;
    var hMax = hData.length >= maxLines ?  hData.length - maxLines : hData.length;

    // This could be more elegant, but too tired to think right now.
    if(tMax >= maxLines) {
        fs.writeFile(thFile, JSON.stringify([tData.slice(tMax), hData.slice(hMax)]), function (err) {
            if (err) throw err;
        });
    } else {
        fs.writeFile(thFile, JSON.stringify([tData, hData]), function (err) {
            if (err) throw err;
        });
    }

    console.log(new Date().toString() + ', Processed '+(currentLine-1)+' lines. Cut: ' + tMax + ' lines.');
});
