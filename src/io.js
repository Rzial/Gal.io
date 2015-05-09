/**
 * League of Legends API
 *  Endpoint Binding (IO)
 */

module.exports = function (apiKey, region) {
    var io = {
        api_key: apiKey,
        region: region
    };

    io.Champion = require('./api/champion').apply(io);
    io.CurrentGame = require('./api/current-game').apply(io);
    io.FeaturedGames = require('./api/featured-games').apply(io);
    io.Game = require('./api/game').apply(io);
    io.League = require('./api/league').apply(io);
    io.LOLStaticData = require('./api/lol-static-data').apply(io);
    io.LOLStatus = require('./api/lol-status').apply(io);
    io.Match = require('./api/match').apply(io);
    io.MatchHistory = require('./api/match-history').apply(io);
    io.Stats = require('./api/stats').apply(io);
    io.Summoner = require('./api/summoner').apply(io);
    io.Team = require('./api/team').apply(io);

    return io;
};