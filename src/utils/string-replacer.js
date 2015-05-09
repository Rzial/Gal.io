/**
 * League of Legends API
 *  String replacer
 */

module.exports = function (originString, replaceWith, callback) {
    for (var id in replaceWith)
        if (replaceWith.hasOwnProperty(id))
            originString = originString.replace(new RegExp("{" + id + "}"), replaceWith[id]);

    var matches = originString.match(new RegExp("{.*?}", "g"));

    callback(matches, originString);
};