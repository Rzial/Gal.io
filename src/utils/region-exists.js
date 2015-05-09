var CONST = require('../core/const');

module.exports = function (region, callback) {
    if (CONST.REGIONAL_ENDPOINT[region] === undefined) {
        callback("Error: Region not provided or invalid.");
        return false;
    }

    return true;
};