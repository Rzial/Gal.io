/**
 * League of Legends API
 *  Matchmacking Queues
 *
 */

var MATCHMAKING_QUEUES = {
    "CUSTOM": {
        "queueType": "CUSTOM",
        "gameQueueConfigId": 0,
        "name": "Custom games"
    },

    "NORMAL_5x5_BLIND": {
        "queueType": "NORMAL_5x5_BLIND",
        "gameQueueConfigId": 2,
        "name": "Normal 5v5 Blind Pick games"
    },

    "BOT_5x5": {
        "queueType": "BOT_5x5",
        "gameQueueConfigId": 7,
        "name": "Historical Summoner's Rift Coop vs AI games"
    },

    "BOT_5x5_INTRO": {
        "queueType": "BOT_5x5_INTRO",
        "gameQueueConfigId": 31,
        "name": "Summoner's Rift Coop vs AI Intro Bot games"
    },

    "BOT_5x5_BEGINNER": {
        "queueType": "BOT_5x5_BEGINNER",
        "gameQueueConfigId": 32,
        "name": "Summoner's Rift Coop vs AI Beginner Bot games"
    },

    "BOT_5x5_INTERMEDIATE": {
        "queueType": "BOT_5x5_INTERMEDIATE",
        "gameQueueConfigId": 33,
        "name": "Historical Summoner's Rift Coop vs AI Intermediate Bot games"
    },

    "NORMAL_3x3": {
        "queueType": "NORMAL_3x3",
        "gameQueueConfigId": 8,
        "name": "Normal 3v3 games"
    },

    "NORMAL_5x5_DRAFT": {
        "queueType": "NORMAL_5x5_DRAFT",
        "gameQueueConfigId": 14,
        "name": "Normal 5v5 Draft Pick games"
    },

    "ODIN_5x5_BLIND": {
        "queueType": "ODIN_5x5_BLIND",
        "gameQueueConfigId": 16,
        "name": "Dominion 5v5 Blind Pick games"
    },

    "ODIN_5x5_DRAFT": {
        "queueType": "ODIN_5x5_DRAFT",
        "gameQueueConfigId": 17,
        "name": "Dominion 5v5 Draft Pick games"
    },

    "BOT_ODIN_5x5": {
        "queueType": "BOT_ODIN_5x5",
        "gameQueueConfigId": 25,
        "name": "Dominion Coop vs AI games"
    },

    "RANKED_SOLO_5x5": {
        "queueType": "RANKED_SOLO_5x5",
        "gameQueueConfigId": 4,
        "name": "Ranked Solo 5v5 games"
    },

    "RANKED_PREMADE_3x3": {
        "queueType": "RANKED_PREMADE_3x3",
        "gameQueueConfigId": 9,
        "name": "Ranked Premade 3v3 games"
    },

    "RANKED_PREMADE_5x5": {
        "queueType": "RANKED_PREMADE_5x5",
        "gameQueueConfigId": 6,
        "name": "Ranked Premade 5v5 games"
    },

    "RANKED_TEAM_3x3": {
        "queueType": "RANKED_TEAM_3x3",
        "gameQueueConfigId": 41,
        "name": "Ranked Team 3v3 games"
    },

    "RANKED_TEAM_5x5": {
        "queueType": "RANKED_TEAM_5x5",
        "gameQueueConfigId": 42,
        "name": "Ranked Team 5v5 games"
    },

    "BOT_TT_3x3": {
        "queueType": "BOT_TT_3x3",
        "gameQueueConfigId": 52,
        "name": "Twisted Treeline Coop vs AI games"
    },

    "GROUP_FINDER_5x5": {
        "queueType": "GROUP_FINDER_5x5",
        "gameQueueConfigId": 61,
        "name": "Team Builder games"
    },

    "ARAM_5x5": {
        "queueType": "ARAM_5x5",
        "gameQueueConfigId": 65,
        "name": "ARAM games"
    },

    "ONEFORALL_5x5": {
        "queueType": "ONEFORALL_5x5",
        "gameQueueConfigId": 70,
        "name": "One for All games"
    },

    "FIRSTBLOOD_1x1": {
        "queueType": "FIRSTBLOOD_1x1",
        "gameQueueConfigId": 72,
        "name": "Snowdown Showdown 1v1 games"
    },

    "FIRSTBLOOD_2x2": {
        "queueType": "FIRSTBLOOD_2x2",
        "gameQueueConfigId": 73,
        "name": "Snowdown Showdown 2v2 games"
    },

    "SR_6x6": {
        "queueType": "SR_6x6",
        "gameQueueConfigId": 75,
        "name": "Summoner's Rift 6x6 Hexakill games"
    },

    "URF_5x5": {
        "queueType": "URF_5x5",
        "gameQueueConfigId": 76,
        "name": "Ultra Rapid Fire games"
    },

    "BOT_URF_5x5": {
        "queueType": "BOT_URF_5x5",
        "gameQueueConfigId": 83,
        "name": "Ultra Rapid Fire games played against AI games"
    },

    "NIGHTMARE_BOT_5x5_RANK1": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK1",
        "gameQueueConfigId": 91,
        "name": "Doom Bots Rank 1 games"
    },

    "NIGHTMARE_BOT_5x5_RANK2": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK2",
        "gameQueueConfigId": 92,
        "name": "Doom Bots Rank 2 games"
    },

    "NIGHTMARE_BOT_5x5_RANK5": {
        "queueType": "NIGHTMARE_BOT_5x5_RANK5",
        "gameQueueConfigId": 93,
        "name": "Doom Bots Rank 5 games"
    },

    "ASCENSION_5x5": {
        "queueType": "ASCENSION_5x5",
        "gameQueueConfigId": 96,
        "name": "Ascension games"
    },

    "HEXAKILL": {
        "queueType": "HEXAKILL",
        "gameQueueConfigId": 98,
        "name": "Twisted Treeline 6x6 Hexakill games"
    },

    "KING_PORO_5x5": {
        "queueType": "KING_PORO_5x5",
        "gameQueueConfigId": 300,
        "name": "King Poro games"
    },

    "COUNTER_PICK": {
        "queueType": "COUNTER_PICK",
        "gameQueueConfigId": 310,
        "name": "Nemesis games"
    }
};

module.exports = MATCHMAKING_QUEUES;