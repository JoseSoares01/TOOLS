(function () {
    const track = document.querySelector('[data-tools-nl-track]');
    if (!track) return;

    const STORAGE_KEY = 'svfNewsletterEntries';

    function parseSafe(value, fallback) {
        try { return JSON.parse(value); } catch (e) { return fallback; }
    }

    function getEntries() {
        const defaults = Array.isArray(window.APP_CHANGELOG) ? window.APP_CHANGELOG : [];
        const stored = parseSafe(localStorage.getItem(STORAGE_KEY) || '[]', []);
        const map = new Map();
        defaults.forEach((e) => map.set(e.id, e));
        stored.forEach((e) => map.set(e.id, e));
        return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function saveEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function isAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
            return user.tipo === 'Administrador';
        } catch (e) {
            return false;
        }
    }

    function createCard(entry) {
        const card = document.createElement('article');
        card.className = 'tools-nl__card tools-nl__card--log';
        card.innerHTML = `
            <span class="tools-nl__cat">${entry.type || 'Atualização'}</span>
            <div class="tools-nl__card-top">
                <h3 class="tools-nl__card-title">${entry.title}</h3>
            </div>
            <p class="tools-nl__card-text">${entry.summary || ''}</p>
            <p class="tools-nl__card-text"><strong>${new Date(entry.date).toLocaleDateString('pt-PT')}</strong></p>
        `;
        return card;
    }

    function render() {
        const entries = getEntries().slice(0, 8);
        saveEntries(entries);
        entries.reverse().forEach((entry) => {
            track.insertBefore(createCard(entry), track.firstChild);
        });
    }

    window.addNewsletterEntry = function (entry) {
        if (!entry || !entry.id || !entry.title || !entry.date) return false;
        const list = getEntries().filter((e) => e.id !== entry.id);
        list.push(entry);
        saveEntries(list);
        return true;
    };

    function bindAdminButton() {
        const btn = document.getElementById('add-newsletter-btn');
        if (!btn || !isAdmin()) return;
        btn.hidden = false;
        btn.addEventListener('click', () => {
            const title = prompt('Título da atualização:');
            if (!title) return;
            const type = prompt('Tipo (Melhoria, Correção, Segurança, Sistema):', 'Melhoria') || 'Melhoria';
            const summary = prompt('Resumo da alteração:');
            if (!summary) return;
            const date = new Date().toISOString().slice(0, 10);
            const id = `${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`;
            const ok = window.addNewsletterEntry({ id, date, type, title: title.trim(), summary: summary.trim() });
            if (ok) window.location.reload();
        });
    }

    render();
    bindAdminButton();
})();
