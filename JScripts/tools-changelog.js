(function () {
    const track = document.querySelector("[data-tools-nl-track]");
    if (!track) return;

    const SOURCE_URL = "/data/newsletter.txt";
    const CACHE_KEY = "svfNewsletterCache";
    const FALLBACK_LIMIT = 8;
    const PORTAL_PREVIEW = 3;
    const PREVIEW_CHARS = 110;
    const refreshButton = document.getElementById("refresh-newsletter-btn");
    const toggleButton = document.getElementById("portal-updates-toggle");
    const updatesRoot = document.querySelector(".portal-updates");
    const isPortal = document.body.classList.contains("home-portal");

    let allEntries = [];
    let showAllItems = false;

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
            type: String(entry.type || "Comunicado"),
            title: String(entry.title || `Atualização ${fallbackIndex}`),
            summary: String(entry.summary || ""),
            date
        };
    }

    function cleanSummary(text) {
        return String(text || "")
            .replace(/`[^`]*`/g, "")
            .replace(/<\/?code[^>]*>/gi, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function previewSummary(text) {
        const clean = cleanSummary(text);
        if (clean.length <= PREVIEW_CHARS) return clean;
        return `${clean.slice(0, PREVIEW_CHARS - 1).trim()}…`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
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
            .filter((line) => line.toLowerCase() !== "newsletter");

        const entries = [];
        lines.forEach((line, index) => {
            const pipeParts = line.split("|").map((part) => part.trim());
            if (pipeParts.length >= 4 && /^\d+$/.test(pipeParts[0])) {
                const order = Number(pipeParts[0]);
                entries.push(
                    normalizeEntry(
                        {
                            id: `txt-${order}`,
                            type: pipeParts[1],
                            title: pipeParts[2],
                            summary: pipeParts.slice(3).join(" | ")
                        },
                        order
                    )
                );
                return;
            }

            const match = line.match(/^(\d+)\s*[-.)]?\s*(.+)$/);
            if (!match) return;
            const order = Number(match[1]);
            const text = match[2].trim();
            entries.push(
                normalizeEntry(
                    {
                        id: `txt-${order}`,
                        type: "Comunicado",
                        title: `Atualização ${order}`,
                        summary: text
                    },
                    index + 1
                )
            );
        });

        return entries
            .sort((a, b) => Number(a.id.replace(/\D/g, "")) - Number(b.id.replace(/\D/g, "")))
            .slice(-FALLBACK_LIMIT);
    }

    function saveCache(entries) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    }

    function loadCache() {
        return parseSafe(localStorage.getItem(CACHE_KEY) || "[]", []);
    }

    function createCard(entry) {
        const card = document.createElement("article");
        const dateLabel = new Date(entry.date).toLocaleDateString("pt-PT");
        const full = cleanSummary(entry.summary);
        const preview = previewSummary(entry.summary);
        const needsToggle = full.length > PREVIEW_CHARS;

        if (isPortal) {
            card.className = "updates-item tools-nl__card tools-nl__card--log";
            card.dataset.fullText = full;
            card.dataset.previewText = preview;
            card.innerHTML = `
                <span class="updates-dot" aria-hidden="true"></span>
                <div class="updates-item-body">
                    <h3 class="updates-item-title tools-nl__card-title">${escapeHtml(entry.title)}</h3>
                    <p class="updates-item-text tools-nl__card-text">${escapeHtml(preview)}</p>
                    ${
                        needsToggle
                            ? `<button type="button" class="updates-item-more" aria-expanded="false">Ver mais</button>`
                            : ""
                    }
                    <time class="updates-item-date" datetime="${escapeHtml(entry.date)}">${escapeHtml(dateLabel)}</time>
                </div>
            `;
            return card;
        }

        card.className = "tools-nl__card tools-nl__card--log";
        card.innerHTML = `
            <span class="tools-nl__cat">${escapeHtml(entry.type || "Atualização")}</span>
            <div class="tools-nl__card-top">
                <h3 class="tools-nl__card-title">${escapeHtml(entry.title)}</h3>
            </div>
            <p class="tools-nl__card-text">${escapeHtml(preview)}</p>
            <p class="tools-nl__card-text"><strong>${escapeHtml(dateLabel)}</strong></p>
        `;
        return card;
    }

    function getPortalEntries() {
        const newestFirst = allEntries.slice().reverse();
        if (showAllItems) return newestFirst;
        return newestFirst.slice(0, PORTAL_PREVIEW);
    }

    function syncListToggle() {
        if (!toggleButton) return;
        const hasMore = allEntries.length > PORTAL_PREVIEW;
        toggleButton.hidden = !hasMore;
        toggleButton.textContent = showAllItems ? "Ver menos" : "Ver todas";
        if (updatesRoot) {
            updatesRoot.classList.toggle("is-list-expanded", showAllItems);
        }
    }

    function render(entries) {
        allEntries = Array.isArray(entries) ? entries.slice() : [];
        track.innerHTML = "";
        const list = isPortal ? getPortalEntries() : allEntries;
        list.forEach((entry) => {
            track.appendChild(createCard(entry));
        });
        syncListToggle();
        window.dispatchEvent(new CustomEvent("tools-newsletter:entries-updated"));
    }

    function setRefreshButtonState(isLoading) {
        if (!refreshButton) return;
        refreshButton.disabled = isLoading;
        refreshButton.textContent = isLoading ? "A atualizar..." : "Atualizar";
    }

    async function fetchEntriesFromTxt() {
        const response = await fetch(`${SOURCE_URL}?t=${Date.now()}`, {
            cache: "no-store"
        });
        if (!response.ok) {
            throw new Error(`Falha ao carregar ${SOURCE_URL}`);
        }
        const text = await response.text();
        const entries = parseNewsletterText(text);
        if (!entries.length) {
            throw new Error("Arquivo newsletter vazio ou fora do formato");
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

    if (isPortal && track) {
        track.addEventListener("click", (event) => {
            const btn = event.target.closest(".updates-item-more");
            if (!btn) return;
            const card = btn.closest(".updates-item");
            if (!card) return;

            const textEl = card.querySelector(".updates-item-text");
            const expanded = card.classList.toggle("is-text-expanded");
            if (textEl) {
                textEl.textContent = expanded
                    ? card.dataset.fullText || ""
                    : card.dataset.previewText || "";
            }
            btn.textContent = expanded ? "Ver menos" : "Ver mais";
            btn.setAttribute("aria-expanded", expanded ? "true" : "false");
        });
    }

    if (toggleButton && isPortal) {
        toggleButton.addEventListener("click", () => {
            showAllItems = !showAllItems;
            render(allEntries);
        });
    }

    if (refreshButton) {
        refreshButton.hidden = false;
        refreshButton.addEventListener("click", refreshFromSource);
    }

    /* Portal: sempre começa com só 3 */
    showAllItems = false;
    render(loadCache().length ? loadCache() : getFallbackEntries());
    refreshFromSource();
})();
