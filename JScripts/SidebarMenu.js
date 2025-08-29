// Sidebar Menu Management
class SidebarMenu {
    constructor() {
        this.sidebar = null;
        this.toggle = null;
        this.isCollapsed = false;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.createSidebar();
        this.createToggle();
        this.bindEvents();
        this.setActivePage();
        this.loadSidebarState();
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <img src="/images/Logo-Lateral.png" alt="Logo Servinform">
                <h3>Ferramentas</h3>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li><a href="/pages/Tools.html" data-title="Dashboard Principal">
                        <i>🏠</i>Dashboard
                    </a></li>
                    <li><a href="/pages/Trivalor.html" data-title="Gerador QR Trivalor">
                        <i>📱</i>Trivalor
                    </a></li>
                    <li><a href="/pages/BCP.html" data-title="Gerador QR Despesas">
                        <i>💳</i>BCP Despesas
                    </a></li>
                    <li><a href="/pages/SplitPDF.html" data-title="Editor de PDFs">
                        <i>📄</i>Split PDF
                    </a></li>
                    <li><a href="/pages/Convert.html" data-title="Conversor de Imagens">
                        <i>🖼️</i>Conversor
                    </a></li>
                    <li><a href="/pages/ServinformSite.html" data-title="Calculadora IVA">
                        <i>🧮</i>Calculadora IVA
                    </a></li>
                    <li><a href="/pages/Calculadora_gastos.html" data-title="Calculadora de Gastos">
                        <i>💰</i>Calculadora Gastos
                    </a></li>
                </ul>
            </nav>
        `;

        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'sidebar-toggle';
        toggle.innerHTML = '<img src="/images/icone_menu_navegação.png" alt="Menu" class="toggle-icon">';
        toggle.title = 'Alternar Menu';
        
        document.body.appendChild(toggle);
        this.toggle = toggle;
    }

    bindEvents() {
        // Toggle sidebar
        this.toggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                !this.toggle.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle navigation clicks
        this.sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.handleNavigation(e.target);
            }
        });
    }

    toggleSidebar() {
        if (this.isCollapsed) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
    }

    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        document.body.classList.add('with-sidebar');
        this.isCollapsed = true;
        this.saveSidebarState();
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        document.body.classList.add('with-sidebar');
        this.isCollapsed = false;
        this.saveSidebarState();
    }

    closeSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        }
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('collapsed');
            document.body.classList.remove('with-sidebar');
        } else {
            if (this.isCollapsed) {
                document.body.classList.add('with-sidebar');
            }
        }
    }

    setActivePage() {
        const links = this.sidebar.querySelectorAll('a');
        links.forEach(link => {
            if (link.href.includes(this.currentPage)) {
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

    saveSidebarState() {
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    }

    loadSidebarState() {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true' && window.innerWidth > 768) {
            this.collapseSidebar();
        } else {
            document.body.classList.add('with-sidebar');
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidebarMenu();
});

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarMenu;
}
