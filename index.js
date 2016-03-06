#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');

var processFile = require('./lib/processFile').processFile;

program
    .usage('[options] <file ...>')
    .option('-process')
    .option('-o, --output', 'Output [stdout]', 'stdout')
    .parse(process.argv);

if (!program.args.length) {
    program.help();
} else {
    var pathToFile = program.args[0];

    if (!fs.existsSync(pathToFile)) {
        console.error('File does not exist!');
        process.exit(1);
    }

    fs.readFile(pathToFile, 'utf-8', function(err, fileData) {
        if (err) throw err;
        var jsonData = JSON.parse(fileData);
        processFile(jsonData);
    });
}