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
                key: "BCP",
                label: "Despesas",
                href: "/pages/BCP.html",
                icon: "/pages/icons/despesas.svg"
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
        this.bindEvents();
        this.setActivePage();
        this.setExpanded(false); // começa sempre recolhida
    }

    createSidebar() {
        const sidebar = document.createElement("aside");
        sidebar.className = "sidebar sidebar--collapsed";
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

document.addEventListener("DOMContentLoaded", () => {
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