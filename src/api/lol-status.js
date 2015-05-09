/**
 * League of Legends API
 *  Endpoint LOL Status
 *
 *  RITO_COMPLAINT: The server fires an error when the api key is included on the request (even if not needed) in
 *  the region version but not on the global one.
 *
 *  Error: The 'Access-Control-Allow-Origin' header contains multiple values '*, *', but only one is allowed.
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer');

var methodVersion = "1.0";
var methodOptions = {
    "": "/shards",
    "region": "/shards/{region}"
};

module.exports = function() {
    var LOLStatus = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        stringReplacer(methodOptions[""], {
        }, function (err, resultString) {
            var resultUrl = ["http://", CONST.REGIONAL_ENDPOINT.Status.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    LOLStatus.region = (function (region, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        stringReplacer(methodOptions.region, {
            region: region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["http://", CONST.REGIONAL_ENDPOINT.Status.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStatus.methodVersion = methodVersion;

    return LOLStatus;
};