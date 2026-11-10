/**
 * Home portal — pesquisa, filtros, data/hora no topo
 */
(function initToolsHome() {
    if (!document.body.classList.contains("home-portal")) return;

    const searchInput = document.getElementById("toolSearch");
    const filters = Array.from(document.querySelectorAll(".portal-filter"));
    const cards = Array.from(document.querySelectorAll(".portal-cards .modern-card"));
    const moduleCount = document.getElementById("moduleCount");
    const dateEl = document.getElementById("portalDate");
    const timeEl = document.getElementById("portalTime");

    let activeFilter = "all";

    function updateDateTime() {
        if (!dateEl || !timeEl) return;
        const now = new Date();
        const weekday = now.toLocaleDateString("pt-PT", { weekday: "long" });
        const dayNum = now.getDate();
        const month = now.toLocaleDateString("pt-PT", { month: "long" });
        const dateLabel = `${weekday}, ${dayNum} de ${month}`;
        dateEl.textContent = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
        timeEl.textContent = now.toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function applyFilters() {
        const query = (searchInput?.value || "").trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const category = card.getAttribute("data-category") || "utilitarios";
            const haystack = `${card.getAttribute("data-search") || ""} ${card.textContent || ""}`.toLowerCase();
            const matchCategory = activeFilter === "all" || category === activeFilter;
            const matchQuery = !query || haystack.includes(query);
            const show = matchCategory && matchQuery;
            card.classList.toggle("is-hidden", !show);
            if (show) visible += 1;
        });

        if (moduleCount) moduleCount.textContent = String(visible);
    }

    filters.forEach((btn) => {
        btn.addEventListener("click", () => {
            activeFilter = btn.getAttribute("data-filter") || "all";
            filters.forEach((item) => {
                const on = item === btn;
                item.classList.toggle("is-active", on);
                item.setAttribute("aria-selected", on ? "true" : "false");
            });
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    document.addEventListener("keydown", (event) => {
        const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
        if (!isMetaK || !searchInput) return;
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    });

    /* Zoom estilo Dock da Apple nos ícones dos cards */
    function initDockZoom() {
        const grid = document.getElementById("toolsGrid");
        if (!grid || !cards.length) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const MAX_SCALE = 1.42;
        const RANGE = 140;

        function visibleCards() {
            return cards.filter((card) => !card.classList.contains("is-hidden"));
        }

        function resetScales() {
            cards.forEach((card) => {
                card.style.setProperty("--dock-scale", "1");
                card.style.setProperty("--dock-z", "0");
                card.classList.remove("is-dock-hot");
            });
        }

        function onMove(event) {
            const list = visibleCards();
            let hottest = null;
            let hottestScale = 1;

            list.forEach((card) => {
                const icon = card.querySelector(".card-icon");
                if (!icon) return;
                const rect = icon.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
                const t = Math.max(0, 1 - dist / RANGE);
                const scale = 1 + (MAX_SCALE - 1) * (0.5 - 0.5 * Math.cos(Math.PI * t));
                card.style.setProperty("--dock-scale", scale.toFixed(3));
                card.style.setProperty("--dock-z", String(Math.round((scale - 1) * 100)));
                card.classList.toggle("is-dock-hot", scale > 1.12);
                if (scale > hottestScale) {
                    hottestScale = scale;
                    hottest = card;
                }
            });

            cards.forEach((card) => {
                if (card !== hottest) card.classList.remove("is-dock-hot");
            });
            if (hottest) hottest.classList.add("is-dock-hot");
        }

        grid.addEventListener("pointermove", onMove);
        grid.addEventListener("pointerleave", resetScales);
        grid.addEventListener("pointercancel", resetScales);
    }

    updateDateTime();
    window.setInterval(updateDateTime, 1000);
    applyFilters();
    initDockZoom();
})();
