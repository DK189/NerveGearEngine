(function (w) {
    "use strict";
    console.log("NerveGearSoft", NerveGearEngine);
    console.log(w.e = new NerveGearEngine(document.querySelector("nerve-gear")));

    w.addEventListener("click", function () {
        w.tada = function (self, gyro) {
            // self.rotationDeg[0] += parseInt(gyro.X * 10) / 10;
            // self.rotationDeg[1] += parseInt(gyro.Y * 10) / 10;
            // self.rotationDeg[2] += parseInt(gyro.Z * 10 ) / 10;

            self.rotationDeg[0] += gyro.X;
            self.rotationDeg[1] += gyro.X;
            self.rotationDeg[2] += gyro.X;

            self.rotationDeg[0] = self.rotationDeg[0] % 360;
            self.rotationDeg[1] = self.rotationDeg[1] % 360;
            self.rotationDeg[2] = self.rotationDeg[2] % 360;

            self.rotation[0] = self.degToRad(self.rotationDeg[0]);
            self.rotation[1] = self.degToRad(self.rotationDeg[1]);
            self.rotation[2] = self.degToRad(self.rotationDeg[2]);

            // ctx.beginPath();
            // ctx.fillStyle = "#00F";
            // ctx.fillRect(a.x, a.y, a.w, a.h);
            // ctx.closePath();
        };
    });

})(window);
