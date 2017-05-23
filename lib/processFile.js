var path = require('path');
var colors = require('colors/safe');
var filesize = require('filesize');
var repeatString = require('repeat-string');
var table = require('cli-table2');

// TODO: make it configurable
var barChar = '☰'; // ☰ ◉ █
var chartWidth = 25;
var modulesMinPct = 0;

function round(num) {
    return Math.round(num * 100) / 100;
}

function processAssets(jsonData) {
    var assetsTotal = 0;
    var assetsByType = {};

    jsonData.assets.forEach(function (item, i) {
        var fileType = path.extname(item.name).replace('.', '');

        assetsTotal += item.size;
        item.type = fileType;

        if (!assetsByType[fileType]) assetsByType[fileType] = {total: 0, items: []};
        assetsByType[fileType].total += item.size;
        assetsByType[fileType].items.push(item);
    });

    var assetsTable = new table({
        head: ['Chart', 'Pct', 'Type', 'File', 'Size'].map(function (item) {
            return colors['green'](item);
        }),
        colWidths: [chartWidth, 7, 6, 39, 11]
    });

    jsonData.assets.sort(function (a, b) {
        return b.size - a.size;
    }).forEach(function (item, i) {
        var pct = round((item.size/(assetsTotal/100)));
        var color = pct > 25 ? 'red' : (pct > 5 ? 'yellow' : 'blue');

        var bar = {
            hAlign: 'left',
            content: colors[color](repeatString(barChar, pct * (chartWidth-1)/100))
        };

        assetsTable.push([bar, colors[color](pct), item.type, colors[color](item.name), filesize(item.size)]);
    });

    console.log(assetsTable.toString());

    for (var type in assetsByType) {
        var group = assetsByType[type];

        var groupTable = new table({
            head: ['Chart', 'Pct', 'Type', 'File', 'Size'].map(function (item) {
                return colors['green'](item);
            }),
            colWidths: [chartWidth, 7, 6, 39, 11]
        });

        console.log('\n\n', type, filesize(assetsByType[type].total), '\n');

        group.items.sort(function (a, b) {
            return b.size - a.size;
        }).forEach(function (item, i) {
            var pctOfType = round(item.size/(assetsByType[type].total/100));
            var color = pctOfType > 25 ? 'red' : (pctOfType > 5 ? 'yellow' : 'blue');

            var bar = {
                hAlign: 'left',
                content: colors[color](repeatString(barChar, pctOfType * (chartWidth-1)/100))
            };

            groupTable.push([bar, colors[color](pctOfType), item.type, colors[color](item.name), filesize(item.size)]);

        });

        console.log(groupTable.toString());
    }
}

function processModules(jsonData) {
    var assetsTotal = 0;
    var assetsByType = {};

    jsonData.modules.forEach(function (item, i) {
        var fileType = path.extname(item.name).replace('.', '');

        assetsTotal += item.size;
        item.type = fileType;

        if (!assetsByType[fileType]) assetsByType[fileType] = {total: 0, items: []};
        assetsByType[fileType].total += item.size;
        assetsByType[fileType].items.push(item);
    });

    var modulesTable = new table({
        head: ['Pct', 'Type', 'File', 'Size'].map(function (item) {
            return colors['green'](item);
        }),
        colWidths: [7, 6, 49, 11]
    });

    var restPct = 0;
    var restSize = 0;

    jsonData.modules.sort(function (a, b) {
        return b.size - a.size;
    }).forEach(function (item, i) {
        var pct = round((item.size/(assetsTotal/100)));
        var color = pct > 25 ? 'red' : (pct > 5 ? 'yellow' : 'blue');

        if (pct < modulesMinPct) {
            restPct += pct;
            restSize += item.size;
        }else {
            modulesTable.push([colors[color](pct), item.type, colors[color](item.name), filesize(item.size)]);
        }

    });

    if (restPct > 0) {
        modulesTable.push([round(restPct), '-', '(rest of the modules)', filesize(restSize)]);
    }

    console.log(modulesTable.toString());
}

function processStats(jsonData) {
    jsonData.modules.sort(function (a, b) {
        return b.size - a.size;
    }).forEach(function (item, i) {
        console.log(item.name, filesize(item.size));
    });
}

function processModulesTree(jsonData) {
    var modules = [];
    var modulesTotal = 0;
    var modulesByPath = [];

    jsonData.modules.forEach(function (item, i) {
        var fileType = path.extname(item.name).replace('.', '');

        modulesTotal += item.size;
        item.type = fileType;

        var name = item.name.split('/').filter(function (part) {
            return !part.match(/\./);
        }).join('/');

        if (!modulesByPath[name]) modulesByPath[name] = {size: 0, name: name, items: []};
        modulesByPath[name].size += item.size;
        modulesByPath[name].items.push(item);
    });

    for (var j in modulesByPath) {
        modules.push(modulesByPath[j]);
    }

    var modulesTable = new table({
        head: ['Pct', 'File', 'Size'].map(function (item) {
            return colors['green'](item);
        }),
        colWidths: [7, 49, 11]
    });

    var restPct = 0;
    var restSize = 0;

    modules.sort(function (a, b) {
        return b.size - a.size;
    }).forEach(function (item, i) {
        var pct = round((item.size/(modulesTotal/100)));
        var color = pct > 25 ? 'red' : (pct > 5 ? 'yellow' : 'blue');

        if (pct < modulesMinPct) {
            restPct += pct;
            restSize += item.size;
        }else {
            modulesTable.push([colors[color](pct), colors[color](item.name), filesize(item.size)]);
        }

    });

    if (restPct > 0) {
        modulesTable.push([round(restPct), '-', '(rest of the modules)', filesize(restSize)]);
    }

    console.log(modulesTable.toString());
}

module.exports = {
    processFile: function (jsonData) {
        // processAssets(jsonData);
        // processModules(jsonData);
        processStats(jsonData);
        // processModulesTree(jsonData);
    }
};
