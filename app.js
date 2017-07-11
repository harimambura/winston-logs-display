'use strict';

var jade = require('jade'),
    _ = require('lodash'),
    wld;

module.exports = function (app, logger) {

    wld = new (require('./lib/wld'))(logger);

    app.get('/', function(req, res) {
        res.redirect('/logs/1');
    });

    app.get('/logs', function(req, res) {
        res.redirect('/logs/1');
    });

    app.get('/logs/:page', function(req, res) {
        var page = req.params.page || 1,
            itemsOnPage = 30;

        page = parseInt(page);

        var level = req.query.level || '';

        wld.list({
            limit: itemsOnPage,
            offset: (page - 1) * itemsOnPage,
            level: level
        }).then(function (logs) {
            var pagesCount = Math.floor(wld.count / itemsOnPage) + (wld.count % itemsOnPage === 0 ? 0 : 1);

            var start = Math.max(1, page - 2);
            var end = Math.min(pagesCount, start + 4);

            res.send(jade.renderFile(__dirname + '/views/logs.jade', {
                logs: logs,
                pages: _.range(start, end + 1),
                currentPage: page,
                lastPage: pagesCount,
                level: level
            }, null));
        });

    });

};