# Ambientes (DEV / PROD)

## Estrutura

| Pasta / ficheiro | Função |
|------------------|--------|
| `JScripts/core/app-config.js` | **Hook central**: `window.APP` (basePath, `url()`, ambiente) |
| `config/env.dev.js` | Override opcional para marcar como desenvolvimento |
| `config/env.prod.js` | Override opcional para marcar como produção |
| `dev/` | Documentação e scripts para testar localmente |
| `prod/` | Notas de deploy para produção |

## Fluxo recomendado

1. **Desenvolvimento**: servidor local (`dev/README.md`), testar em `http://localhost`.
2. **Produção**: upload para o servidor; o mesmo código; `APP` deteta o host.

## Dependências entre scripts

- Carregar primeiro: `JScripts/core/app-config.js`
- Depois: scripts de negócio (`database-manager.js`, `SidebarMenu.js`, etc.)
