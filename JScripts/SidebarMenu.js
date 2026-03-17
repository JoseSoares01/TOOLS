// Sidebar Menu Management
class SidebarMenu {
    constructor() {
        this.sidebar = null;
        this.currentPage = this.getCurrentPage();
        this.storageKey = 'sidebarExpanded';
        this.autoCollapseMs = 5000;
        this._collapseTimer = null;
        this.init();
    }

    init() {
        this.createSidebar();
        this.bindEvents();
        this.setActivePage();
        this.applyInitialState();
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar sidebar--collapsed';

        const items = [
            { key: 'Tools', label: 'Dashboard', href: '/pages/Tools.html', icon: '/pages/icons/dashboard.svg' },
            { key: 'Trivalor', label: 'Trivalor', href: '/pages/Trivalor.html', icon: '/pages/icons/qrcode.svg' },
            { key: 'BCP', label: 'Despesas', href: '/pages/BCP.html', icon: '/pages/icons/despesas.svg' },
            { key: 'SplitPDF', label: "Editor de PDFs", href: '/pages/SplitPDF.html', icon: '/pages/icons/pdf.svg' },
            { key: 'Convert', label: 'Conversor de Imagens', href: '/pages/Convert.html', icon: '/pages/icons/convert.svg' },
            { key: 'ServinformSite', label: 'Calculadora IVA', href: '/pages/ServinformSite.html', icon: '/pages/icons/calculadora.svg' },
            { key: 'winzinkemails', label: 'Distribuição de Custos', href: '/pages/winzinkemails.html', icon: '/pages/icons/custos.svg' },
            { key: 'buscarcidades', label: 'Encontrar Cidades', href: '/pages/buscarcidades.html', icon: '/pages/icons/cidades.svg' },
        ];

        const navItemsHtml = items.map((it) => {
            const tooltip = it.label.replace(/"/g, '&quot;');
            return `
                <li class="sidebar-item">
                    <a class="sidebar-link" href="${it.href}" data-page="${it.key}" title="${tooltip}" aria-label="${tooltip}">
                        <img class="sidebar-icon" src="${it.icon}" alt="">
                        <span class="sidebar-label">${it.label}</span>
                    </a>
                </li>
            `;
        }).join('');

        sidebar.innerHTML = `
            <div class="sidebar-shell" role="navigation" aria-label="Menu lateral">
                <div class="sidebar-top">
                    <button class="sidebar-brand" type="button" aria-label="Expandir/Recolher menu" aria-expanded="false">
                        <img class="sidebar-brand-logo" src="/images/Logo-Lateral.png" alt="Servinform">
                        <span class="sidebar-brand-text">Ferramentas</span>
                    </button>
                </div>

                <nav class="sidebar-nav" aria-label="Páginas">
                    <ul class="sidebar-list">
                        ${navItemsHtml}
                    </ul>
                </nav>

                <div class="sidebar-bottom">
                    <button class="logout-btn" type="button" onclick="logout()" title="Logout" aria-label="Logout">
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
        this.sidebar.addEventListener('click', (e) => {
            const brandToggle = e.target.closest?.('.sidebar-brand');
            if (brandToggle) {
                this.toggleSidebar();
                return;
            }

            const link = e.target.closest?.('a.sidebar-link');
            if (link) {
                this.handleNavigation(link);
            }
        });

        // Se estiver expandido, qualquer interação mantém aberto por mais 5s
        const resetIfExpanded = () => {
            if (this.sidebar?.classList.contains('sidebar--expanded')) {
                this.scheduleAutoCollapse();
            }
        };
        this.sidebar.addEventListener('mousemove', resetIfExpanded);
        this.sidebar.addEventListener('focusin', resetIfExpanded);
        this.sidebar.addEventListener('keydown', resetIfExpanded);
    }

    setActivePage() {
        const links = this.sidebar.querySelectorAll('a.sidebar-link');
        links.forEach((link) => {
            const pageKey = link.getAttribute('data-page');
            if (pageKey && pageKey === this.currentPage) {
                link.classList.add('current-page');
            }
        });
    }

    handleNavigation(link) {
        // Add loading state
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.7';
        
        // Navigate after a short delay for better UX
        setTimeout(() => {
            window.location.href = link.href;
        }, 150);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'Tools';
    }

    applyInitialState() {
        // Recolhido por padrão
        const saved = localStorage.getItem(this.storageKey);
        const shouldExpand = saved === '1';
        this.setExpanded(shouldExpand);
    }

    toggleSidebar() {
        const isExpanded = this.sidebar.classList.contains('sidebar--expanded');
        this.setExpanded(!isExpanded);
    }

    setExpanded(expanded) {
        this.sidebar.classList.toggle('sidebar--expanded', expanded);
        this.sidebar.classList.toggle('sidebar--collapsed', !expanded);
        document.body.classList.toggle('sidebar-expanded', expanded);
        document.body.classList.toggle('sidebar-collapsed', !expanded);

        const toggle = this.sidebar.querySelector('.sidebar-brand');
        if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        localStorage.setItem(this.storageKey, expanded ? '1' : '0');

        if (expanded) this.scheduleAutoCollapse();
        else this.clearAutoCollapse();
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

}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidebarMenu();
});

// Logout global (para funcionar em todas as páginas que usam o SidebarMenu)
if (typeof window !== 'undefined' && typeof window.logout !== 'function') {
    window.logout = function logout() {
        const btn = document.querySelector('.sidebar .logout-btn') || document.querySelector('.logout-btn');
        if (btn) btn.classList.add('logging-out');
        localStorage.removeItem('usuarioLogado');
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.replace('/login.html'); }, 600);
    };
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarMenu;
}
