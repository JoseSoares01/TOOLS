class SidebarTheme {
    static getDayTotal(now = new Date()) {
        return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    }

    static getRangeProgress(current, start, end) {
        if (current <= start) return 0;
        if (current >= end) return 1;
        return (current - start) / (end - start);
    }

    static getThemeByTime(now = new Date()) {
        const total = this.getDayTotal(now);

        if (total >= 7 && total < 12) return "morning";
        if (total >= 12 && total < 13) return "midday";
        if (total >= 13 && total < 17) return "afternoon";
        if (total >= 17 && total < 18) return "sunset";
        return "night";
    }

    /** No Dashboard o body já tem o tema do sol — espelhamos para ficar em sincronia */
    static resolveTheme(now = new Date()) {
        const bodyTheme = document.body && document.body.getAttribute("data-theme");
        if (bodyTheme) return bodyTheme;
        return this.getThemeByTime(now);
    }

    static applyAmbientGlow(el, now = new Date()) {
        const total = this.getDayTotal(now);
        const theme = el.getAttribute("data-theme") || this.resolveTheme(now);

        const sunriseProgress = this.getRangeProgress(total, 7, 8);
        const middayProgress = this.getRangeProgress(total, 12, 13);
        const sunsetProgress = this.getRangeProgress(total, 16, 17);
        const duskProgress = this.getRangeProgress(total, 17, 18);

        let nightProgress = 1;
        if (total >= 17 && total <= 18) {
            nightProgress = duskProgress;
        } else if (total > 18 || total < 7) {
            nightProgress = 1;
        } else {
            nightProgress = 0;
        }

        let ambientLeft = "transparent";
        let ambientRight = "transparent";

        if (theme === "morning") {
            const dawnWarm = 0.22 + sunriseProgress * 0.32;
            const dawnCool = 0.10 + sunriseProgress * 0.12;
            ambientLeft = `rgba(255, 212, 120, ${dawnWarm.toFixed(2)})`;
            ambientRight = `rgba(135, 204, 255, ${dawnCool.toFixed(2)})`;
        } else if (theme === "midday") {
            ambientLeft = `rgba(255, 235, 170, ${(0.48 + middayProgress * 0.1).toFixed(2)})`;
            ambientRight = `rgba(125, 205, 255, ${(0.24 + middayProgress * 0.08).toFixed(2)})`;
        } else if (theme === "afternoon") {
            const afternoonWarm = 0.26 + sunsetProgress * 0.14;
            const afternoonCool = 0.15 + sunsetProgress * 0.06;
            ambientLeft = `rgba(255, 180, 96, ${afternoonWarm.toFixed(2)})`;
            ambientRight = `rgba(255, 132, 96, ${afternoonCool.toFixed(2)})`;
        } else if (theme === "sunset") {
            ambientLeft = `rgba(255, 120, 88, ${(0.34 + duskProgress * 0.18).toFixed(2)})`;
            ambientRight = `rgba(139, 92, 246, ${(0.18 + duskProgress * 0.12).toFixed(2)})`;
        } else {
            const moonGlow = 0.08 + nightProgress * 0.10;
            ambientLeft = `rgba(90, 140, 220, ${moonGlow.toFixed(2)})`;
            ambientRight = `rgba(79, 140, 255, ${(0.06 + nightProgress * 0.05).toFixed(2)})`;
        }

        el.style.setProperty("--sb-ambient-left", ambientLeft);
        el.style.setProperty("--sb-ambient-right", ambientRight);
        el.style.setProperty("--sb-night-strength", nightProgress.toFixed(3));
    }

    static apply(sidebar, now = new Date()) {
        const el = sidebar || document.querySelector(".sidebar");
        if (!el) return;

        const theme = this.resolveTheme(now);
        if (el.getAttribute("data-theme") !== theme) {
            el.setAttribute("data-theme", theme);
        }

        this.applyAmbientGlow(el, now);
    }

    static start(sidebar) {
        this._sidebar = sidebar;
        this.apply(sidebar);

        if (this._timer) return;
        this._timer = window.setInterval(() => this.apply(this._sidebar), 1000);
    }
}

