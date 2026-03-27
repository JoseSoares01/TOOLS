/**
 * Ambiente de DESENVOLVIMENTO (opcional).
 * Para usar: numa página HTML, carregar ANTES de app-config.js:
 *   <script src="/config/env.dev.js"></script>
 * Ou definir manualmente:
 *   window.__APP_CONFIG_OVERRIDE__ = { env: 'development' };
 *
 * Por defeito, app-config.js já marca como "development" em localhost.
 */
window.__APP_CONFIG_OVERRIDE__ = Object.assign({}, window.__APP_CONFIG_OVERRIDE__ || {}, {
    env: "development"
});
