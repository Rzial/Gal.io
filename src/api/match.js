/**
 * League of Legends API
 *  Endpoint Match
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "2.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/match/{matchId}"
};

module.exports = function() {
    var Match = function(matchId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            matchId: matchId
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

    Match.methodVersion = methodVersion;

    return Match;
};