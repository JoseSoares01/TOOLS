(function () {
    const track = document.querySelector('[data-tools-nl-track]');
    if (!track) return;

    const SOURCE_URL = '/data/newsletter.txt';
    const CACHE_KEY = 'svfNewsletterCache';
    const FALLBACK_LIMIT = 8;
    const refreshButton = document.getElementById('refresh-newsletter-btn');

    function parseSafe(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    }

    function normalizeEntry(entry, fallbackIndex) {
        const date = entry.date || new Date().toISOString().slice(0, 10);
        return {
            id: String(entry.id || `entry-${fallbackIndex}`),
            type: String(entry.type || 'Comunicado'),
            title: String(entry.title || `Atualização ${fallbackIndex}`),
            summary: String(entry.summary || ''),
            date
        };
    }

    function getFallbackEntries() {
        const defaults = Array.isArray(window.APP_CHANGELOG) ? window.APP_CHANGELOG : [];
        return defaults
            .slice(0, FALLBACK_LIMIT)
            .map((entry, index) => normalizeEntry(entry, index + 1));
    }

    function parseNewsletterText(rawText) {
        const lines = rawText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .filter((line) => line.toLowerCase() !== 'newsletter');

        const entries = [];
        lines.forEach((line, index) => {
            const pipeParts = line.split('|').map((part) => part.trim());
            if (pipeParts.length >= 4 && /^\d+$/.test(pipeParts[0])) {
                const order = Number(pipeParts[0]);
                entries.push(normalizeEntry({
                    id: `txt-${order}`,
                    type: pipeParts[1],
                    title: pipeParts[2],
                    summary: pipeParts.slice(3).join(' | ')
                }, order));
                return;
            }

            const match = line.match(/^(\d+)\s*[-.)]?\s*(.+)$/);
            if (!match) return;
            const order = Number(match[1]);
            const text = match[2].trim();
            entries.push(normalizeEntry({
                id: `txt-${order}`,
                type: 'Comunicado',
                title: `Atualização ${order}`,
                summary: text
            }, index + 1));
        });

        return entries
            .sort((a, b) => Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, '')))
            .slice(0, FALLBACK_LIMIT);
    }

    function saveCache(entries) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    }

    function loadCache() {
        return parseSafe(localStorage.getItem(CACHE_KEY) || '[]', []);
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

    function render(entries) {
        track.innerHTML = '';
        entries.forEach((entry) => {
            track.appendChild(createCard(entry));
        });
        window.dispatchEvent(new CustomEvent('tools-newsletter:entries-updated'));
    }

    function setRefreshButtonState(isLoading) {
        if (!refreshButton) return;
        refreshButton.disabled = isLoading;
        refreshButton.textContent = isLoading ? 'A atualizar...' : 'Atualizar newsletter';
    }

    async function fetchEntriesFromTxt() {
        const response = await fetch(`${SOURCE_URL}?t=${Date.now()}`, {
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Falha ao carregar ${SOURCE_URL}`);
        }
        const text = await response.text();
        const entries = parseNewsletterText(text);
        if (!entries.length) {
            throw new Error('Arquivo newsletter vazio ou fora do formato');
        }
        return entries;
    }

    async function refreshFromSource() {
        setRefreshButtonState(true);
        try {
            const entries = await fetchEntriesFromTxt();
            saveCache(entries);
            render(entries);
        } catch (error) {
            const cached = loadCache();
            if (cached.length) {
                render(cached);
            } else {
                render(getFallbackEntries());
            }
        } finally {
            setRefreshButtonState(false);
        }
    }

    if (refreshButton) {
        refreshButton.hidden = false;
        refreshButton.addEventListener('click', refreshFromSource);
    }

    render(loadCache().length ? loadCache() : getFallbackEntries());
    refreshFromSource();
})();
