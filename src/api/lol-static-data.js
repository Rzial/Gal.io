/**
 * League of Legends API
 *  Endpoint LOL Static Data
 */

var superagent = require('superagent'),

    CONST = require('../core/const'),
    stringReplacer = require('../utils/string-replacer'),
    regionExists = require('../utils/region-exists');

var methodVersion = "1.2";
var methodOptions = {
    "champion": "/api/lol/static-data/{region}/v{version}/champion",
    "champion-id": "/api/lol/static-data/{region}/v{version}/champion/{id}",
    "item": "/api/lol/static-data/{region}/v{version}/item",
    "item-id": "/api/lol/static-data/{region}/v{version}/item/{id}",
    "languageStrings": "/api/lol/static-data/{region}/v{version}/language-strings",
    "languages": "/api/lol/static-data/{region}/v{version}/languages",
    "map": "/api/lol/static-data/{region}/v{version}/map",
    "mastery": "/api/lol/static-data/{region}/v{version}/mastery",
    "mastery-id": "/api/lol/static-data/{region}/v{version}/mastery/{id}",
    "realm": "/api/lol/static-data/{region}/v{version}/realm",
    "rune": "/api/lol/static-data/{region}/v{version}/rune",
    "rune-id": "/api/lol/static-data/{region}/v{version}/rune/{id}",
    "summonerSpell": "/api/lol/static-data/{region}/v{version}/summoner-spell",
    "summonerSpell-id": "/api/lol/static-data/{region}/v{version}/summoner-spell/{id}",
    "versions": "/api/lol/static-data/{region}/v{version}/versions"
};

module.exports = function() {
    var LOLStaticData = function(options, callback) {
        callback("Error: This endpoint dont exists");
        return this;
    }.bind(this);

    LOLStaticData.champion = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.champion, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.champion.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["champion-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.item = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.item, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.item.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["item-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.languageStrings = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.languageStrings, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.languages = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.languages, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.map = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.map, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.mastery = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.mastery, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.mastery.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["mastery-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.realm = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.realm, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.rune = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.rune, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.rune.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["rune-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.summonerSpell = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.summonerSpell, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.summonerSpell.id = (function (id, options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions["summonerSpell-id"], {
            version: methodVersion,
            region: this.region.toLowerCase(),
            id: id
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.versions = (function (options, callback) {
        if (callback === undefined || callback === null) {
            callback = options;
            options = {};
        }

        if (!regionExists(this.region, callback))
            return;

        stringReplacer(methodOptions.versions, {
            version: methodVersion,
            region: this.region.toLowerCase()
        }, function (err, resultString) {
            var resultUrl = ["https://", CONST.REGIONAL_ENDPOINT.Global.host, resultString];

            superagent
                .get(resultUrl.join(""))
                .query({"api_key": this.api_key})
                .query(options)
                .end(callback);
        }.bind(this));

        return this;
    }.bind(this));

    LOLStaticData.methodVersion = methodVersion;

    return LOLStaticData;
};