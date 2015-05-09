/**
 * League of Legends API
 *  Endpoint Stats
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.3";
var methodOptions = {
    "ranked": "/api/lol/{region}/v{version}/stats/by-summoner/{summonerId}/ranked",
    "summary": "/api/lol/{region}/v{version}/stats/by-summoner/{summonerId}/summary"
};

module.exports = function() {
    var Stats = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    Stats.ranked = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.ranked, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
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

    Stats.summary = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.summary, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerId: summonerId
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

    Stats.methodVersion = methodVersion;

    return Stats;
};