class SidebarMenu {
    constructor() {
        this.sidebar = null;
        this.currentPage = this.getCurrentPage();
        this.storageKey = "sidebarExpanded";
        this.autoCollapseMs = 3000; // 3 segundos
        this._collapseTimer = null;

        this.items = [
            {
                key: "Tools",
                label: "Dashboard",
                href: "/pages/Tools.html",
                icon: "/pages/icons/dashboard.svg"
            },
            {
                key: "Trivalor",
                label: "Trivalor",
                href: "/pages/Trivalor.html",
                icon: "/pages/icons/qrcode.svg"
            },
            {
                key: "SplitPDF",
                label: "Editor de PDFs",
                href: "/pages/SplitPDF.html",
                icon: "/pages/icons/pdf.svg"
            },
            {
                key: "Convert",
                label: "Conversor de Imagens",
                href: "/pages/Convert.html",
                icon: "/pages/icons/convert.svg"
            },
            {
                key: "ServinformSite",
                label: "Calculadora IVA",
                href: "/pages/ServinformSite.html",
                icon: "/pages/icons/calculadora.svg"
            },
            {
                key: "winzinkemails",
                label: "Distribuição de Custos",
                href: "/pages/winzinkemails.html",
                icon: "/pages/icons/custos.svg"
            },
            {
                key: "buscarcidades",
                label: "Encontrar Cidades",
                href: "/pages/buscarcidades.html",
                icon: "/pages/icons/cidades.svg"
            },
            {
                key: "Pedidos",
                label: "Pedidos",
                href: "/pages/Pedidos.html",
                icon: "/pages/icons/email.svg"
            },
            {
                key: "Manuais",
                label: "Manuais",
                href: "/pages/Manuais.html",
                icon: "/pages/icons/pdf.svg"
            }
        ];

        this.items = this.items.map((item) => ({
            ...item,
            href: this.resolveUrl(item.href),
            icon: this.resolveUrl(item.icon)
        }));

        this.init();
    }

    /** Usa window.APP.url (app-config.js) quando existir — suporta subpastas em prod */
    resolveUrl(path) {
        if (window.APP && typeof window.APP.url === "function") {
            return window.APP.url(path);
        }
        return path;
    }

    init() {
        this.createSidebar();
        SidebarTheme.start(this.sidebar);
        this.bindEvents();
        this.setActivePage();
        this.setExpanded(false); // começa sempre recolhida
    }

