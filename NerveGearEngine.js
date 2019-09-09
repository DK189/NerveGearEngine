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
                    }
                    if (H != self._vid.videoHeight) {
                        H = self._vid.videoHeight;
                        self._real.height = H;
                        self._virtual.height = H;
                        self._can.height = H;
                    }
                    return {W:W,H:H};
                };
                return fix_size();
            }

            function draw_Debug (ctx) {
                var txt1 = "", txt2 = "";
                txt1 += "GeoLocation: lat=" + self._GeoLocation.latitude + ", long=" + self._GeoLocation.longitude + ", alt=" + self._GeoLocation.altitude + "\n";
                txt2 += "Gyro: " + JSON.stringify(
                    [self._gyro].map(g => {return {X: g.X.toFixed(1),Y: g.Y.toFixed(1),Z: g.Z.toFixed(1)}})
                ) + "\n";

                var txts = [
                    txt1, txt2,
                    "Gyro_RAW: " + JSON.stringify(self._gyro_raw)
                ];

                ctx.beginPath();
                ctx.fillStyle = "#0F0";
                txts.forEach(function (txt, i) {
                    ctx.fillText(txt, 10, 10 * (i+1));
                });
                // ctx.strokeText(txt, 10, 10);
                ctx.closePath();
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

                draw_Debug(ctx);
                
                ctx.clearRect(0,0,ctx.canvas.with, ctx.canvas.height);

                    // if (w.tada && typeof (w.tada) == "function") {
                    //     w.tada(self, ctx, self._GeoLocation, self._gyro);
                    // }
            }

            function pre_draw_Virtual (ctx) {

                var model = {};

                var fragmentGLSL = "" +
                    "precision mediump float;\n" +
                    "varying vec2 v_texcoord;\n" +
                    "uniform sampler2D u_texture;\n"+
                    "void main() {\n"+
                       "gl_FragColor = texture2D(u_texture, v_texcoord);\n"+
                    "}\n";
                var vertexGLSL = "" +
                    "attribute vec4 a_position;\n"+
                    "attribute vec2 a_texcoord;\n"+
                    "uniform mat4 u_matrix;\n"+
                    "varying vec2 v_texcoord;\n"+
                    "void main() {\n"+
                        "gl_Position = u_matrix * a_position;\n"+
                        "v_texcoord = a_texcoord;\n"+
                    "}\n"

                var fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);
                ctx.shaderSource(fragmentShader, fragmentGLSL);
                ctx.compileShader(fragmentShader);

                var vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
                ctx.shaderSource(vertexShader, vertexGLSL);
                ctx.compileShader(vertexShader);

                var program =  webglUtils.createProgramFromScripts(ctx, ["drawImage-vertex-shader", "drawImage-fragment-shader", "3d-vertex-shader", "3d-fragment-shader"]);

                if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
                    alert("Could not initialize shaders");
                }
                
                ctx.useProgram(program);
                model.program = program;

                  // look up where the vertex data needs to go.
                var positionLocation = ctx.getAttribLocation(program, "a_position");
                var texcoordLocation = ctx.getAttribLocation(program, "a_texcoord");

                // lookup uniforms
                var matrixLocation = ctx.getUniformLocation(program, "u_matrix");
                var textureLocation = ctx.getUniformLocation(program, "u_texture");

                // Create a buffer.
                var positionBuffer = ctx.createBuffer();
                ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
                // Put a unit quad in the buffer
                var positions = [
                  0, 0,
                  0, 1,
                  1, 0,
                  1, 0,
                  0, 1,
                  1, 1,
                ];
                ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(positions), ctx.STATIC_DRAW);

                // Create a buffer for texture coords
                var texcoordBuffer = ctx.createBuffer();
                ctx.bindBuffer(ctx.ARRAY_BUFFER, texcoordBuffer);
                // Put texcoords in the buffer
                var texcoords = [
                    0, 0,
                    0, 1,
                    1, 0,
                    1, 0,
                    0, 1,
                    1, 1,
                ];
                ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texcoords), ctx.STATIC_DRAW);


                model.positionLocation = positionLocation;
                model.texcoordLocation = texcoordLocation;
                model.matrixLocation = matrixLocation;
                model.textureLocation = textureLocation;
                model.positionBuffer = positionBuffer;
                model.texcoordBuffer = texcoordBuffer;








                model.objs = [];

                var obj = {
                    Texture: ctx.createTexture()
                };
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
                vid.onload = console.log;
                vid.src = "media/demo.mp4";
                console.log(window.vid = vid);

                model.objs.push(obj);

                pre_draw_Virtual = function () {return model;};
                return pre_draw_Virtual();
            }

            function draw_Virtual (ctx) {
                var model = pre_draw_Virtual(ctx);

                ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.clear(ctx.COLOR_BUFFER_BIT);

                ctx.enable(ctx.CULL_FACE);
                ctx.enable(ctx.DEPTH_TEST);
                


                model.objs.forEach(function (obj, index) {
                    drawImage(
                        ctx, model.program,
                        model.positionLocation,
                        model.texcoordLocation,
                        model.matrixLocation,
                        model.textureLocation,
                        model.positionBuffer,
                        model.texcoordBuffer,
                        obj.Texture, obj.Width, obj.Height,
                        100, 100, obj.Width, obj.Height
                    );
                });

                // Compute the matrix
                var aspect = ctx.viewportWidth / ctx.viewportHeight;
                var zNear = 1;
                var zFar = 2000;
                var matrix = m4.perspective(self.fieldOfViewRadians, aspect, zNear, zFar);
                matrix = m4.translate(matrix, self.translation[0], self.translation[1], self.translation[2]);
                matrix = m4.xRotate(matrix, self.rotation[0]);
                matrix = m4.yRotate(matrix, self.rotation[1]);
                matrix = m4.zRotate(matrix, self.rotation[2]);
                matrix = m4.scale(matrix, self.scale[0], self.scale[1], self.scale[2]);

                // Set the matrix.
                ctx.uniformMatrix4fv(model.matrixLocation, false, matrix);
            }

            function degToRad(d) {
                return d * Math.PI / 180;
            }

            self.degToRad = degToRad;
            self.translation = [-150, 0, -360];
            self.rotation = [degToRad(190), degToRad(40), degToRad(320)];
            self.scale = [1, 1, 1];
            self.fieldOfViewRadians = degToRad(60);

            function drawImage(
                gl, program,
                positionLocation,
                texcoordLocation,
                matrixLocation,
                textureLocation,
                positionBuffer,
                texcoordBuffer,
                tex, texWidth, texHeight,
                dstX, dstY, dstWidth, dstHeight
            ) {
                if (dstWidth === undefined) {
                    dstWidth = texWidth;
                }

                if (dstHeight === undefined) {
                    dstHeight = texHeight;
                }

                gl.bindTexture(gl.TEXTURE_2D, tex);

                // Tell WebGL to use our shader program pair
                gl.useProgram(program);

                // Setup the attributes to pull data from our buffers
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
                gl.enableVertexAttribArray(texcoordLocation);
                gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

                // this matirx will convert from pixels to clip space
                var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

                // this matrix will translate our quad to dstX, dstY
                matrix = m4.translate(matrix, dstX, dstY, 0);

                // this matrix will scale our 1 unit quad
                // from 1 unit to texWidth, texHeight units
                matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

                // Set the matrix.
                gl.uniformMatrix4fv(matrixLocation, false, matrix);

                // Tell the shader to get the texture from texture unit 0
                gl.uniform1i(textureLocation, 0);

                // draw the quad (2 triangles, 6 vertices)
                gl.drawArrays(gl.TRIANGLES, 0, 6);
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
                draw_Virtual.apply(self, [self._3d]);
                draw_Merge.apply(self, [self._ctx, self._2d, self._3d]);

                if (window.tada) {
                    window.tada(self, self._gyro);
                }

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
