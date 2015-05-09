/**
 * League of Legends API
 *  Endpoint Summoner
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists'),
    typeCheck = require('../utils/type-check');

var methodVersion = "1.4";
var methodOptions = {
    "": "/api/lol/{region}/v{version}/summoner/{summonerIds}",
    "masteries": "/api/lol/{region}/v{version}/summoner/{summonerIds}/masteries",
    "name": "/api/lol/{region}/v{version}/summoner/{summonerIds}/name",
    "runes": "/api/lol/{region}/v{version}/summoner/{summonerIds}/runes",
    "byName": "/api/lol/{region}/v{version}/summoner/by-name/{summonerNames}"
};

module.exports = function() {
    var Summoner = function(summonerIds, options, callback) {
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

        stringReplacer(methodOptions[""], {
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

    Summoner.masteries = function(summonerIds, options, callback) {
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

        stringReplacer(methodOptions.masteries, {
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

    Summoner.runes = function(summonerIds, options, callback) {
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

        stringReplacer(methodOptions.runes, {
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

    Summoner.getName = function(summonerIds, options, callback) {
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

        stringReplacer(methodOptions.name, {
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

    Summoner.byName = function(summonerNames, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        var summoners;
        if (typeCheck.isArray(summonerNames))
            summoners = summonerNames.join(", ");
        else
            summoners = summonerNames;

        stringReplacer(methodOptions.byName, {
            version: methodVersion,
            region: this.region.toLowerCase(),
            summonerNames: summoners
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

    Summoner.methodVersion = methodVersion;

    return Summoner;
};