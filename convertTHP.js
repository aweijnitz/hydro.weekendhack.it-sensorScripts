var LineByLineReader = require('line-by-line');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var currentLine = 0;

if (argv.length < 3) {
    console.out('Need intput file and two output files as arguments');
    process.exit(1);
}

console.log(new Date().toString() + ', Reading '+argv._[0]);
console.log(new Date().toString() + ', Writing TH '+argv._[1]);
console.log(new Date().toString() + ', Writing press '+argv._[2]);
var lr = new LineByLineReader(path.resolve(argv._[0]));
var thFile = argv._[1];
var pressureFile = argv._[2];
var tData = [];
var hData = [];
var pressureData = [];
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
    var pressure = parseFloat(parts.shift());
    var humidity = parseFloat(parts.shift());
    tData.push({ at: time, value: temp.toFixed(2) });
    hData.push({ at: time, value: humidity.toFixed(2) });
    pressureData.push({ at: time, value: pressure.toFixed(2) });
    currentLine++;
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    var tMax = tData.length >= maxLines ?  tData.length - maxLines : tData.length;
    var hMax = hData.length >= maxLines ?  hData.length - maxLines : hData.length;
    var pMax = pressureData.length >= maxLines ? pressureData.length - maxLines : pressureData.length;

    fs.writeFile(thFile, JSON.stringify([tData.slice(tMax), hData.slice(hMax)]), function (err) {
        if (err) throw err;
    });
    fs.writeFile(pressureFile, JSON.stringify(pressureData.slice(pMax)), function (err) {
        if (err) throw err;
    });

    console.log(new Date().toString() + ', Processed '+(currentLine-1)+' lines. Cut: ' + tMax + ' lines.');
});
