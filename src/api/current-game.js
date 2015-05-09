/**
 * League of Legends API
 *  Endpoint Current Game
 *
 *  RITO_COMPLAINT: The CORS policy in this API call make it unavailable to use it from client javascript without
 *  using "hacks" like jsonp proxy :(.
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.0";
var methodOptions = {
    "": "/observer-mode/rest/consumer/getSpectatorGameInfo/{platformId}/{summonerId}"
};

module.exports = function() {
    var CurrentGame = function(summonerId, options, callback) {
        console.warn("This Endpoint is buggy for client javascript, it will not work. " +
        "Look at the RITO_COMPLAINT tag in the source code.");

        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            platformId: CONST.REGIONAL_ENDPOINT[this.region].platformId,
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

    CurrentGame.methodVersion = methodVersion;

    return CurrentGame;
};