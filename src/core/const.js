/**
 * League of Legends API
 *  Consts
 *
 * REFERENCE: https://developer.riotgames.com/docs/game-constants
 *
 * TODO: Match timeline data position values
 * TODO: Rune slot Id
 *
 */

var CONST = {
    "REGIONAL_ENDPOINT": require('./const/regional-endpoint'),
    "MATCHMAKING_QUEUES": require('./const/matchmaking-queues'),
    "MAP_NAME": require('./const/map-name'),
    "GAME_MODE": require('./const/game-mode'),
    "GAME_TYPE": require('./const/game-type'),
    "SUBTYPE": require('./const/subtype'),
    "PLAYER_STAT_SUMMARY_TYPE": require('./const/player-stat-summary-type'),
    "SEASON": require('./const/season')
};

module.exports = CONST;