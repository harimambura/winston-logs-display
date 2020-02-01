var _ = require('lodash');

function WLD(logger) {
	this.levels = logger.levels;

	const supportedKeys = ['dailyRotateFile', 'file'];
	for (const transport of logger.transports) {
		if (supportedKeys.includes(transport.name)) {
			this.transport = transport;
			break;
		}
	}

	if (!this.transport) {
		throw "No file or dailyRotateFile found in the transports list";
	}

	this.count = null;
}

/**
 * return logs for provided options
 *
 * @param options
 * @returns Promise
 */
WLD.prototype.list = function(options) {
	options.limit = options.limit || 50;
	options.offset = options.offset || 0;
	options.level = this.levels[options.level] || 1e10;

	return new Promise((resolve, reject) => {
		this.transport.query({rows: 1000000, start: 0}, (error, logs) => {
			if (error) {
				return reject(error);
			}

			logs = _.filter(logs, (entry) => {
				return this.levels[entry.level] <= options.level;
			});

			this.count = logs.length;
			logs = logs.splice(options.offset, options.limit);

			resolve(logs);
		});

	});
};

module.exports = WLD;
