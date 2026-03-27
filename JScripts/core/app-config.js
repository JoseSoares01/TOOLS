/**
 * Configuração central do portal (hooks para caminhos e ambiente).
 * Carregar este ficheiro ANTES de outros scripts que usem window.APP.
 *
 * - basePath: detetado automaticamente quando a app está num subcaminho (ex.: /TOOLS/pages/...)
 * - APP.url('/css/x.css') devolve o URL correto em dev e prod
 */
(function (global) {
    "use strict";

    function detectBasePath() {
        var p = String(global.location.pathname || "").replace(/\\/g, "/");
        var pagesIdx = p.indexOf("/pages/");
        if (pagesIdx !== -1) {
            return p.slice(0, pagesIdx) || "";
        }
        var lastSlash = p.lastIndexOf("/");
        if (lastSlash <= 0) return "";
        var file = p.slice(lastSlash + 1);
        if (file && file.indexOf(".") !== -1) {
            return p.slice(0, lastSlash) || "";
        }
        return "";
    }

    var basePath = detectBasePath().replace(/\/$/, "");

    function url(path) {
        if (!path) return basePath || "/";
        var normalized = path.charAt(0) === "/" ? path : "/" + path;
        return (basePath || "") + normalized;
    }

    var hostname = (global.location && global.location.hostname) || "";
    var isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "" ||
        /\.local$/i.test(hostname);

    var env = isLocal ? "development" : "production";

    /** Sobrescrever em dev/prod: carregar config/env.override.js antes (opcional) */
    var override = global.__APP_CONFIG_OVERRIDE__ || {};

    global.APP = Object.assign(
        {
            env: env,
            basePath: basePath,
            /** URL absoluta ao site (respeita subpasta) */
            url: url,
            loginUrl: function () {
                return url("/index.html");
            },
            dashboardUrl: function () {
                return url("/pages/Tools.html");
            },
            isDevelopment: function () {
                return env === "development";
            },
            isProduction: function () {
                return env === "production";
            }
        },
        override
    );
})(typeof window !== "undefined" ? window : this);
