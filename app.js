'use strict';

const jade = require('pug');
const _ = require('lodash');
let wld;

module.exports = function(app, logger) {

	try {
		wld = new (require('./lib/wld'))(logger);
	} catch (e) {
		console.log(e.message || e);
	}

	app.get('/logs', function(req, res) {
		res.redirect('/logs/1');
	});

	app.get('/logs/:page', function(req, res) {
		let page = parseInt(req.params.page) || 1;
		const itemsOnPage = 30;
		const level = req.query.level || '';

		wld.list({
			limit: itemsOnPage,
			offset: (page - 1) * itemsOnPage,
			level: level
		}).then(function(logs) {
			const pagesCount = Math.floor(wld.count / itemsOnPage) + (wld.count % itemsOnPage === 0 ? 0 : 1);

			const start = Math.max(1, page - 2);
			const end = Math.min(pagesCount, start + 4);

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