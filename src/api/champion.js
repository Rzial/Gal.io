/**
 * League of Legends API
 *  Endpoint Champion
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/champion",
    "id": "/api/lol/{region}/v{version}/champion/{id}"
};

module.exports = function() {
    var Champion = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this);

    Champion.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.id, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT[this.region].host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    Champion.methodVersion = methodVersion;

    return Champion;
};