    createSidebar() {
        const sidebar = document.createElement("aside");
        sidebar.className = "sidebar sidebar--collapsed";
        sidebar.setAttribute("data-theme", "night");
        sidebar.setAttribute("aria-label", "Menu lateral");
        sidebar.setAttribute("aria-expanded", "false");

        const navItemsHtml = this.items.map((item) => {
            const tooltip = item.label.replace(/"/g, "&quot;");

            return `
                <li class="sidebar-item">
                    <a
                        class="sidebar-link"
                        href="${item.href}"
                        data-page="${item.key}"
                        title="${tooltip}"
                        aria-label="${tooltip}"
                    >
                        <img class="sidebar-icon" src="${item.icon}" alt="">
                        <span class="sidebar-label">${item.label}</span>
                    </a>
                </li>
            `;
        }).join("");

        sidebar.innerHTML = `
            <div class="sidebar-shell">
                <div class="sidebar-top">
                    <div class="sidebar-brand">
                        <img class="sidebar-brand-logo" src="${this.resolveUrl("/images/Logo-Lateral.png")}" alt="Servinform">
                        <span class="sidebar-brand-text">Ferramentas</span>
                    </div>
                </div>

                <nav class="sidebar-nav" aria-label="Páginas">
                    <ul class="sidebar-list">
                        ${navItemsHtml}
                    </ul>
                </nav>

                <div class="sidebar-bottom">
                    <button class="logout-btn" type="button" title="Logout" aria-label="Logout">
                        <span class="logout-icon" aria-hidden="true"></span>
                        <span class="logout-label">Logout</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    }

    bindEvents() {
        if (!this.sidebar) return;

        // Expande automaticamente ao entrar com o mouse
        this.sidebar.addEventListener("mouseenter", () => {
            this.clearAutoCollapse();
            this.setExpanded(true);
        });

        // Quando sai com o mouse, agenda recolher
        this.sidebar.addEventListener("mouseleave", () => {
            this.scheduleAutoCollapse();
        });

        // Se mover dentro do menu, mantém aberto
        this.sidebar.addEventListener("mousemove", () => {
            if (this.sidebar.classList.contains("sidebar--expanded")) {
                this.clearAutoCollapse();
            }
        });

        // Mantém acessível por teclado
        this.sidebar.addEventListener("focusin", () => {
            this.clearAutoCollapse();
            this.setExpanded(true);
        });

        this.sidebar.addEventListener("focusout", () => {
            this.scheduleAutoCollapse();
        });

        // Clique em links e logout
        this.sidebar.addEventListener("click", (event) => {
            const logoutBtn = event.target.closest(".logout-btn");
            if (logoutBtn) {
                this.handleLogout();
                return;
            }

            const link = event.target.closest("a.sidebar-link");
            if (link) {
                this.handleNavigation(link);
            }
        });
    }

    setActivePage() {
        const links = this.sidebar.querySelectorAll(".sidebar-link");

        links.forEach((link) => {
            const pageKey = link.getAttribute("data-page");
            if (pageKey === this.currentPage) {
                link.classList.add("current-page");
            }
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const file = path.split("/").pop() || "Tools.html";
        return file.replace(".html", "");
    }

    setExpanded(expanded) {
        if (!this.sidebar) return;

        this.sidebar.classList.toggle("sidebar--expanded", expanded);
        this.sidebar.classList.toggle("sidebar--collapsed", !expanded);

        document.body.classList.toggle("sidebar-expanded", expanded);
        document.body.classList.toggle("sidebar-collapsed", !expanded);

        this.sidebar.setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    clearAutoCollapse() {
        if (this._collapseTimer) {
            clearTimeout(this._collapseTimer);
            this._collapseTimer = null;
        }
    }

    scheduleAutoCollapse() {
        this.clearAutoCollapse();

        this._collapseTimer = setTimeout(() => {
            this.setExpanded(false);
        }, this.autoCollapseMs);
    }

    handleNavigation(link) {
        if (!link?.href) return;

        link.style.pointerEvents = "none";
        link.style.opacity = "0.7";
        document.body.classList.add("fade-out");

        setTimeout(() => {
            window.location.href = link.href;
        }, 180);
    }

    handleLogout() {
        const btn = this.sidebar.querySelector(".logout-btn");
        if (btn) btn.classList.add("logging-out");

        localStorage.removeItem("usuarioLogado");
        document.body.classList.add("fade-out");

        setTimeout(() => {
            var dest =
                window.APP && typeof window.APP.loginUrl === "function"
                    ? window.APP.loginUrl()
                    : "/index.html";
            window.location.replace(dest);
        }, 600);
    }
}

class TopBlurOverlay {
    constructor(options = {}) {
        this.options = {
            height: options.height || "96px"
        };
        this.element = null;
        this._ticking = false;
        this._onScroll = this.onScroll.bind(this);
    }

    ensure() {
        if (typeof document === "undefined") return null;

        const existing = document.querySelector(".top-blur-overlay");
        if (existing) {
            this.element = existing;
            return existing;
        }

        const overlay = document.createElement("div");
        overlay.className = "top-blur-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.setProperty("--top-blur-height", this.options.height);

        document.body.appendChild(overlay);
        this.element = overlay;
        this.updateVisibility();
        window.addEventListener("scroll", this._onScroll, { passive: true });
        return overlay;
    }

    onScroll() {
        if (this._ticking) return;
        this._ticking = true;

        requestAnimationFrame(() => {
            this.updateVisibility();
            this._ticking = false;
        });
    }

    updateVisibility() {
        if (!this.element) return;
        const shouldShow = window.scrollY > 0;
        this.element.classList.toggle("is-visible", shouldShow);
    }
}

if (typeof window !== "undefined") {
    window.TopBlurOverlay = TopBlurOverlay;
    window.SidebarTheme = SidebarTheme;
}

document.addEventListener("DOMContentLoaded", () => {
    const topBlurOverlay = new TopBlurOverlay();
    topBlurOverlay.ensure();
    new SidebarMenu();
});

if (typeof window !== "undefined" && typeof window.logout !== "function") {
    window.logout = function logout() {
        const btn = document.querySelector(".sidebar .logout-btn") || document.querySelector(".logout-btn");
        if (btn) btn.classList.add("logging-out");

        localStorage.removeItem("usuarioLogado");
        document.body.classList.add("fade-out");

        setTimeout(() => {
            var dest =
                window.APP && typeof window.APP.loginUrl === "function"
                    ? window.APP.loginUrl()
                    : "/index.html";
            window.location.replace(dest);
        }, 600);
    };
}