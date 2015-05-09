/**
 * League of Legends API
 *  Endpoint League
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "2.5";
var methodOptions = {
    "bySummoner": "/api/lol/{region}/v{version}/league/by-summoner/{summonerIds}",
    "bySummoner-entry": "/api/lol/{region}/v{version}/league/by-summoner/{summonerIds}/entry",
    "byTeam": "/api/lol/{region}/v{version}/league/by-team/{teamIds}",
    "byTeam-entry": "/api/lol/{region}/v{version}/league/by-team/{teamIds}/entry",
    "challenger": "/api/lol/{region}/v{version}/league/challenger",
    "master": "/api/lol/{region}/v{version}/league/master"
};

module.exports = function() {
    var League = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    League.bySummoner = function (summonerIds, options, callback) {
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

    League.bySummoner.entry = function (summonerIds, options, callback) {
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

        stringReplacer(methodOptions["bySummoner-entry"], {
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

    League.byTeam = function (teamIds, options, callback) {
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

        stringReplacer(methodOptions.byTeam, {
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

    League.byTeam.entry = function (teamIds, options, callback) {
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

        stringReplacer(methodOptions["byTeam-entry"], {
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

    League.challenger = function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.challenger, {
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

    League.master = function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.master, {
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

    League.methodVersion = methodVersion;

    return League;
};