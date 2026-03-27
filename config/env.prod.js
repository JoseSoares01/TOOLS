/**
 * Ambiente de PRODUÇÃO (opcional).
 * Para usar: numa página HTML, carregar ANTES de app-config.js:
 *   <script src="/config/env.prod.js"></script>
 * Ou definir manualmente:
 *   window.__APP_CONFIG_OVERRIDE__ = { env: 'production' };
 */
window.__APP_CONFIG_OVERRIDE__ = Object.assign({}, window.__APP_CONFIG_OVERRIDE__ || {}, {
    env: "production"
});
