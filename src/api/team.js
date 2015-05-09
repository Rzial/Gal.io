/**
 * League of Legends API
 *  Endpoint Team
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "2.4";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/team/{teamIds}",
    "bySummoner": "/api/lol/{region}/v{version}/team/by-summoner/{summonerIds}"
};

module.exports = function() {
    var Team = function(teamIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var teams;
        if (typeCheck.isArray(teamIds))
            teams = teamIds.join(", ");
        else
            teams = teamIds;

        stringReplacer(methodOptions[""], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            teamIds: teams
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

    Team.bySummoner = function(summonerIds, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerIds))
            summoners = summonerIds.join(", ");
        else
            summoners = summonerIds;

        stringReplacer(methodOptions.bySummoner, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerIds: summoners
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

    Team.methodVersion = methodVersion;

    return Team;
};