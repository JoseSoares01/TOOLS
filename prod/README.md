# Ambiente de produção

1. **Publicar** o conteúdo da raiz do repositório (HTML, `css/`, `JScripts/`, `pages/`, `images/`, etc.) no servidor web.
2. **Não** é necessário copiar pasta `dev/` para o servidor (só documentação local).
3. Opcional: em páginas que queiram forçar `production`, carregar `config/env.prod.js` **antes** de `JScripts/core/app-config.js` (o `app-config.js` já deteta produção pelo hostname).

## Caminhos

Se o site for servido num subcaminho (ex.: `https://dominio.com/TOOLS/`), o `app-config.js` calcula o prefixo automaticamente a partir do URL.
