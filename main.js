(function (w) {
    "use strict";
    console.log("NerveGearSoft", NerveGearEngine);
    console.log(w.e = new NerveGearEngine(document.querySelector("nerve-gear")));

    w.addEventListener("click", function () {
        w.tada = function (self, gyro) {
            self.rotation[0] += (gyro.X * 10);
            self.rotation[1] += (gyro.Y * 10);

            // ctx.beginPath();
            // ctx.fillStyle = "#00F";
            // ctx.fillRect(a.x, a.y, a.w, a.h);
            // ctx.closePath();
        };
    });

})(window);
