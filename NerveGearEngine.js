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

            self._real = document.createElement("canvas");
            self._virtual = document.createElement("canvas");

            self._can = document.createElement("canvas");
            self._vie = document.createElement("video");

            self._vie.style.display = "block";
            self._vie.style.width = "100%";
            self._vie.style.height = "100%";


            self._2d = self._real.getContext("2d");
            self._3d = self._virtual.getContext("webgl");
            self._ctx = self._can.getContext("2d");

            var gl = self._gl = new WebGL(self._3d);
            gl.setShaderProgram("TEXTURE_DIRECTIONAL_LIGHTING");

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

            self._gyro_raw = null;
            self._gyro = { X: 0, Y: 0, Z: 0 };
            var gyroscope = self._gyroscope = new Gyroscope({
                frequency: 60
            });

            gyroscope.addEventListener('reading', e => {
                // console.log(e);
                self._gyro_raw = gyroscope;
                self._gyro.X = gyroscope.x;
                self._gyro.Y = gyroscope.y;
                self._gyro.Z = gyroscope.z;
            });
            gyroscope.start();

            function fix_size() {
                var W = self._vid.videoWidth;
                var H = self._vid.videoHeight;
                fix_size = function () {
                    if (W != self._vid.videoWidth){
                        W = self._vid.videoWidth;
                        self._real.width = W;
                        self._virtual.width = W;
                        self._can.width = W;
                        console.log("W:", W);
                    }
                    if (H != self._vid.videoHeight) {
                        H = self._vid.videoHeight;
                        self._real.height = H;
                        self._virtual.height = H;
                        self._can.height = H;
                        console.log("H:", H);
                    }
                    return {W:W,H:H};
                };
                return fix_size();
            }

            function pre_draw_World (ctx) {

                var model = {};


                pre_draw_World = function () {return model;};
                return pre_draw_World();
            }

            function draw_World (ctx, src) {
                pre_draw_World(ctx);

                ctx.beginPath();
                ctx.drawImage(self._vid, 0, 0, self._vid.videoWidth, self._vid.videoHeight);
                ctx.closePath();
                
                ctx.clearRect(0,0,ctx.canvas.with, ctx.canvas.height);

                    // if (w.tada && typeof (w.tada) == "function") {
                    //     w.tada(self, ctx, self._GeoLocation, self._gyro);
                    // }
            }

            function pre_draw_Virtual (ctx, gl) {
                var model = {};

                model.objs = [];

                var obj = {
                    Texture: ctx.createTexture(),
                    buffers: {},
                };

                obj.buffers.positionBuffer = gl.createArrayBuffer([
                    -50, 5, 0, 50, 5, 0, 50, -5, 0, -50, -5, 0
                ]);
                
                obj.buffers.textureBuffer = gl.createArrayBuffer([
                    0, 0, 25, 0, 25, 1.5, 0, 1.5
                ]);
                
                obj.buffers.indexBuffer = gl.createElementArrayBuffer([
                    0, 1, 2, 0, 2, 3
                ]);
                
                // floor normal points upwards
                obj.buffers.normalBuffer = gl.createArrayBuffer([
                    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
                ]);

                ctx.bindTexture(ctx.TEXTURE_2D, obj.Texture);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, 1, 1, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);

                var vid = document.createElement("video");
                vid.addEventListener('timeupdate', function() {
                    var obj = this.obj;
                    obj.Width = this.videoWidth;
                    obj.Height = this.videoHeight;

                    ctx.bindTexture(ctx.TEXTURE_2D, obj.Texture);
                    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, this);
                    // console.log(obj);
                });
                vid.autoplay = true;
                vid.loop = true;
                vid.obj = obj;
                // vid.onload = console.log;
                vid.muted = true;
                vid.src = "media/demo.mp4";
                vid.play();
                console.log(window.vid = vid);
                obj.src = vid;
                model.objs.push(obj);

                pre_draw_Virtual = function () {return model;};
                return pre_draw_Virtual();
            }

            function draw_Virtual (ctx, gl) {
                var model = pre_draw_Virtual(ctx, gl);


                ctx.viewportWidth = ctx.canvas.width;
                ctx.viewportHeight = ctx.canvas.height;
                ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

                // ctx.enable(ctx.CULL_FACE);
                ctx.enable(ctx.DEPTH_TEST);

                gl.clear();
				
                // set field of view at 45 degrees
                // set viewing range between 0.1 and 100 units away.
                gl.perspective(45, 0.1, 150.0);
                gl.identity();

                var camera = self.camera;

                gl.rotate(-camera.pitch, 1, 0, 0);
                gl.rotate(-camera.yaw, 0, 1, 0);
                gl.translate(-camera.x, -camera.y, -camera.z);

                // enable lighting
                gl.enableLighting();
                gl.setAmbientLighting(0.5, 0.5, 0.5);
                gl.setDirectionalLighting(-0.25, -0.25, -1, 0.8, 0.8, 0.8);
                
                // draw obj
                model.objs.forEach(function (obj, index) {
                    gl.save();
                    gl.translate(0, 3.9, -50);
                    gl.pushPositionBuffer(obj.buffers);
                    gl.pushNormalBuffer(obj.buffers);
                    gl.pushTextureBuffer(obj.buffers, obj.Texture);
                    gl.pushIndexBuffer(obj.buffers);
                    gl.drawElements(obj.buffers);
                    gl.restore();
                });
            }

            function degToRad(d) {
                return d * Math.PI / 180;
            }
            self.camera = {
                x: 0,
                y: 1.5,
                z: 5,
                pitch: 0,
                yaw: 0
            };
            self.degToRad = degToRad;
            self.translation = [0, 0, 0];
            self.rotationDeg = [(0), (0), (0)];
            self.rotation = [degToRad(0), degToRad(0), degToRad(0)];
            self.scale = [1, 1, 1];
            self.fieldOfViewRadians = degToRad(60);

            function draw_Debug (ctx) {
                var txt1 = "", txt2 = "";
                txt1 += "GeoLocation: lat=" + self._GeoLocation.latitude + ", long=" + self._GeoLocation.longitude + ", alt=" + self._GeoLocation.altitude + "\n";
                txt2 += "Gyro: " + JSON.stringify(
                    [self._gyro].map(g => {return {X: g.X.toFixed(1),Y: g.Y.toFixed(1),Z: g.Z.toFixed(1)}})
                ) + "\n";

                var txts = [
                    txt1, txt2,
                    "Gyro_RAW: " + JSON.stringify(self._gyro_raw),
                    // "rotationDeg: " + JSON.stringify(self.rotationDeg),
                    // "rotation: " + JSON.stringify(self.rotation),
                    // "translation: " + JSON.stringify(self.translation),
                    "Camera: " + JSON.stringify(self.camera)
                ];

                ctx.beginPath();
                ctx.fillStyle = "#0F0";
                txts.forEach(function (txt, i) {
                    ctx.fillText(txt, 10, 10 * (i+1));
                });
                // ctx.strokeText(txt, 10, 10);
                ctx.closePath();
            }

            function draw_Merge (ctx, c2d, c3d) {
                if (c2d.canvas.width > 0 && c2d.canvas.height > 0) {
                    ctx.drawImage(c2d.canvas, 0, 0, c2d.canvas.width, c2d.canvas.height);
                }
                if (c3d.canvas.width > 0 && c3d.canvas.height > 0) {
                    ctx.drawImage(c3d.canvas, 0, 0, c3d.canvas.width, c3d.canvas.height);
                }
            }

            loopGameFrame(function engineLoop() {
                fix_size();

                draw_World.apply(self, [self._2d, self._vid]);
                draw_Virtual.apply(self, [self._3d, self._gl]);
                draw_Merge.apply(self, [self._ctx, self._2d, self._3d]);
                draw_Debug.apply(self, [self._ctx, self._vid, self._2d, self._3d, self._gl]);

                if (window.tada && window.tada.apply) {
                    window.tada.apply(self, [self._gyro, self._GeoLocation]);
                }

                return true;
            });

            self._el.addEventListener("dblclick", function (e) {
                if (!document.fullscreenElement) {
                    self._el.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                // if( document.pointerLockElement ){
                //     document.exitPointerLock();
                // }else {
                //     this.requestPointerLock = this.requestPointerLock;
                //     this.requestPointerLock();
                // }
            }, false);

            self._el.addEventListener("mousemove", function(evt){
                if( document.pointerLockElement == self._el ){
					// update pitch
					self.camera.pitch -= evt.movementY / gl.getCanvas().height;
					
					// update yaw
					self.camera.yaw -= evt.movementX / gl.getCanvas().width;
					
					// DEBUG
					// console.log( "POINT CAMERA: [ X: " + self.camera.yaw + " , Y: " + self.camera.pitch + " ]" );
				}
            }, false);
        })(this);
    };
    return NerveGearEngine;
})(window);
