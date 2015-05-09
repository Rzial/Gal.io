/**
 * League of Legends API
 *  Endpoint Featured Games
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.0";
var methodOptions = {
    "": "/observer-mode/rest/featured"
};

module.exports = function() {
    var FeaturedGames = function(options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions[""], {
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

    FeaturedGames.methodVersion = methodVersion;

    return FeaturedGames;
};