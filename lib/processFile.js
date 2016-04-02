var path = require('path');
var colors = require('colors/safe');
var filesize = require('filesize');
var repeatString = require('repeat-string');
var table = require('cli-table2');

// TODO: make it configurable
var barChar = '☰'; // ☰ ◉ █ ░
var chartWidth = 25;

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
    line();
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

    jsonData.modules.sort(function (a, b) {
        return b.size - a.size;
    }).forEach(function (item, i) {
        var pct = round((item.size/(assetsTotal/100)));
        var color = pct > 25 ? 'red' : (pct > 5 ? 'yellow' : 'blue');

        console.log('+', colors[color](repeatString('‖', pct/2)), pct, item.type, colors[color](item.name), filesize(item.size));
    });

    // line();
    //
    // for (var type in assetsByType) {
    //     var group = assetsByType[type];
    //
    //     console.log('\n\n', type, filesize(assetsByType[type].total), '\n');
    //
    //     group.items.sort(function (a, b) {
    //         return b.size - a.size;
    //     }).forEach(function (item, i) {
    //         var pctOfType = round(item.size/(assetsByType[type].total/100));
    //         var color = pctOfType > 25 ? 'red' : (pctOfType > 5 ? 'yellow' : 'blue');
    //
    //         console.log('+', colors[color](repeatString('‖', pctOfType/2)), pctOfType, item.type, colors[color](item.name), filesize(item.size));
    //     });
    // }
}

module.exports = {
    processFile: function (jsonData) {
        processAssets(jsonData);
        // processModules(jsonData);
    }
};