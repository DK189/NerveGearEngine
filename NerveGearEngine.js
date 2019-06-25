NerveGearEngine = (function (w) {
    "use strict";

    function loopGameFrame (func) {
        var request = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;;
        if (!!request) {
            var wrapper = function () {
                if (func() === false) {
                    return;
                }
                request(wrapper);
            };
            wrapper();
        } else {
            var intervalId = false;
            intervalId = setInterval(function () {
                if (func() === false) {
                    clearInterval(intervalId);
                }
            }, 1000/60);
        }
    }

    var NerveGearEngine = function (element) {
        if (!(this instanceof NerveGearEngine)) {
            throw new Error("Please use the 'new' operator!");
        }
        if (!(element instanceof Element)) {
            throw new Error("First argument require Dom_Element!");
        }

        this._el = element;

        (async function runner (self) {
            var stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
            console.log(stream);
            self._stream = stream;
            self._vid = document.createElement("video");
            self._can = document.createElement("canvas");
            self._vie = document.createElement("video");

            self._2d = self._can.getContext("2d");

            loopGameFrame(function () {
                self._2d.drawImage(self._vid, 0, 0, 100, 100);
                return true;
            });

            self._vid.srcObject = self._stream;
            self._vie.srcObject = self._can.captureStream();
            self._vie.style.display = "block";
            self._vie.style.width = "100%";
            self._vie.style.height = "100%";

            self._el.append(self._vid);
            self._el.append(self._can);
            self._el.append(self._vie);
        })(this);
    };
    return NerveGearEngine;
})(window);
