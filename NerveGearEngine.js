NerveGearEngine = (function (w) {
    "use strict";

    function loopGameFrame(func) {
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
            }, 1000 / 60);
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

        (async function runner(self) {
            var requestUserMediaConstraints = {
                audio: false,
                video: {
                    facingMode: "environment"
                }
            };

            var stream = await navigator.mediaDevices.getUserMedia(requestUserMediaConstraints);
            self._stream = stream;
            self._vid = document.createElement("video");
            self._can = document.createElement("canvas");
            self._vie = document.createElement("video");

            // self._vid.style.display = "block";
            // self._vid.style.width = "100%";
            // self._vid.style.height = "100%";
            //
            // self._can.style.display = "block";
            // self._can.style.width = "100%";
            // self._can.style.height = "100%";

            self._vie.style.display = "block";
            self._vie.style.width = "100%";
            self._vie.style.height = "100%";


            self._2d = self._can.getContext("2d");

            self._vid.autoplay = true;
            self._vie.autoplay = true;

            self._vid.mute = true;

            self._vid.srcObject = self._stream;
            self._vie.srcObject = self._can.captureStream();

            // self._el.append(self._vid);
            // self._el.append(self._can);
            self._el.append(self._vie);

            self._GeoLocation = {};

            self._geolocation_watchID = navigator.geolocation.watchPosition(function (position) {
                // console.log(position);
                self._GeoLocation = position.coords;
            }, console.error, {
                enableHighAccuracy: true,
            });

            self._gyro = { X: 0, Y: 0, Z: 0 };
            var gyroscope = self._gyroscope = new Gyroscope({
                frequency: 60
            });

            gyroscope.addEventListener('reading', e => {
                // console.log(e);
                self._gyro.X = gyroscope.x;
                self._gyro.Y = gyroscope.y;
                self._gyro.Z = gyroscope.z;
            });
            gyroscope.start();

            loopGameFrame(function engineLoop() {
                var canvas = self._can;
                var ctx = self._2d;

                ctx.canvas.width = self._vid.videoWidth;
                ctx.canvas.height = self._vid.videoHeight;

                var txt1 = "", txt2 = "";
                txt1 += "GeoLocation: lat=" + self._GeoLocation.latitude + ", long=" + self._GeoLocation.longitude + ", alt=" + self._GeoLocation.altitude + "\n";
                txt2 += "Gyro: " + JSON.stringify(
                    [self._gyro].map(g => {return {X: g.X.toFixed(1),Y: g.Y.toFixed(1),Z: g.Z.toFixed(1)}})
                ) + "\n";

                ctx.beginPath();
                ctx.fillStyle = "#0F0";
                ctx.drawImage(self._vid, 0, 0, self._vid.videoWidth, self._vid.videoHeight);
                ctx.fillText(txt1, 10, 10);
                ctx.fillText(txt2, 10, 20);
                // ctx.strokeText(txt, 10, 10);
                ctx.closePath();

                if (w.tada && typeof (w.tada) == "function") {
                    w.tada(self, ctx, self._GeoLocation, self._gyro);
                }

                ctx.clearRect(0,0,canvas.with, canvas.height);

                return true;
            });

            self._el.addEventListener("dblclick", function (e) {
                if (!document.fullscreenElement) {
                    self._el.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            });
        })(this);
    };
    return NerveGearEngine;
})(window);
