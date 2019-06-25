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
        this._el.style.background = "#000";

        (async function runner (self) {
            var requestUserMediaConstraints = {
                video: {

                }
            };

            var devs = await navigator.mediaDevices.enumerateDevices();
            var cams = devs.filter(function (dev) {return dev.kind == "videoinput";})
            alert(JSON.stringify(cams));
            var backCams = cams.filter(function (cam) {return cam.label.indexOf("back") > -1});
            if (backCams.length > 0) {
                requestUserMediaConstraints.deviceId = {
                    exact: backCams[0].deviceId
                }
            } else if (cams.length > 0) {
                requestUserMediaConstraints.deviceId = {
                    exact: cams[0].deviceId
                }
            }
            var stream = await navigator.mediaDevices.getUserMedia(requestUserMediaConstraints);
            self._stream = stream;
            self._vid = document.createElement("video");
            self._can = document.createElement("canvas");
            self._vie = document.createElement("video");

            self._vid.style.display = "block";
            self._vid.style.width = "100%";
            self._vid.style.height = "100%";

            self._can.style.display = "block";
            self._can.style.width = "100%";
            self._can.style.height = "100%";

            self._vie.style.display = "block";
            self._vie.style.width = "100%";
            self._vie.style.height = "100%";


            self._2d = self._can.getContext("2d");

            loopGameFrame(function () {
                self._can.width = self._vid.videoWidth;
                self._can.height = self._vid.videoHeight;

                self._2d.beginPath();
                self._2d.drawImage(self._vid, 0, 0, self._vid.videoWidth, self._vid.videoHeight);
                self._2d.closePath();
                return true;
            });

            self._vid.autoplay = true;
            self._vie.autoplay = true;
            self._vid.srcObject = self._stream;
            self._vie.srcObject = self._can.captureStream();

            // self._el.append(self._vid);
            // self._el.append(self._can);
            self._el.append(self._vie);
        })(this);
    };
    return NerveGearEngine;
})(window);
