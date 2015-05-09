# Gal.io

Gal.io is an adaptation of the Leage of Legends public API. Actually Gal.io is prepared to be used with client JavaScript and Node.js.

### First steps
An example to get the champion list through the Champion endpoint.

To begin, take the file gal.io.js from the build folder in this repository. You can install it and build it using node NPM.
##### Browser
```
<script src="gal.io.js"></script>
<script>
    var request = Gal.io(<my_api_key>, <region>); //Get an Api key in https://developer.riotgames.com/
                                                  //Region are defined in
                                                  //Gal.CONST.REGIONAL_ENDPOINT[<choosen>].region
                                                  //https://developer.riotgames.com/docs/game-constants

    request.Champion(function (err, res) {
        // XHR response. You can get the error code or the response body in plain text.
        console.log(res.body);
    }

    // You can use the same parameters available in the official documentation
    request.Champion({freeToPlay: true}, function (err, res) {
        // XHR response. You can get the error code or the response body in plain text.
        console.log(res.body);
    }
</script>
```

##### Node.js
```
var Gal = require('gal.io');

var request = Gal.io(<my_api_key>, <region>); //Get an Api key in https://developer.riotgames.com/
                                              //Region are defined in
                                              //Gal.CONST.REGIONAL_ENDPOINT[<choosen>].region
                                              //https://developer.riotgames.com/docs/game-constants

request.Champion(function (err, res) {
    // XHR response. You can get the error code or the response body in plain text.
    console.log(res.body);
}

// Optionally, you can use the same parameters available in the official documentation
request.Champion({freeToPlay: true}, function (err, res) {
    // XHR response. You can get the error code or the response body in plain text.
    console.log(res.body);
}
```
### Constants
All the constants available the [game constants reference](https://developer.riotgames.com/docs/game-constants) and [regional endpoints reference](https://developer.riotgames.com/docs/regional-endpoints) is contained in this library. Actually it is accesible like this.

```
// Following the examples
console.log(Gal.CONST)
```
Some of this constants that are not used directly on the api are not implemented actually (for lazziness xP) but there will be available in a future.

There are some aditional info about this on "Known Issues".

### API Calls
This will be a little summary of all the api calls to see the syntax. Options will be used as the example above. Check the [full reference](https://developer.riotgames.com/api/methods) for more details.

- ***champion***
    - request.Champion([options], callback(err, res))
    - request.Champion.id(id, [options], callback(err, res))
- ***current-game***`*`
    - request.CurrentGame(summonerId, [options], callback(err, res))
- ***featured-games***
    - request.FeaturedGames(callback(err, res))
- ***game***
    - request.Game(summonerId, [options], callback(err, res))
- ***league***
    - request.League.bySummoner(summonerIds, [options], callback(err, res))
    - request.League.bySummoner.entry(summonerIds, [options], callback(err, res))
    - request.League.byTeam(teamIds, [options], callback(err, res))
    - request.League.byTeam.entry(teamIds, [options], callback(err, res))
    - request.League.challenger([options], callback(err, res))
    - request.League.master([options], callback(err, res))
- ***lol-static-data***
    - request.LOLStaticData.champion([options], callback(err, res))
    - request.LOLStaticData.champion.id(id, [options], callback(err, res))
    - request.LOLStaticData.item([options], callback(err, res))
    - request.LOLStaticData.item.id(id, [options], callback(err, res))
    - request.LOLStaticData.languageStrings([options], callback(err, res))
    - request.LOLStaticData.languages([options], callback(err, res))
    - request.LOLStaticData.map([options], callback(err, res))
    - request.LOLStaticData.mastery([options], callback(err, res))
    - request.LOLStaticData.mastery.id(id, [options], callback(err, res))
    - request.LOLStaticData.realm([options], callback(err, res))
    - request.LOLStaticData.rune([options], callback(err, res))
    - request.LOLStaticData.rune.id(id, [options], callback(err, res))
    - request.LOLStaticData.summonerSpell([options], callback(err, res))
    - request.LOLStaticData.summonerSpell.id(id, [options], callback(err, res))
    - request.LOLStaticData.versions([options], callback(err, res))
- ***lol-status***
    - request.LOLStatus([options], callback(err, res))
    - request.LOLStatus.region(region, [options], callback(err, res))
- ***match***
    - request.Match(matchId, [options], callback(err, res))
- ***matchhistory***
    - request.MatchHistory(summonerId, [options], callback(err, res))
- ***stats***
    - request.Stats.ranked(summonerId, [options], callback(err, res))
    - request.Stats.summary(summonerId, [options], callback(err, res))
- ***summoner***
    - request.Summoner(summonerIds, [options], callback(err, res))
    - request.Summoner.masteries(summonerIds, [options], callback(err, res))
    - request.Summoner.runes(summonerIds, [options], callback(err, res))
    - request.Summoner.getName(summonerIds, [options], callback(err, res))`**`
    - request.Summoner.byName(summonerNames, [options], callback(err, res))
- ***team***
    - request.Team(teamIds, [options], callback(err, res))
    - request.Team.bySummoner(summonerIds, [options], callback(err, res))

`*`Actually not available check "Known Issues".

`**` This reques was modified from the original (with name "name") because of technical issues.

`***` When there are multiples id involved you can give an array to the function, a number, a string or the original way, a comma separated string.

### Known Issues
- The constants related with the runes slots and the map coordinates are not implemented.
- Some custom constants (undocumented) were added.
  - Seasons (for the Stat endpoint)
  - The "Status" regional endpoint for the "lol-status" endpoint.
- The endpoint "current-game" don't work because a problem with the CORS policy of the request.