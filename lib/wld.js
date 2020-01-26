'use strict';

var _ = require('lodash');

function WLD(logger) {
    var self = this;

    this.levels = logger.levels;

    var supportedKeys = ['dailyRotateFile', 'file']
    var transportFound = supportedKeys.some(function (key) {
        if (logger.transports[key]) {
            self.transport = logger.transports[key];
            return true;
        }

        return false;
    });

    if (!transportFound) {
        throw "No file or dailyRotateFile found in the transports list";
    }

    this.count = null;
}

/**
 * return logs for provided options
 *
 * @param options
 * @returns {bluebird}
 */
WLD.prototype.list = function (options) {
    var self = this;

    options.limit = options.limit || 50;
    options.offset = options.offset || 0;
    options.level = self.levels[options.level] || 1e10;

    return new Promise(function (resolve, reject) {
        self.transport.query({rows: 10000, start: 0}, function (error, logs) {
            if (error) {
                return reject(error);
            }

            logs = _.filter(logs, function (entry) {
                return self.levels[entry.level] <= options.level;
            });

            self.count = logs.length;
            logs = logs.splice(options.offset, options.limit);

            resolve(logs);
        });

    });
};

module.exports = WLD;
