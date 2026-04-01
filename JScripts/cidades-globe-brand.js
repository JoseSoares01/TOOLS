/**
 * Globo de partículas (Three.js) — buscarcidades · #cidadesParticleGlobe
 *
 * PROBLEMA TÉCNICO (antes):
 * - Máscaras procedurais (gradiente/noise) ou limiar em length(rgb) sobre cores arbitrárias
 *   não reproduzem terra/oceano reais → contornos “inventados”.
 * - Animação por shift de UV deslocava a textura em relação à malha e piorava a costura.
 *
 * AGORA:
 * - Máscara equiretangular REAL (mapa especular oficial dos exemplos Three.js: terra vs oceano).
 * - Fragment: threshold robusto no canal .r (com inversão opcional).
 * - UV estáveis; rotação só no mesh (rotation.y). Partículas brancas. Sem rato/hover.
 */
(function () {
    "use strict";

    var LAND_MASK_URL =
        "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";
    var POINT_SPRITE_URL = "https://threejs.org/examples/textures/sprites/circle.png";

    /** Abaixo disto = oceano (descartar). Ajuste fino 0.04–0.12 conforme o mapa. */
    var LAND_THRESHOLD = 0.06;
    /** 1 = usar (1.0 - r) se oceano vier mais claro que o continente no .r */
    var INVERT_LAND_MASK = 0;

    function whenThreeReady(fn) {
        if (typeof THREE !== "undefined") {
            fn();
            return;
        }
        var i = 0;
        var id = setInterval(function () {
            if (typeof THREE !== "undefined") {
                clearInterval(id);
                fn();
            } else if (++i > 120) {
                clearInterval(id);
            }
        }, 40);
    }

    whenThreeReady(function () {
        var container = document.getElementById("cidadesParticleGlobe");
        if (!container) return;

        var camera;
        var scene;
        var renderer;
        var particles;
        var clock;
        var rafId = 0;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        var ROTATION_SPEED = 0.22;

        function getDims() {
            var rect = container.getBoundingClientRect();
            var w = rect.width || container.clientWidth || 268;
            var h = rect.height || container.clientHeight || 268;
            w = Math.max(120, Math.min(w, 640));
            h = Math.max(120, Math.min(h, 640));
            return { w: w, h: h };
        }

        function pointScaleForHeight(h) {
            return Math.max(h / 2.8, 125);
        }

        function onResize() {
            if (!renderer || !camera || !particles) return;
            var dims = getDims();
            if (dims.w < 8 || dims.h < 8) return;
            camera.aspect = dims.w / dims.h;
            camera.updateProjectionMatrix();
            renderer.setSize(dims.w, dims.h);
            if (particles.material.uniforms && particles.material.uniforms.scale) {
                particles.material.uniforms.scale.value = pointScaleForHeight(dims.h);
            }
        }

        function tick() {
            rafId = requestAnimationFrame(tick);
            if (document.hidden || !renderer || !scene || !camera || !particles) return;
            if (!reduceMotion) {
                var dt = clock.getDelta();
                particles.rotation.y += dt * ROTATION_SPEED;
            }
            renderer.render(scene, camera);
        }

        function buildScene(landMaskTex, spriteTex, dims) {
            if (particles) return;

            landMaskTex.flipY = false;
            landMaskTex.wrapS = THREE.ClampToEdgeWrapping;
            landMaskTex.wrapT = THREE.ClampToEdgeWrapping;
            landMaskTex.minFilter = THREE.LinearMipmapLinearFilter;
            landMaskTex.magFilter = THREE.LinearFilter;
            landMaskTex.generateMipmaps = true;
            landMaskTex.needsUpdate = true;

            camera = new THREE.PerspectiveCamera(11, dims.w / dims.h, 0.1, 1000);
            camera.position.set(0, 0, 132);

            scene = new THREE.Scene();
            clock = new THREE.Clock();

            var geometry = new THREE.SphereGeometry(8.2, 200, 120);
            var scaleU = pointScaleForHeight(dims.h);

            particles = new THREE.Points(
                geometry,
                new THREE.ShaderMaterial({
                    uniforms: {
                        landMask: { value: landMaskTex },
                        shape: { value: spriteTex },
                        size: { value: 1.45 },
                        scale: { value: scaleU },
                        uLandThreshold: { value: LAND_THRESHOLD },
                        uInvertMask: { value: INVERT_LAND_MASK },
                    },
                    vertexShader: [
                        "uniform float scale;",
                        "uniform float size;",
                        "varying vec2 vUv;",
                        "void main() {",
                        "  vUv = uv;",
                        "  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
                        "  gl_PointSize = size * (scale / max(8.0, length(mvPosition.xyz)));",
                        "  gl_Position = projectionMatrix * mvPosition;",
                        "}",
                    ].join("\n"),
                    fragmentShader: [
                        "uniform sampler2D landMask;",
                        "uniform sampler2D shape;",
                        "uniform float uLandThreshold;",
                        "uniform float uInvertMask;",
                        "varying vec2 vUv;",
                        "void main() {",
                        "  vec2 uv = vec2(fract(vUv.x), clamp(vUv.y, 0.001, 0.999));",
                        "  float m = texture2D(landMask, uv).r;",
                        "  if (uInvertMask > 0.5) m = 1.0 - m;",
                        "  if (m < uLandThreshold) discard;",
                        "  vec4 shapeData = texture2D(shape, gl_PointCoord);",
                        "  if (shapeData.a < 0.32) discard;",
                        "  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * shapeData;",
                        "}",
                    ].join("\n"),
                    transparent: true,
                    depthWrite: false,
                })
            );

            scene.add(particles);

            try {
                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                    powerPreference: "default",
                });
            } catch (e) {
                return;
            }

            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(dims.w, dims.h);
            renderer.setClearColor(0x000000, 0);
            container.appendChild(renderer.domElement);
            renderer.domElement.style.pointerEvents = "none";

            window.addEventListener("resize", onResize);
            if (typeof ResizeObserver !== "undefined") {
                new ResizeObserver(onResize).observe(container);
            }

            if (reduceMotion) {
                renderer.render(scene, camera);
            } else {
                rafId = requestAnimationFrame(tick);
            }
        }

        function makeCanvasSprite() {
            var c = document.createElement("canvas");
            c.width = 64;
            c.height = 64;
            var ctx = c.getContext("2d");
            var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 31);
            g.addColorStop(0, "rgba(255,255,255,1)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(c);
        }

        function startFromTextures() {
            var dims = getDims();
            if (dims.w < 8) dims.w = 268;
            if (dims.h < 8) dims.h = 268;

            var landTex;
            var spriteTex;
            var loadCalls = 0;

            function afterLoads() {
                loadCalls++;
                if (loadCalls < 2) return;
                if (!landTex) return;
                if (!spriteTex) spriteTex = makeCanvasSprite();
                buildScene(landTex, spriteTex, dims);
            }

            var tl = new THREE.TextureLoader();
            tl.setCrossOrigin("anonymous");

            tl.load(
                LAND_MASK_URL,
                function (t) {
                    landTex = t;
                    afterLoads();
                },
                undefined,
                function () {
                    landTex = null;
                    afterLoads();
                }
            );

            tl.load(
                POINT_SPRITE_URL,
                function (t) {
                    spriteTex = t;
                    afterLoads();
                },
                undefined,
                function () {
                    spriteTex = null;
                    afterLoads();
                }
            );
        }

        var _initTries = 0;

        function init() {
            var dims = getDims();
            if ((dims.w < 8 || dims.h < 8) && _initTries++ < 100) {
                requestAnimationFrame(init);
                return;
            }
            startFromTextures();
        }

        document.addEventListener("visibilitychange", function () {
            if (!particles || reduceMotion) return;
            if (document.hidden) {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = 0;
                }
            } else if (!rafId) {
                rafId = requestAnimationFrame(tick);
            }
        });

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
                requestAnimationFrame(init);
            });
        } else {
            requestAnimationFrame(init);
        }
    });
})();
