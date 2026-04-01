/**
 * Newsletter / destaques (Tools.html) — carrossel horizontal premium.
 * Setas, scroll-snap, barra de progresso, pontos, autoplay (pausa em hover/foco),
 * teclado (←/→), respeita prefers-reduced-motion. Atributos [data-tools-nl-*].
 */
(function () {
    "use strict";

    const root = document.querySelector(".tools-nl");
    if (!root) return;

    const carousel = root.querySelector("[data-tools-nl-carousel]");
    const track = root.querySelector("[data-tools-nl-track]");
    const viewport = root.querySelector(".tools-nl__viewport");
    const btnPrev = root.querySelector("[data-tools-nl-prev]");
    const btnNext = root.querySelector("[data-tools-nl-next]");
    const progressFill = root.querySelector("[data-tools-nl-progress]");
    const dotsWrap = root.querySelector("[data-tools-nl-dots]");
    const panel = root.querySelector(".tools-nl__panel");

    if (!track || !viewport || !btnPrev || !btnNext) return;

    const cards = () => Array.from(track.querySelectorAll(".tools-nl__card"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Espaçamento entre cards (gap do flex) */
    function getGapPx() {
        const g = window.getComputedStyle(track).gap || window.getComputedStyle(track).columnGap;
        const n = parseFloat(g);
        return Number.isFinite(n) ? n : 16;
    }

    function maxScroll() {
        return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function scrollProgress01() {
        const max = maxScroll();
        if (max <= 0) return 1;
        return track.scrollLeft / max;
    }

    function updateProgressBar() {
        if (!progressFill) return;
        const p = scrollProgress01();
        progressFill.style.width = `${(p * 100).toFixed(2)}%`;
    }

    function activeIndex() {
        const list = cards();
        if (!list.length) return 0;
        const sl = track.scrollLeft;
        let best = 0;
        let bestDist = Infinity;
        list.forEach((card, i) => {
            const d = Math.abs(card.offsetLeft - sl);
            if (d < bestDist) {
                bestDist = d;
                best = i;
            }
        });
        return best;
    }

    function updateDots() {
        if (!dotsWrap) return;
        const idx = activeIndex();
        dotsWrap.querySelectorAll(".tools-nl__dot").forEach((dot, i) => {
            const on = i === idx;
            dot.setAttribute("aria-selected", on ? "true" : "false");
            dot.tabIndex = on ? 0 : -1;
        });
    }

    function updateArrows() {
        const max = maxScroll();
        const sl = track.scrollLeft;
        const eps = 4;
        btnPrev.disabled = sl <= eps;
        btnNext.disabled = sl >= max - eps;
    }

    function scrollByStep(dir) {
        const list = cards();
        if (!list.length) return;
        const gap = getGapPx();
        const w = list[0].offsetWidth + gap;
        track.scrollBy({ left: dir * w, behavior: reducedMotion ? "auto" : "smooth" });
    }

    function goTo(index) {
        const list = cards();
        if (!list[index]) return;
        const el = list[index];
        track.scrollTo({
            left: el.offsetLeft,
            behavior: reducedMotion ? "auto" : "smooth",
        });
    }

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        const list = cards();
        list.forEach((_, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "tools-nl__dot";
            b.setAttribute("role", "tab");
            b.setAttribute("aria-label", "Destaque " + (i + 1) + " de " + list.length);
            b.addEventListener("click", function () {
                goTo(i);
            });
            dotsWrap.appendChild(b);
        });
        updateDots();
    }

    let autoTimer = null;
    const AUTO_MS = 5600;

    function clearAuto() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    function tickAuto() {
        if (reducedMotion) return;
        const max = maxScroll();
        const sl = track.scrollLeft;
        if (max <= 0) return;
        if (sl >= max - 6) {
            track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            scrollByStep(1);
        }
    }

    function startAuto() {
        clearAuto();
        if (reducedMotion) return;
        autoTimer = window.setInterval(tickAuto, AUTO_MS);
    }

    function onScroll() {
        updateProgressBar();
        updateArrows();
        updateDots();
    }

    let scrollScheduled = false;
    function onScrollThrottled() {
        if (scrollScheduled) return;
        scrollScheduled = true;
        requestAnimationFrame(function () {
            scrollScheduled = false;
            onScroll();
        });
    }

    btnPrev.addEventListener("click", function () {
        scrollByStep(-1);
    });

    btnNext.addEventListener("click", function () {
        scrollByStep(1);
    });

    track.addEventListener("scroll", onScrollThrottled, { passive: true });

    window.addEventListener(
        "resize",
        function () {
            updateProgressBar();
            updateArrows();
            updateDots();
        },
        { passive: true }
    );

    if (panel) {
        panel.addEventListener("mouseenter", clearAuto);
        panel.addEventListener("mouseleave", startAuto);
        panel.addEventListener("focusin", clearAuto);
        panel.addEventListener("focusout", function (e) {
            if (!panel.contains(e.relatedTarget)) startAuto();
        });
    }

    viewport.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollByStep(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollByStep(1);
        }
    });

    buildDots();
    onScroll();
    startAuto();

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) clearAuto();
        else startAuto();
    });
})();
