(function (w) {
    "use strict";
    console.log("NerveGearSoft", NerveGearEngine);
    console.log(w.e = new NerveGearEngine(document.querySelector("nerve-gear")));

    w.addEventListener("click", function () {
        var a = {
            x: (e._can.width / 2) - 75, y: (e._can.height / 2) - 50,
            w: 150, h: 100
        };
        w.tada = function (self, ctx, _GeoLocation, _gyro) {
            a.x	+= (_gyro.X * 10);
            a.y	-= (_gyro.Y * 10);
        
            ctx.beginPath();
            ctx.fillStyle = "#00F";
            ctx.fillRect(a.x, a.y, a.w, a.h);
            ctx.closePath();
        };
    });

})(window);
