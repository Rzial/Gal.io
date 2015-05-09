var whatType = Object.prototype.toString;

module.exports = {
    isObject: function(object) {
    return (whatType.call(object) === "[object Object]");
    },

    isFunction: function(object) {
        return (whatType.call(object) === "[object Function]");
    },

    isArray : function(object) {
        return (whatType.call(object) === "[object Array]");
    },

    isString: function(object) {
        return (whatType.call(object) === "[object String]");
    },

    isNumber: function(object) {
        return (whatType.call(object) === "[object Number]");
    }
};