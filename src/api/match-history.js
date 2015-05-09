/**
 * League of Legends API
 *  Endpoint Match History
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "2.2";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/matchhistory/{summonerId}"
};

module.exports = function() {
    var MatchHistory = function(summonerId, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
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

    MatchHistory.methodVersion = methodVersion;

    return MatchHistory;
};