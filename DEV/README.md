# Ambiente de desenvolvimento

Use sempre um servidor HTTP local (não abra `index.html` diretamente em `file://`, ou os caminhos dinâmicos podem falhar).

## Opção A — Python

Na raiz do projeto:

```bash
python -m http.server 5173
```

Abrir: `http://localhost:5173/`

## Opção B — npm

Na raiz do projeto:

```bash
npm install
npm run dev
```

## Hooks de caminhos

O ficheiro `JScripts/core/app-config.js` expõe `window.APP.url('/css/...')` para funcionar também quando a app está num subcaminho (ex.: `/TOOLS/`).
