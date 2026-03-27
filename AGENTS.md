# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is **Ferramentas Servinform** — a static HTML/CSS/JavaScript internal tools portal for Servinform PT. There is **no build step, no package manager, no backend server, and no database**. All data persistence uses browser `localStorage`. Third-party libraries are loaded from CDNs at runtime.

### Running the dev server

Serve the repository root with any static HTTP server on port **5501** (matching `.vscode/settings.json`):

```sh
python3 -m http.server 5501
```

All HTML files use absolute paths (e.g. `/css/...`, `/pages/...`), so the server **must** be rooted at the repository root (`/workspace`).

### Testing the application

1. Open `http://localhost:5501/` in a browser.
2. Log in with one of the default accounts listed in `LOGIN_README.md` (e.g. `JanyelSVF` / `SVF_010203`).
3. After login you are redirected to `/pages/Tools.html` — the main dashboard with 7 tool modules.

### Linting / automated tests

There are no linters, test frameworks, or CI pipelines configured in this repository. Validation is done manually via the browser.

### Gotchas

- The `.gitignore` file is misspelled as `.gitgnore`; keep this in mind when staging files.
- Internet access is required for full functionality because JavaScript libraries (QRCode.js, pdf-lib, pdf.js, SheetJS, etc.) and fonts are loaded from CDNs.
- The `Html_teste/` directory is a separate template/prototype unrelated to the main application.
