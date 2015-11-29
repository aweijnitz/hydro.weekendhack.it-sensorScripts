var LineByLineReader = require('line-by-line');
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var currentLine = 0;

if (argv.length < 2) {
    console.out('Need intput file and one output file as argument');
    process.exit(1);
}

console.log('Reading '+argv._[0]);
console.log('Writing '+argv._[1]);
var lr = new LineByLineReader(path.resolve(argv._[0]));
var luxFile = argv._[1];
var lData = [];


lr.on('error', function (err) {
    console.err('Something went wrong! '+err);
});

lr.on('line', function (line) {
    // 'line' contains the current line without the trailing newline character.
    // Line format: "timestamp", temp, pressure, humidity in %
    var parts = line.split(',');
    if(parts.length < 2) {
        console.err('Data error. Missing entries on line '+currentLine);
        process.exit(2);
    }
    var time = new Date(parts.shift());
    var light = parseInt(parts.shift());
    lData.push({ at: time, value: light });
    currentLine++;
});

lr.on('end', function () {
    // All lines are read, file is closed now.
    console.log('Processed '+(currentLine-1)+' lines.');
    fs.writeFile(luxFile, JSON.stringify(lData), function (err) {
        if (err) throw err;
    });
});
