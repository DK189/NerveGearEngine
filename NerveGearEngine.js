NerveGearEngine = (function (w) {
    "use strict";

    var NerveGearEngine = function (element) {
        if (!(this instanceof NerveGearEngine)) {
            throw new Error("Please use the 'new' operator!");
        }
        if (!(element instanceof Element)) {
            throw new Error("First argument require Dom_Element!");
        }
    };
    return NerveGearEngine;
})(window);
